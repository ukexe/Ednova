import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Rating,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Skeleton,
} from '@mui/material';
import { supabase } from '../lib/supabase';

interface TeacherFeedbackProps {
  teacherId: string;
}

interface FeedbackItem {
  id: string;
  rating: number;
  feedback_text: string | null;
  created_at: string;
  session: {
    title: string;
  } | null;
}

const TeacherFeedback = ({ teacherId }: TeacherFeedbackProps) => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, [teacherId]);

  const fetchFeedback = async () => {
    try {
      console.log('TeacherFeedback: Fetching feedback for teacher:', teacherId);
      // Fetch feedback with session details
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          id,
          rating,
          feedback_text,
          created_at,
          session:sessions (
            title
          )
        `)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('TeacherFeedback: Received feedback data:', data);
      setFeedback(data || []);

      // Calculate average rating
      if (data && data.length > 0) {
        const avg = data.reduce((sum, item) => sum + item.rating, 0) / data.length;
        setAverageRating(avg);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="text" height={40} />
        <Skeleton variant="text" height={40} />
        <Skeleton variant="rectangular" height={200} />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Teacher Rating
        </Typography>
        {averageRating !== null && (
          <>
            <Rating
              value={averageRating}
              precision={0.1}
              readOnly
              size="large"
            />
            <Typography variant="subtitle1" color="text.secondary">
              {averageRating.toFixed(1)} out of 5 ({feedback.length} reviews)
            </Typography>
          </>
        )}
      </Box>

      <Typography variant="h6" gutterBottom>
        Recent Feedback
      </Typography>

      {feedback.length === 0 ? (
        <Typography color="text.secondary" align="center">
          No feedback yet
        </Typography>
      ) : (
        <List>
          {feedback.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <Divider />}
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={item.rating} readOnly size="small" />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        {new Date(item.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Session: {item.session?.title || 'Untitled Session'}
                      </Typography>
                      {item.feedback_text && (
                        <Typography variant="body2">
                          {item.feedback_text}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default TeacherFeedback; 