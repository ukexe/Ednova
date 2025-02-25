import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Alert,
  IconButton,
  Drawer,
  TextField,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import FeedbackForm from '../components/FeedbackForm';

interface Session {
  id: string;
  title: string;
  description: string;
  host_id: string;
  student_id: string | null;
  session_link: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduled_time: string;
  duration: number;
  host?: {
    name: string;
    skill_level: string;
  };
  student?: {
    name: string;
  };
}

const VideoSession = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const [note, setNote] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;

      try {
        const { data, error } = await supabase
          .from('sessions')
          .select(`
            *,
            host:users!sessions_host_id_fkey (
              name,
              skill_level
            ),
            student:users!sessions_student_id_fkey (
              name
            )
          `)
          .eq('id', sessionId)
          .single();

        if (error) throw error;
        setSession(data);

        // Check if session is in the past
        if (new Date(data.scheduled_time) < new Date()) {
          setError('This session has already ended');
        }
      } catch (err) {
        setError('Failed to load session details');
      }
    };

    fetchSession();
  }, [sessionId]);

  const saveNote = async () => {
    if (!user || !session || !note.trim()) return;

    try {
      const { error } = await supabase.from('notes').insert([
        {
          session_id: session.id,
          user_id: user.id,
          note_content: note.trim(),
        },
      ]);

      if (error) throw error;
      setNote('');
      setNotesOpen(false);
    } catch (err) {
      setError('Failed to save note');
    }
  };

  const handleEndSession = async () => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .update({ status: 'completed' })
        .eq('id', session.id);

      if (error) throw error;

      // Show feedback form for students
      if (user?.id === session.student_id) {
        setShowFeedback(true);
      } else {
        navigate('/sessions');
      }
    } catch (err) {
      setError('Failed to end session');
    }
  };

  if (!session) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error || 'Session not found'}</Alert>
        </Box>
      </Container>
    );
  }

  // Check if user is authorized to join
  const canJoin = user?.id === session.host_id || user?.id === session.student_id;
  if (!canJoin) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">You are not authorized to join this session</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Typography variant="h5">{session.title}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {new Date(session.scheduled_time).toLocaleString()} • {session.duration} minutes
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Teacher: {session.host?.name} ({session.host?.skill_level})
                  {session.student && ` • Student: ${session.student.name}`}
                </Typography>
              </div>
              <Button
                variant="contained"
                color="error"
                onClick={handleEndSession}
              >
                End Session
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 0, height: '70vh', position: 'relative' }}>
            <iframe
              src={session.session_link}
              allow="camera; microphone; display-capture; fullscreen"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title="Jitsi Meet"
            />

            {/* Action buttons */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 1,
                display: 'flex',
                gap: 1,
              }}
            >
              <IconButton
                color="primary"
                onClick={() => setNotesOpen(true)}
                sx={{ bgcolor: 'white' }}
              >
                <NoteAddIcon />
              </IconButton>
            </Box>
          </Paper>
        </Grid>

        {/* Feedback Form for Students */}
        {showFeedback && user?.id === session.student_id && (
          <Grid item xs={12}>
            <FeedbackForm
              sessionId={session.id}
              teacherId={session.host_id}
              onSubmitSuccess={() => navigate('/sessions')}
            />
          </Grid>
        )}
      </Grid>

      {/* Notes Drawer */}
      <Drawer
        anchor="right"
        open={notesOpen}
        onClose={() => setNotesOpen(false)}
      >
        <Box sx={{ width: 300, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Session Notes
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write your notes here..."
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={saveNote}
            fullWidth
          >
            Save Note
          </Button>
        </Box>
      </Drawer>
    </Container>
  );
};

export default VideoSession; 