-- Create an upcoming session first
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
  'Advanced JavaScript Concepts',
  'Deep dive into closures, promises, and async/await',
  id,
  NULL,
  CURRENT_TIMESTAMP + INTERVAL '2 days',
  90,
  'https://meet.ednova.com/upcoming-session-1',
  'scheduled'
FROM users
WHERE email = 'ukexe06@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM sessions WHERE host_id = users.id AND status = 'scheduled'
);

-- Create a completed session with proper timestamps
WITH new_session AS (
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
    'Introduction to Programming',
    'Basic programming concepts and fundamentals',
    id,
    (SELECT id FROM users WHERE email = 'ukexe10@gmail.com'),
    CURRENT_TIMESTAMP + INTERVAL '1 hour',  -- Future scheduled time
    60,
    'https://meet.ednova.com/completed-session-1',
    'scheduled'::session_status,
    CURRENT_TIMESTAMP - INTERVAL '2 days'  -- Past creation time
  FROM users
  WHERE email = 'ukexe06@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM sessions WHERE host_id = users.id AND status = 'completed'
  )
  RETURNING id, host_id, student_id
)
-- Update it to completed status after creation
UPDATE sessions
SET status = 'completed',
    scheduled_time = CURRENT_TIMESTAMP - INTERVAL '1 day'
WHERE id IN (SELECT id FROM new_session);

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
  'Excellent introduction to programming concepts! The teacher was very patient and explained everything clearly.'
FROM sessions s
WHERE s.host_id = (SELECT id FROM users WHERE email = 'ukexe06@gmail.com')
  AND s.status = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM feedback WHERE session_id = s.id
  ); 