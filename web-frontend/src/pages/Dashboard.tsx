import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Work,
  Engineering,
  LocationOn,
  CheckCircle,
  Schedule,
  TrendingUp,
  WaterDrop,
  Groups,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../services/api.service';
import { API_ENDPOINTS } from '../config/api';

interface DashboardStats {
  totalJobs: number;
  jobsByStatus: {
    created: number;
    assigned: number;
    surveyed: number;
    drilling: number;
    completed: number;
  };
  recentJobs: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    jobsByStatus: {
      created: 0,
      assigned: 0,
      surveyed: 0,
      drilling: 0,
      completed: 0,
    },
    recentJobs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const jobs = await api.get<any[]>(API_ENDPOINTS.JOBS);
      
      // Calculate statistics
      const jobsByStatus = jobs.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {} as any);

      setStats({
        totalJobs: jobs.length,
        jobsByStatus: {
          created: jobsByStatus.created || 0,
          assigned: jobsByStatus.assigned || 0,
          surveyed: jobsByStatus.surveyed || 0,
          drilling: jobsByStatus.drilling || 0,
          completed: jobsByStatus.completed || 0,
        },
        recentJobs: jobs.slice(0, 5), // Get 5 most recent
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = Object.entries(stats.jobsByStatus)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
    }));

  const barData = [
    { name: 'Created', value: stats.jobsByStatus.created, color: '#FFA726' },
    { name: 'Assigned', value: stats.jobsByStatus.assigned, color: '#42A5F5' },
    { name: 'Surveyed', value: stats.jobsByStatus.surveyed, color: '#AB47BC' },
    { name: 'Drilling', value: stats.jobsByStatus.drilling, color: '#EF5350' },
    { name: 'Completed', value: stats.jobsByStatus.completed, color: '#66BB6A' },
  ];

  const COLORS = {
    created: '#FFA726',
    assigned: '#42A5F5',
    surveyed: '#AB47BC',
    drilling: '#EF5350',
    completed: '#66BB6A',
  };

  const getStatusColor = (status: string) => {
    return COLORS[status as keyof typeof COLORS] || '#757575';
  };

  const statsCards = [
    {
      title: 'Total Boreholes',
      value: stats.totalJobs,
      icon: <WaterDrop />,
      color: '#2E7D32',
      gradient: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
    },
    {
      title: 'In Progress',
      value: stats.jobsByStatus.assigned + stats.jobsByStatus.surveyed + stats.jobsByStatus.drilling,
      icon: <Engineering />,
      color: '#FF6F00',
      gradient: 'linear-gradient(135deg, #FF6F00 0%, #FFB300 100%)',
    },
    {
      title: 'Completed',
      value: stats.jobsByStatus.completed,
      icon: <CheckCircle />,
      color: '#00BFA5',
      gradient: 'linear-gradient(135deg, #00BFA5 0%, #00E676 100%)',
    },
    {
      title: 'Success Rate',
      value: stats.totalJobs > 0 ? `${Math.round((stats.jobsByStatus.completed / stats.totalJobs) * 100)}%` : '0%',
      icon: <TrendingUp />,
      color: '#7C4DFF',
      gradient: 'linear-gradient(135deg, #7C4DFF 0%, #B388FF 100%)',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to Untapped Management System
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                height: '100%',
                background: card.gradient,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {React.cloneElement(card.icon, { sx: { fontSize: 32 } })}
                  </Box>
                </Box>
              </CardContent>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Job Status Distribution */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Borehole Status Distribution
            </Typography>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 8, 
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height={350}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Activity Timeline */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Recent Activity
            </Typography>
            {stats.recentJobs.length > 0 ? (
              <List sx={{ py: 0 }}>
                {stats.recentJobs.map((job, index) => (
                  <ListItem
                    key={job.id}
                    sx={{
                      px: 2,
                      py: 1.5,
                      mb: 1,
                      borderRadius: 2,
                      backgroundColor: 'grey.50',
                      '&:hover': {
                        backgroundColor: 'grey.100',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {job.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {job.clientName} • {job.siteName}
                          </Typography>
                          <Box display="flex" alignItems="center" mt={0.5} gap={1}>
                            <Chip
                              label={job.status}
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor(job.status),
                                color: 'white',
                                fontWeight: 500,
                                height: 24,
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationOn sx={{ fontSize: 14, mr: 0.5 }} />
                              {Number(job.latitude).toFixed(2)}°, {Number(job.longitude).toFixed(2)}°
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height={300}>
                <Typography color="text.secondary">No recent activity</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                  Field Operations Overview
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  Managing water access across Zimbabwe through strategic borehole drilling operations.
                  Track progress, monitor field teams, and ensure successful project completion.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box display="flex" justifyContent="space-around">
                  <Box textAlign="center">
                    <Groups sx={{ fontSize: 32, color: 'white', mb: 1 }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                      12
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Active Teams
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Schedule sx={{ fontSize: 32, color: 'white', mb: 1 }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                      {stats.jobsByStatus.created}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Pending Jobs
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;