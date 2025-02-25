import React, { useState } from 'react';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Alert,
  Paper,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface FeedbackFormProps {
  sessionId: string;
  teacherId: string;
  onSubmitSuccess?: () => void;
}

const FeedbackForm = ({ sessionId, teacherId, onSubmitSuccess }: FeedbackFormProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !rating) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error: feedbackError } = await supabase
        .from('feedback')
        .insert([
          {
            session_id: sessionId,
            student_id: user.id,
            teacher_id: teacherId,
            rating,
            feedback_text: comment.trim() || null,
          },
        ]);

      if (feedbackError) throw feedbackError;

      setSuccess(true);
      setRating(null);
      setComment('');
      onSubmitSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Session Feedback
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Thank you for your feedback!
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography component="legend" gutterBottom>
            Rate your experience
          </Typography>
          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            size="large"
            required
          />
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Additional Comments"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={!rating || loading}
          fullWidth
        >
          Submit Feedback
        </Button>
      </Box>
    </Paper>
  );
};

export default FeedbackForm; 