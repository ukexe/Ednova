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
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TeacherFeedback from '../components/TeacherFeedback';
import { supabase } from '../lib/supabase';

interface Session {
  id: string;
  title: string;
  scheduled_time: string;
  duration: number;
  status: string;
  student: {
    name: string;
  } | null;
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      console.log('TeacherDashboard: User data:', user);
      fetchUpcomingSessions();
    } else {
      console.log('TeacherDashboard: No user data available');
    }
  }, [user]);

  const fetchUpcomingSessions = async () => {
    try {
      console.log('TeacherDashboard: Fetching sessions for user:', user?.id);
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          title,
          scheduled_time,
          duration,
          status,
          student:users!sessions_student_id_fkey (
            name
          )
        `)
        .eq('host_id', user?.id)
        .eq('status', 'scheduled')
        .order('scheduled_time')
        .limit(5);

      if (error) throw error;
      console.log('TeacherDashboard: Fetched sessions:', data);
      setSessions(data || []);
    } catch (error) {
      console.error('TeacherDashboard: Error fetching sessions:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    console.log('TeacherDashboard: Rendering null due to no user');
    return null;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user.name}!
        </Typography>
        <Typography color="text.secondary" paragraph>
          Manage your teaching sessions and view student feedback
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Overview */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Profile Overview
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Skill Level
                </Typography>
                <Typography variant="h5">{user.skill_level || 'Not Assessed'}</Typography>
              </Box>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/profile')}
              >
                View Profile
              </Button>
            </Paper>
          </Grid>

          {/* Upcoming Sessions */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upcoming Sessions
              </Typography>
              <Grid container spacing={2}>
                {sessions.length === 0 ? (
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          No Upcoming Sessions
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          You don't have any scheduled sessions yet.
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          onClick={() => navigate('/sessions/create')}
                        >
                          Create Session
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ) : (
                  sessions.map((session) => (
                    <Grid item xs={12} key={session.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {session.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(session.scheduled_time).toLocaleString()}
                            {' • '}
                            {session.duration} minutes
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Student: {session.student?.name || 'Not booked yet'}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            onClick={() => navigate(`/sessions/${session.id}`)}
                          >
                            View Details
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            </Paper>
          </Grid>

          {/* Teacher Feedback */}
          <Grid item xs={12} md={8}>
            <TeacherFeedback teacherId={user.id} />
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/skill-test')}
                  >
                    Take Skill Test
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/sessions/create')}
                  >
                    Create Session
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default TeacherDashboard; 