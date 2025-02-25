-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS skill_tests CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS skill_level CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;

-- Create custom types
CREATE TYPE user_role AS ENUM ('teacher', 'student');
CREATE TYPE skill_level AS ENUM ('Basic', 'Intermediate', 'Advanced');
CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- Create users table with auth integration
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email CITEXT NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL,
    skill_level skill_level,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT skill_level_teacher_only CHECK (
        (role = 'teacher' AND skill_level IS NOT NULL) OR
        (role = 'student' AND skill_level IS NULL)
    )
);

-- Create sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE SET NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL CHECK (duration > 0),
    session_link TEXT,
    status session_status DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_session_time CHECK (scheduled_time >= CURRENT_TIMESTAMP)
);

-- Create notes table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create feedback table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT one_feedback_per_session_student UNIQUE (session_id, student_id)
);

-- Create skill_tests table
CREATE TABLE skill_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    result skill_level NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_skill_level ON users(skill_level) WHERE role = 'teacher';
CREATE INDEX idx_sessions_host ON sessions(host_id);
CREATE INDEX idx_sessions_student ON sessions(student_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_scheduled_time ON sessions(scheduled_time);
CREATE INDEX idx_notes_session ON notes(session_id);
CREATE INDEX idx_notes_user ON notes(user_id);
CREATE INDEX idx_feedback_session ON feedback(session_id);
CREATE INDEX idx_feedback_teacher ON feedback(teacher_id);
CREATE INDEX idx_feedback_student ON feedback(student_id);
CREATE INDEX idx_skill_tests_user ON skill_tests(user_id);
CREATE INDEX idx_skill_tests_result ON skill_tests(result);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate teacher rating
CREATE OR REPLACE FUNCTION calculate_teacher_rating(teacher_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    avg_rating NUMERIC;
BEGIN
    SELECT COALESCE(AVG(rating)::NUMERIC(3,2), 0) INTO avg_rating
    FROM feedback
    WHERE teacher_id = teacher_uuid;
    
    RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_tests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users policies
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can view teacher profiles"
    ON users FOR SELECT
    USING (role = 'teacher');

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Enable insert during registration"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Sessions policies
DROP POLICY IF EXISTS "Users can view their sessions" ON sessions;
DROP POLICY IF EXISTS "Students can view available sessions" ON sessions;
DROP POLICY IF EXISTS "Teachers can create sessions" ON sessions;
DROP POLICY IF EXISTS "Teachers can update their sessions" ON sessions;

CREATE POLICY "Users can view their sessions"
    ON sessions FOR SELECT
    USING (
        -- Users can see sessions they're part of
        auth.uid() IN (host_id, student_id)
        OR
        -- Students can see available sessions
        (
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role = 'student'
            )
            AND status = 'scheduled'
            AND student_id IS NULL
            AND scheduled_time > CURRENT_TIMESTAMP
        )
        OR
        -- Teachers can see their own sessions
        (
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role = 'teacher'
            )
            AND host_id = auth.uid()
        )
    );

CREATE POLICY "Students can book sessions"
    ON sessions FOR UPDATE
    USING (
        -- Must be a student
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'student'
        )
        -- Session must be available
        AND status = 'scheduled'
        AND student_id IS NULL
        AND scheduled_time > CURRENT_TIMESTAMP
    )
    WITH CHECK (
        -- Can only update student_id field
        student_id = auth.uid()
    );

CREATE POLICY "Teachers can create sessions"
    ON sessions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'teacher'
        )
        AND host_id = auth.uid()
    );

CREATE POLICY "Teachers can update their sessions"
    ON sessions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'teacher'
        )
        AND host_id = auth.uid()
        AND status = 'scheduled'
    );

-- Notes policies
CREATE POLICY "Users can manage their notes"
    ON notes FOR ALL
    USING (auth.uid() = user_id);

-- Feedback policies
CREATE POLICY "Students can create feedback"
    ON feedback FOR INSERT
    WITH CHECK (
        auth.uid() = student_id
    );

CREATE POLICY "Users can view relevant feedback"
    ON feedback FOR SELECT
    USING (auth.uid() IN (student_id, teacher_id));

-- Skill tests policies
CREATE POLICY "Teachers can manage skill tests"
    ON skill_tests FOR ALL
    USING (auth.uid() = user_id);

-- Create buckets for file storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT DO NOTHING;

-- Set up storage policies
CREATE POLICY "Anyone can view profile images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile image"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'profile-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own profile image"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'profile-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own profile image"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'profile-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );