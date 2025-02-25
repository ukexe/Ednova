import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'student';
  skill_level?: 'Basic' | 'Intermediate' | 'Advanced';
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) return null;

  const getSkillLevelColor = (level?: string) => {
    switch (level) {
      case 'Advanced':
        return 'success';
      case 'Intermediate':
        return 'warning';
      case 'Basic':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {profile.name}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {profile.email}
            </Typography>
            <Chip
              label={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              color="primary"
              sx={{ mr: 1 }}
            />
            {profile.role === 'teacher' && (
              <Chip
                label={profile.skill_level || 'Not Assessed'}
                color={getSkillLevelColor(profile.skill_level)}
                variant={profile.skill_level ? 'filled' : 'outlined'}
              />
            )}
          </Box>

          {profile.role === 'teacher' && !profile.skill_level && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" paragraph>
                Complete the skill assessment to start teaching.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/skill-test')}
              >
                Take Skill Assessment
              </Button>
            </Box>
          )}

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Member since: {new Date(profile.created_at).toLocaleDateString()}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 