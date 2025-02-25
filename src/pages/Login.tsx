import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Divider,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await signIn(values.email, values.password);
        navigate('/dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid email or password');
      }
    },
  });

  const handleBypass = async (role: 'student' | 'teacher') => {
    try {
      // Use the provided accounts based on role
      const email = role === 'student' ? 'ukexe10@gmail.com' : 'ukexe06@gmail.com';
      await signIn(email, 'demo123');
      navigate(role === 'student' ? '/student' : '/teacher');
    } catch (err) {
      setError('Error accessing demo account. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sign in to Ednova
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* MVP Bypass Buttons */}
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
              MVP Demo Access
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={() => handleBypass('student')}
              >
                Enter as Student
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={() => handleBypass('teacher')}
              >
                Enter as Teacher
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              or sign in with credentials
            </Typography>
          </Divider>

          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/register')}
            >
              Don't have an account? Sign up
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 