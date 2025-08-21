import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', credentials);
      await login(credentials);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      />

      <Container component="main" maxWidth="xs">
        <Paper
          elevation={24}
          sx={{
            padding: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.98)',
          }}
        >
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <img 
              src="/logo3.png" 
              alt="Untapped Africa Logo" 
              style={{ 
                height: 80,
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          </Box>

          <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to Untapped Management System
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={credentials.email}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                boxShadow: '0 4px 20px rgba(46, 125, 50, 0.3)',
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #1B5E20 0%, #388E3C 100%)',
                  boxShadow: '0 6px 24px rgba(46, 125, 50, 0.4)',
                },
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
                Demo Credentials
              </Typography>
              <Typography variant="body2" align="center" sx={{ fontFamily: 'monospace' }}>
                test@borehole.com / test123
              </Typography>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                © 2024 Untapped Africa. All rights reserved.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;