import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  TextField,
  MenuItem,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Assessment,
  Warning,
  CheckCircle,
  Print,
  Refresh,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface JobCostingReportProps {
  jobId?: string;
}

interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
  itemCount: number;
}

interface JobReport {
  jobId: string;
  jobNumber: string;
  clientName: string;
  siteName: string;
  status: string;
  quotedAmount: number;
  invoicedAmount: number;
  paidAmount: number;
  totalCosts: number;
  grossProfit: number;
  profitMargin: number;
  costBreakdown: CostBreakdown[];
  materialsCost: number;
  laborCost: number;
  equipmentCost: number;
  transportCost: number;
  overheadCost: number;
  otherCosts: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const JobCostingReport: React.FC<JobCostingReportProps> = ({ jobId: propJobId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<JobReport | null>(null);
  const [selectedJobId, setSelectedJobId] = useState(propJobId || '');
  const [jobs, setJobs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchJobs();
    if (propJobId) {
      fetchReport(propJobId);
    }
  }, [propJobId]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchReport = async (jobId: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/job-costing/report/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch job costing report');
      }

      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);
    if (jobId) {
      fetchReport(jobId);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getProfitColor = (margin: number) => {
    if (margin >= 20) return 'success.main';
    if (margin >= 10) return 'warning.main';
    if (margin >= 0) return 'info.main';
    return 'error.main';
  };

  const getProfitIcon = (margin: number) => {
    return margin >= 0 ? <TrendingUp /> : <TrendingDown />;
  };

  if (!propJobId && !selectedJobId) {
    return (
      <Box>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select a Job for Cost Analysis
          </Typography>
          <TextField
            select
            fullWidth
            label="Select Job"
            value={selectedJobId}
            onChange={(e) => handleJobChange(e.target.value)}
            sx={{ mt: 2 }}
          >
            <MenuItem value="">Select a job...</MenuItem>
            {jobs.map((job) => (
              <MenuItem key={job.id} value={job.id}>
                {job.jobNumber} - {job.clientName} - {job.siteName}
              </MenuItem>
            ))}
          </TextField>
        </Paper>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!report) {
    return null;
  }

  const pieData = report.costBreakdown.map(item => ({
    name: item.category,
    value: item.amount,
  }));

  const barData = [
    { name: 'Quoted', amount: report.quotedAmount },
    { name: 'Costs', amount: report.totalCosts },
    { name: 'Invoiced', amount: report.invoicedAmount },
    { name: 'Paid', amount: report.paidAmount },
    { name: 'Profit', amount: report.grossProfit },
  ];

  return (
    <Box>
      {!propJobId && (
        <Box sx={{ mb: 3 }}>
          <TextField
            select
            fullWidth
            label="Select Job"
            value={selectedJobId}
            onChange={(e) => handleJobChange(e.target.value)}
          >
            <MenuItem value="">Select a job...</MenuItem>
            {jobs.map((job) => (
              <MenuItem key={job.id} value={job.id}>
                {job.jobNumber} - {job.clientName} - {job.siteName}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5">
            Job Cost Analysis: {report.jobNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {report.clientName} - {report.siteName}
          </Typography>
        </Box>
        <Box>
          <Button startIcon={<Refresh />} onClick={() => fetchReport(report.jobId)} sx={{ mr: 1 }}>
            Refresh
          </Button>
          <Button startIcon={<Print />} onClick={() => window.print()} variant="outlined">
            Print Report
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h5">
                {formatCurrency(report.invoicedAmount)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Quoted: {formatCurrency(report.quotedAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Costs
              </Typography>
              <Typography variant="h5">
                {formatCurrency(report.totalCosts)}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((report.totalCosts / report.quotedAmount) * 100, 100)}
                color={report.totalCosts > report.quotedAmount ? 'error' : 'primary'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Gross Profit
              </Typography>
              <Typography variant="h5" color={getProfitColor(report.profitMargin)}>
                {formatCurrency(report.grossProfit)}
              </Typography>
              <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                {getProfitIcon(report.profitMargin)}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {report.profitMargin.toFixed(1)}% margin
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Payment Status
              </Typography>
              <Typography variant="h5">
                {formatCurrency(report.paidAmount)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Outstanding: {formatCurrency(report.invoicedAmount - report.paidAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Analysis */}
      <Paper sx={{ p: 2 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Cost Breakdown" />
          <Tab label="Financial Overview" />
          <Tab label="Detailed Costs" />
        </Tabs>

        {activeTab === 0 && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Cost Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value.toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Cost Categories
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">%</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.costBreakdown.map((item) => (
                        <TableRow key={item.category}>
                          <TableCell>{item.category}</TableCell>
                          <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                          <TableCell align="right">{item.percentage.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell><strong>Total</strong></TableCell>
                        <TableCell align="right"><strong>{formatCurrency(report.totalCosts)}</strong></TableCell>
                        <TableCell align="right"><strong>100%</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Financial Overview
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>

            <Box sx={{ mt: 3 }}>
              <Alert 
                severity={report.profitMargin >= 15 ? 'success' : report.profitMargin >= 0 ? 'warning' : 'error'}
                icon={report.profitMargin >= 0 ? <CheckCircle /> : <Warning />}
              >
                <Typography variant="subtitle1">
                  Profitability Analysis
                </Typography>
                <Typography variant="body2">
                  This job has a profit margin of {report.profitMargin.toFixed(1)}%. 
                  {report.profitMargin >= 15 
                    ? ' This is a healthy profit margin.'
                    : report.profitMargin >= 0
                    ? ' Consider ways to improve profitability.'
                    : ' This job is currently at a loss.'}
                </Typography>
              </Alert>
            </Box>
          </Box>
        )}

        {activeTab === 2 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Detailed Cost Breakdown
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Direct Costs
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Materials</TableCell>
                          <TableCell align="right">{formatCurrency(report.materialsCost)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Labor</TableCell>
                          <TableCell align="right">{formatCurrency(report.laborCost)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Equipment</TableCell>
                          <TableCell align="right">{formatCurrency(report.equipmentCost)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Transport</TableCell>
                          <TableCell align="right">{formatCurrency(report.transportCost)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Indirect Costs
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Overhead</TableCell>
                          <TableCell align="right">{formatCurrency(report.overheadCost)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Other Costs</TableCell>
                          <TableCell align="right">{formatCurrency(report.otherCosts)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Total Indirect</strong></TableCell>
                          <TableCell align="right">
                            <strong>{formatCurrency(report.overheadCost + report.otherCosts)}</strong>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Cost Efficiency Tips:</strong>
                  {report.materialsCost > report.totalCosts * 0.4 && 
                    ' Consider negotiating better rates with suppliers for materials.'}
                  {report.laborCost > report.totalCosts * 0.35 && 
                    ' Labor costs are high - review workforce efficiency.'}
                  {report.transportCost > report.totalCosts * 0.15 && 
                    ' Transportation costs are significant - consider logistics optimization.'}
                </Typography>
              </Alert>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default JobCostingReport;