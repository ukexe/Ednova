import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const SessionsCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledTime, setScheduledTime] = useState<Date | null>(new Date());
  const [duration, setDuration] = useState('60');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generateJitsiLink = (sessionId: string) => {
    const domain = 'meet.jit.si';
    const roomName = `ednova-${sessionId}`;
    return `https://${domain}/${roomName}#userInfo.displayName="${encodeURIComponent(user?.name || '')}"`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !scheduledTime) return;

    setLoading(true);
    setError('');

    try {
      // Validate scheduled time is in the future
      const now = new Date();
      if (scheduledTime < now) {
        throw new Error('Session time must be in the future');
      }

      const sessionId = crypto.randomUUID();
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          id: sessionId,
          host_id: user.id,
          title,
          description,
          scheduled_time: scheduledTime.toISOString(),
          duration: parseInt(duration),
          session_link: generateJitsiLink(sessionId),
          status: 'scheduled',
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        throw new Error(sessionError.message);
      }

      navigate('/sessions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Session
        </Typography>

        <Paper sx={{ p: 4, mt: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Session Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              required
              sx={{ mb: 3 }}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Session Date & Time"
                value={scheduledTime}
                onChange={(newValue) => setScheduledTime(newValue)}
                sx={{ mb: 3, width: '100%' }}
                minDateTime={new Date()}
              />
            </LocalizationProvider>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Duration (minutes)</InputLabel>
              <Select
                value={duration}
                label="Duration (minutes)"
                onChange={(e) => setDuration(e.target.value)}
              >
                <MenuItem value="30">30 minutes</MenuItem>
                <MenuItem value="60">1 hour</MenuItem>
                <MenuItem value="90">1.5 hours</MenuItem>
                <MenuItem value="120">2 hours</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Creating...' : 'Create Session'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SessionsCreate; 