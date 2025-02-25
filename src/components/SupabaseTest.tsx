import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Alert, Box, CircularProgress } from '@mui/material';

const SupabaseTest = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Try to fetch the current user to test the connection
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        // If we get here, the connection is successful
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to connect to Supabase');
      }
    };

    testConnection();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      {status === 'loading' && <CircularProgress />}
      {status === 'success' && (
        <Alert severity="success">Successfully connected to Supabase!</Alert>
      )}
      {status === 'error' && (
        <Alert severity="error">
          Failed to connect to Supabase: {error}
        </Alert>
      )}
    </Box>
  );
};

export default SupabaseTest; 