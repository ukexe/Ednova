export type UserRole = 'teacher' | 'student';
export type SkillLevel = 'Basic' | 'Intermediate' | 'Advanced';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  skill_level: SkillLevel | null;
  created_at: string;
  updated_at: string;
}

export interface Teacher extends User {
  role: 'teacher';
  skill_level: SkillLevel;
  averageRating?: number;
  totalRatings?: number;
}

export interface Session {
  id: string;
  teacherId: string;
  studentId: string;
  startTime: string;
  endTime: string;
  jitsiLink: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Note {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  created_at: string;
}

export interface Rating {
  id: string;
  teacherId: string;
  studentId: string;
  sessionId: string;
  rating: number;
  feedback: string;
  created_at: string;
}

export interface SkillTest {
  id: string;
  teacherId: string;
  score: number;
  skillLevel: SkillLevel;
  completed_at: string;
} 