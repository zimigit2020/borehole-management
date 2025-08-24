import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Installation } from '../../services/installationService';

interface InstallationStatsProps {
  stats: any;
  installations: Installation[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const InstallationStats: React.FC<InstallationStatsProps> = ({ stats, installations }) => {
  const statusData = Object.entries(stats?.byStatus || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').toUpperCase(),
    value: value as number,
  }));

  const typeData = Object.entries(stats?.byType || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').toUpperCase(),
    value: value as number,
  }));

  // Calculate monthly completion rate
  const monthlyData = installations.reduce((acc: any[], inst) => {
    if (inst.completedAt) {
      const month = new Date(inst.completedAt).toLocaleString('default', { month: 'short' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ month, count: 1 });
      }
    }
    return acc;
  }, []);

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Status Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Type Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Installation Types
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Monthly Completions */}
        {monthlyData.length > 0 && (
          <Grid size={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Completions
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Performance Metrics */}
        <Grid size={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary">
                    {stats?.total || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Installations
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="success.main">
                    {((stats?.byStatus?.completed / stats?.total) * 100 || 0).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Completion Rate
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="info.main">
                    {stats?.averageCompletionTime?.toFixed(1) || 0}h
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg Completion Time
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Installations Table */}
        <Grid size={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Completed Installations
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Job #</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Technician</TableCell>
                    <TableCell>Completion Date</TableCell>
                    <TableCell>Duration (hours)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {installations
                    .filter(inst => inst.status === 'completed')
                    .slice(0, 5)
                    .map((inst) => {
                      const duration = inst.startedAt && inst.completedAt
                        ? (new Date(inst.completedAt).getTime() - new Date(inst.startedAt).getTime()) / (1000 * 60 * 60)
                        : 0;
                      
                      return (
                        <TableRow key={inst.id}>
                          <TableCell>{inst.job?.jobNumber || 'N/A'}</TableCell>
                          <TableCell>{inst.type.replace(/_/g, ' ')}</TableCell>
                          <TableCell>{inst.technician?.name || 'N/A'}</TableCell>
                          <TableCell>
                            {inst.completedAt ? new Date(inst.completedAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>{duration.toFixed(1)}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InstallationStats;