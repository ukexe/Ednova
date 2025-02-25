import React, { useState } from 'react';
import { Box, Button, TextField, Alert, Paper, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const AuthTest = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('student');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const { signUp } = useAuth();

  const testSignUp = async () => {
    try {
      await signUp(email, password, role);
      setResult({
        success: true,
        message: 'Successfully created user and profile',
      });
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Auth System Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Test Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 1 }}
        />
        <TextField
          fullWidth
          label="Test Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          sx={{ mb: 1 }}
        />
        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            value={role}
            label="Role"
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Button variant="contained" onClick={testSignUp}>
        Test Registration
      </Button>

      {result && (
        <Alert severity={result.success ? 'success' : 'error'} sx={{ mt: 2 }}>
          {result.message}
        </Alert>
      )}
    </Paper>
  );
};

export default AuthTest; 