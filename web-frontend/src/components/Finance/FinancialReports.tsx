import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import financeService from '../../services/financeService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const FinancialReports: React.FC = () => {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const year = new Date().getFullYear();
      
      // Get revenue data
      const revenue = await financeService.getRevenueByMonth(year);
      const revenueArray = Object.entries(revenue).map(([month, amount]) => ({
        month: `Month ${month}`,
        revenue: amount,
      }));
      setRevenueData(revenueArray);

      // Get summary for the year
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      const summary = await financeService.getFinancialSummary(
        startOfYear.toISOString(),
        endOfYear.toISOString()
      );
      setSummaryData(summary);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  const statusData = [
    { name: 'Paid', value: summaryData?.paidInvoices || 0 },
    { name: 'Outstanding', value: (summaryData?.invoiceCount - summaryData?.paidInvoices) || 0 },
    { name: 'Overdue', value: summaryData?.overdueInvoices || 0 },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Financial Reports & Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Annual Summary Cards */}
        <Grid size={12}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Invoiced (YTD)
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(summaryData?.totalInvoiced || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Collected (YTD)
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {formatCurrency(summaryData?.totalPaid || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Outstanding Amount
                  </Typography>
                  <Typography variant="h5" color="warning.main">
                    {formatCurrency(summaryData?.totalOutstanding || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Collection Rate
                  </Typography>
                  <Typography variant="h5" color="info.main">
                    {summaryData?.totalInvoiced > 0
                      ? ((summaryData.totalPaid / summaryData.totalInvoiced) * 100).toFixed(1)
                      : 0}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Monthly Revenue Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Revenue
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Invoice Status Distribution */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Invoice Status Distribution
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

        {/* Key Metrics */}
        <Grid size={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Key Financial Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary">
                    {summaryData?.invoiceCount || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Invoices
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(
                      summaryData?.totalInvoiced > 0
                        ? summaryData.totalInvoiced / summaryData.invoiceCount
                        : 0
                    )}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average Invoice Value
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="warning.main">
                    {summaryData?.overdueInvoices || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Overdue Invoices
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialReports;