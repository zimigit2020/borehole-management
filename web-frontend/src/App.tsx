import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import JobList from './pages/Jobs/JobList';
import MapView from './pages/MapView';
import UserManagement from './pages/Users/UserManagement';
import SurveyReports from './pages/Surveys/SurveyReports';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32', // Rich green - representing growth and Africa
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#FF6F00', // Vibrant orange - energy and warmth
      light: '#FFB300',
      dark: '#E65100',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    success: {
      main: '#00BFA5',
    },
    warning: {
      main: '#FFA726',
    },
    info: {
      main: '#29B6F6',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="jobs" element={<JobList />} />
              <Route path="map" element={<MapView />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="surveys" element={<SurveyReports />} />
              <Route path="reports" element={<div>Analytics (Coming Soon)</div>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
