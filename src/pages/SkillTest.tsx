import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  LinearProgress,
  Alert,
} from '@mui/material';
import { skillTestQuestions, Question } from '../data/skillTestQuestions';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { SkillLevel } from '../types';

const SkillTest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user is a teacher
    const checkUserRole = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || data?.role !== 'teacher') {
        navigate('/');
      }
    };

    checkUserRole();
  }, [user, navigate]);

  const handleAnswer = (answer: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < skillTestQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateSkillLevel = (score: number): SkillLevel => {
    if (score >= 80) return 'Advanced';
    if (score >= 50) return 'Intermediate';
    return 'Basic';
  };

  const handleSubmit = async () => {
    if (answers.length !== skillTestQuestions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Calculate score
      const correctAnswers = answers.reduce((count, answer, index) => {
        return count + (answer === skillTestQuestions[index].correctAnswer ? 1 : 0);
      }, 0);

      const score = (correctAnswers / skillTestQuestions.length) * 100;
      const skillLevel = calculateSkillLevel(score);

      // Update user's skill level
      const { error: updateError } = await supabase
        .from('users')
        .update({ skill_level: skillLevel })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      // Record the test result
      const { error: testError } = await supabase
        .from('skill_tests')
        .insert([
          {
            user_id: user?.id,
            score,
            result: skillLevel,
          },
        ]);

      if (testError) throw testError;

      // Navigate to profile page
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting the test');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const currentQ: Question = skillTestQuestions[currentQuestion];
  const progress = (answers.filter(Boolean).length / skillTestQuestions.length) * 100;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Teacher Skill Assessment
        </Typography>
        <Typography color="text.secondary" paragraph>
          Complete this assessment to determine your teaching skill level. Answer all questions
          to the best of your ability.
        </Typography>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mb: 4, height: 8, borderRadius: 4 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Question {currentQuestion + 1} of {skillTestQuestions.length}
          </Typography>
          <Typography paragraph>{currentQ.question}</Typography>

          <RadioGroup
            value={answers[currentQuestion] ?? ''}
            onChange={(e) => handleAnswer(Number(e.target.value))}
          >
            {currentQ.options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={index}
                control={<Radio />}
                label={option}
              />
            ))}
          </RadioGroup>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            {currentQuestion < skillTestQuestions.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={answers[currentQuestion] === undefined}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={answers.length !== skillTestQuestions.length || isSubmitting}
              >
                Submit Test
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SkillTest; 
