import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AuthProvider, { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';
import NotFound from './pages/NotFound';

// Lazy load pages for better performance
const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const TeacherDashboard = React.lazy(() => import('./pages/TeacherDashboard'));
const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const SessionsCreate = React.lazy(() => import('./pages/SessionsCreate'));
const SessionsList = React.lazy(() => import('./pages/SessionsList'));
const VideoSession = React.lazy(() => import('./pages/VideoSession'));

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

/**
 * Protected Route wrapper component.
 * Redirects to login if user is not authenticated.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

/**
 * Role-specific route wrapper component.
 * Ensures users can only access routes appropriate for their role.
 */
const RoleRoute = ({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: 'teacher' | 'student';
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Checking permissions..." />;
  }

  // Add debugging
  console.log('RoleRoute Debug:', {
    userRole: user?.role,
    allowedRole,
    hasUser: !!user,
    userObject: user
  });

  if (!user || user.role !== allowedRole) {
    console.log('RoleRoute: Redirecting to dashboard due to role mismatch');
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

/**
 * Dashboard redirect component.
 * Redirects users to their role-specific dashboard.
 */
const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <Router>
            <Layout>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Dashboard Routes */}
                  <Route path="/dashboard" element={<DashboardRedirect />} />
                  <Route
                    path="/teacher"
                    element={
                      <ProtectedRoute>
                        <RoleRoute allowedRole="teacher">
                          <TeacherDashboard />
                        </RoleRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student"
                    element={
                      <ProtectedRoute>
                        <RoleRoute allowedRole="student">
                          <StudentDashboard />
                        </RoleRoute>
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Routes */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sessions"
                    element={
                      <ProtectedRoute>
                        <SessionsList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sessions/create"
                    element={
                      <ProtectedRoute>
                        <RoleRoute allowedRole="teacher">
                          <SessionsCreate />
                        </RoleRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sessions/:sessionId/join"
                    element={
                      <ProtectedRoute>
                        <VideoSession />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App; 
