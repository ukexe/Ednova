import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Session {
  id: string;
  title: string;
  description: string;
  host_id: string;
  student_id: string | null;
  scheduled_time: string;
  duration: number;
  session_link: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  host: {
    name: string;
    skill_level: string;
  };
}

const SessionsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      console.log('Fetching sessions for user:', user.id, 'role:', user.role);
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          host:users!sessions_host_id_fkey (
            name,
            skill_level
          )
        `)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      console.log('Fetched sessions:', data);
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async (session: Session) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .update({ student_id: user.id })
        .eq('id', session.id)
        .select();

      if (error) throw error;
      
      // Refresh sessions list
      await fetchSessions();
    } catch (error) {
      console.error('Error booking session:', error);
      setError('Failed to book session');
    }
  };

  const handleJoinSession = (session: Session) => {
    // Only allow joining if the session is scheduled and it's within 15 minutes of the start time
    const sessionTime = new Date(session.scheduled_time);
    const now = new Date();
    const timeDiff = sessionTime.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / 1000 / 60);

    if (session.status !== 'scheduled') {
      setError('This session is not available for joining');
      return;
    }

    if (minutesDiff > 15) {
      setError(`This session will be available to join 15 minutes before the scheduled time (${sessionTime.toLocaleString()})`);
      return;
    }

    navigate(`/sessions/${session.id}/join`);
  };

  const handleDeleteSession = async () => {
    if (!selectedSession) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', selectedSession.id);

      if (error) throw error;
      
      // Refresh sessions list
      fetchSessions();
      setDeleteDialogOpen(false);
      setSelectedSession(null);
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const isUpcoming = (date: string) => {
    return new Date(date) > new Date();
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography>Loading sessions...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4" component="h1">
            {user?.role === 'teacher' ? 'My Sessions' : 'Available Sessions'}
          </Typography>
          {user?.role === 'teacher' && (
            <Button
              variant="contained"
              startIcon={<VideoCallIcon />}
              onClick={() => navigate('/sessions/create')}
            >
              Create Session
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {sessions.map((session) => (
            <Grid item xs={12} md={6} key={session.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{session.title}</Typography>
                    <Chip
                      label={session.status}
                      color={getStatusColor(session.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography color="text.secondary" gutterBottom>
                    {new Date(session.scheduled_time).toLocaleString()}
                    {' • '}
                    {session.duration} minutes
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    {session.description}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Teacher: {session.host.name} ({session.host.skill_level})
                    {session.student_id && ' • Booked'}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  {user?.role === 'student' && !session.student_id && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleBookSession(session)}
                    >
                      Book Session
                    </Button>
                  )}

                  {((user?.role === 'teacher' && user.id === session.host_id) ||
                    (user?.role === 'student' && user.id === session.student_id)) && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleJoinSession(session)}
                      startIcon={<VideoCallIcon />}
                    >
                      Join Session
                    </Button>
                  )}
                  
                  {user?.id === session.host_id && session.status === 'scheduled' && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/sessions/${session.id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedSession(session);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Session</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this session?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteSession} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default SessionsList; 