-- Ensure teacher has proper skill level
UPDATE users
SET skill_level = 'Advanced'
WHERE email = 'ukexe06@gmail.com';

-- Create available sessions for booking
INSERT INTO sessions (
  title,
  description,
  host_id,
  scheduled_time,
  duration,
  session_link,
  status
)
SELECT
  'JavaScript Fundamentals',
  'Learn the basics of JavaScript including variables, functions, and control flow',
  id,
  CURRENT_TIMESTAMP + INTERVAL '3 days',
  60,
  'https://meet.ednova.com/session-' || gen_random_uuid(),
  'scheduled'
FROM users
WHERE email = 'ukexe06@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM sessions 
  WHERE host_id = users.id 
  AND status = 'scheduled' 
  AND title = 'JavaScript Fundamentals'
);

-- Create a session that's already booked by the student
INSERT INTO sessions (
  title,
  description,
  host_id,
  student_id,
  scheduled_time,
  duration,
  session_link,
  status
)
SELECT
  'Python for Beginners',
  'Introduction to Python programming language',
  t.id,
  s.id,
  CURRENT_TIMESTAMP + INTERVAL '2 days',
  90,
  'https://meet.ednova.com/session-' || gen_random_uuid(),
  'scheduled'
FROM users t
CROSS JOIN users s
WHERE t.email = 'ukexe06@gmail.com'
AND s.email = 'ukexe10@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM sessions 
  WHERE host_id = t.id 
  AND student_id = s.id
  AND title = 'Python for Beginners'
);

-- Create a completed session with feedback
WITH completed_session AS (
  INSERT INTO sessions (
    title,
    description,
    host_id,
    student_id,
    scheduled_time,
    duration,
    session_link,
    status,
    created_at
  )
  SELECT
    'Web Development Basics',
    'Introduction to HTML, CSS, and JavaScript',
    t.id,
    s.id,
    CURRENT_TIMESTAMP + INTERVAL '1 hour',
    60,
    'https://meet.ednova.com/session-' || gen_random_uuid(),
    'scheduled',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
  FROM users t
  CROSS JOIN users s
  WHERE t.email = 'ukexe06@gmail.com'
  AND s.email = 'ukexe10@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM sessions 
    WHERE host_id = t.id 
    AND student_id = s.id
    AND title = 'Web Development Basics'
  )
  RETURNING id, host_id, student_id
)
UPDATE sessions
SET status = 'completed',
    scheduled_time = CURRENT_TIMESTAMP - INTERVAL '1 day'
WHERE id IN (SELECT id FROM completed_session);

-- Add feedback for the completed session
INSERT INTO feedback (
  session_id,
  student_id,
  teacher_id,
  rating,
  feedback_text
)
SELECT
  s.id,
  s.student_id,
  s.host_id,
  5,
  'Great session! The teacher explained everything clearly and helped me understand web development concepts.'
FROM sessions s
WHERE s.title = 'Web Development Basics'
AND NOT EXISTS (
  SELECT 1 FROM feedback WHERE session_id = s.id
); 