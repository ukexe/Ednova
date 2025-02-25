import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Paper,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import VideoCallIcon from '@mui/icons-material/VideoCall';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="primary"
          gutterBottom
        >
          Welcome to Ednova
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          Connect with skilled teachers or share your expertise with eager students.
          Join our community of learners and educators today!
        </Typography>
        <Box sx={{ mt: 4, mb: 8 }}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <SchoolIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Learn from Experts
              </Typography>
              <Typography align="center" color="text.secondary">
                Connect with qualified teachers and learn at your own pace through
                personalized sessions.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <VideoCallIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Virtual Sessions
              </Typography>
              <Typography align="center" color="text.secondary">
                Attend sessions from anywhere through our integrated video
                conferencing platform.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <GroupIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Share Knowledge
              </Typography>
              <Typography align="center" color="text.secondary">
                Teachers can share their expertise and earn while helping others
                learn and grow.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Landing; 