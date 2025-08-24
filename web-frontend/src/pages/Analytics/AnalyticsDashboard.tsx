import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Stack,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  AttachMoney as MoneyIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  Engineering as EngineeringIcon,
  Build as BuildIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  Radar,
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import jobsService from '../../services/jobsService';
import financeService from '../../services/financeService';
import inventoryService from '../../services/inventoryService';
import installationService from '../../services/installationService';
import { useAuth } from '../../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  
  // Overview metrics
  const [overviewMetrics, setOverviewMetrics] = useState({
    totalJobs: 0,
    completedJobs: 0,
    activeJobs: 0,
    totalRevenue: 0,
    revenueGrowth: 0,
    avgCompletionTime: 0,
    customerSatisfaction: 0,
    teamUtilization: 0,
  });

  // Job analytics data
  const [jobTrends, setJobTrends] = useState<any[]>([]);
  const [jobsByStatus, setJobsByStatus] = useState<any[]>([]);
  const [jobsByType, setJobsByType] = useState<any[]>([]);
  const [jobsByLocation, setJobsByLocation] = useState<any[]>([]);

  // Financial analytics data
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [profitMargins, setProfitMargins] = useState<any[]>([]);
  const [outstandingInvoices, setOutstandingInvoices] = useState<any[]>([]);
  const [cashFlow, setCashFlow] = useState<any[]>([]);

  // Inventory analytics data
  const [inventoryLevels, setInventoryLevels] = useState<any[]>([]);
  const [inventoryTurnover, setInventoryTurnover] = useState<any[]>([]);
  const [stockMovements, setStockMovements] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);

  // Team performance data
  const [teamProductivity, setTeamProductivity] = useState<any[]>([]);
  const [teamWorkload, setTeamWorkload] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);

  // Installation analytics
  const [installationMetrics, setInstallationMetrics] = useState<any[]>([]);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Load all analytics data based on time range
      await Promise.all([
        loadOverviewMetrics(),
        loadJobAnalytics(),
        loadFinancialAnalytics(),
        loadInventoryAnalytics(),
        loadTeamAnalytics(),
        loadInstallationAnalytics(),
      ]);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOverviewMetrics = async () => {
    // Simulate loading overview metrics
    // In production, this would fetch from backend analytics endpoints
    setOverviewMetrics({
      totalJobs: 156,
      completedJobs: 98,
      activeJobs: 42,
      totalRevenue: 2456000,
      revenueGrowth: 12.5,
      avgCompletionTime: 7.2,
      customerSatisfaction: 4.6,
      teamUtilization: 78,
    });
  };

  const loadJobAnalytics = async () => {
    // Simulate job trends data
    const trends = [];
    for (let i = 11; i >= 0; i--) {
      const date = format(subMonths(new Date(), i), 'MMM yyyy');
      trends.push({
        month: date,
        completed: Math.floor(Math.random() * 20) + 5,
        active: Math.floor(Math.random() * 15) + 3,
        new: Math.floor(Math.random() * 10) + 2,
      });
    }
    setJobTrends(trends);

    // Job status distribution
    setJobsByStatus([
      { name: 'Completed', value: 98, percentage: 62.8 },
      { name: 'In Progress', value: 42, percentage: 26.9 },
      { name: 'Pending', value: 16, percentage: 10.3 },
    ]);

    // Jobs by type
    setJobsByType([
      { name: 'Drilling', value: 45 },
      { name: 'Survey', value: 38 },
      { name: 'Installation', value: 32 },
      { name: 'Maintenance', value: 28 },
      { name: 'Repair', value: 13 },
    ]);

    // Jobs by location
    setJobsByLocation([
      { location: 'Harare', jobs: 42, revenue: 850000 },
      { location: 'Bulawayo', jobs: 28, revenue: 620000 },
      { location: 'Mutare', jobs: 22, revenue: 480000 },
      { location: 'Gweru', jobs: 18, revenue: 350000 },
      { location: 'Masvingo', jobs: 15, revenue: 280000 },
      { location: 'Other', jobs: 31, revenue: 456000 },
    ]);
  };

  const loadFinancialAnalytics = async () => {
    // Revenue trends
    const revenue = [];
    for (let i = 11; i >= 0; i--) {
      const date = format(subMonths(new Date(), i), 'MMM');
      revenue.push({
        month: date,
        revenue: Math.floor(Math.random() * 500000) + 150000,
        expenses: Math.floor(Math.random() * 300000) + 100000,
        profit: 0,
      });
    }
    revenue.forEach(r => r.profit = r.revenue - r.expenses);
    setRevenueData(revenue);

    // Expense breakdown
    setExpenseData([
      { category: 'Labor', amount: 450000, percentage: 35 },
      { category: 'Materials', amount: 380000, percentage: 29 },
      { category: 'Equipment', amount: 250000, percentage: 19 },
      { category: 'Transport', amount: 120000, percentage: 9 },
      { category: 'Admin', amount: 80000, percentage: 6 },
      { category: 'Other', amount: 25000, percentage: 2 },
    ]);

    // Profit margins by job type
    setProfitMargins([
      { type: 'Drilling', margin: 28.5 },
      { type: 'Survey', margin: 42.3 },
      { type: 'Installation', margin: 35.7 },
      { type: 'Maintenance', margin: 48.2 },
      { type: 'Repair', margin: 31.9 },
    ]);

    // Outstanding invoices
    setOutstandingInvoices([
      { client: 'ABC Mining', amount: 125000, daysOverdue: 15 },
      { client: 'XYZ Farms', amount: 87000, daysOverdue: 7 },
      { client: 'Delta Industries', amount: 45000, daysOverdue: 30 },
      { client: 'Omega Corp', amount: 92000, daysOverdue: 3 },
    ]);

    // Cash flow
    const flow = [];
    for (let i = 6; i >= 0; i--) {
      const date = format(subMonths(new Date(), i), 'MMM');
      flow.push({
        month: date,
        inflow: Math.floor(Math.random() * 400000) + 200000,
        outflow: Math.floor(Math.random() * 350000) + 150000,
      });
    }
    setCashFlow(flow);
  };

  const loadInventoryAnalytics = async () => {
    // Current inventory levels
    setInventoryLevels([
      { item: 'PVC Pipes', current: 450, optimal: 500, unit: 'meters' },
      { item: 'Submersible Pumps', current: 12, optimal: 15, unit: 'units' },
      { item: 'Drilling Bits', current: 25, optimal: 30, unit: 'units' },
      { item: 'Cement Bags', current: 180, optimal: 200, unit: 'bags' },
      { item: 'Steel Casings', current: 85, optimal: 100, unit: 'meters' },
    ]);

    // Inventory turnover
    setInventoryTurnover([
      { month: 'Jan', turnover: 2.5 },
      { month: 'Feb', turnover: 3.1 },
      { month: 'Mar', turnover: 2.8 },
      { month: 'Apr', turnover: 3.4 },
      { month: 'May', turnover: 2.9 },
      { month: 'Jun', turnover: 3.2 },
    ]);

    // Stock movements
    setStockMovements([
      { date: '2024-01-15', item: 'PVC Pipes', type: 'IN', quantity: 100, supplier: 'Supplier A' },
      { date: '2024-01-18', item: 'Submersible Pumps', type: 'OUT', quantity: 3, job: 'JOB-2024-045' },
      { date: '2024-01-20', item: 'Drilling Bits', type: 'IN', quantity: 10, supplier: 'Supplier B' },
      { date: '2024-01-22', item: 'Cement Bags', type: 'OUT', quantity: 50, job: 'JOB-2024-046' },
    ]);

    // Low stock alerts
    setLowStockAlerts([
      { item: 'Submersible Pumps', current: 12, minimum: 15, status: 'warning' },
      { item: 'Drilling Bits', current: 25, minimum: 30, status: 'warning' },
    ]);
  };

  const loadTeamAnalytics = async () => {
    // Team productivity
    setTeamProductivity([
      { name: 'John Smith', jobs: 15, efficiency: 92, rating: 4.8 },
      { name: 'Jane Doe', jobs: 18, efficiency: 88, rating: 4.6 },
      { name: 'Mike Johnson', jobs: 12, efficiency: 95, rating: 4.9 },
      { name: 'Sarah Wilson', jobs: 14, efficiency: 87, rating: 4.5 },
      { name: 'Tom Brown', jobs: 16, efficiency: 90, rating: 4.7 },
    ]);

    // Team workload
    setTeamWorkload([
      { team: 'Drilling Team A', current: 8, capacity: 10 },
      { team: 'Survey Team', current: 6, capacity: 8 },
      { team: 'Installation Team', current: 7, capacity: 8 },
      { team: 'Maintenance Team', current: 5, capacity: 6 },
    ]);

    // Performance metrics
    setPerformanceMetrics([
      { metric: 'On-Time Completion', value: 85 },
      { metric: 'Quality Score', value: 92 },
      { metric: 'Safety Compliance', value: 98 },
      { metric: 'Customer Satisfaction', value: 88 },
      { metric: 'Resource Utilization', value: 78 },
    ]);
  };

  const loadInstallationAnalytics = async () => {
    // Installation metrics
    setInstallationMetrics([
      { type: 'Solar Pumps', count: 28, avgTime: 2.5 },
      { type: 'Hand Pumps', count: 42, avgTime: 1.2 },
      { type: 'Submersible Pumps', count: 18, avgTime: 3.8 },
      { type: 'Tank Systems', count: 15, avgTime: 4.5 },
    ]);

    // Maintenance schedule
    setMaintenanceSchedule([
      { installation: 'INST-001', location: 'Harare', nextService: '2024-02-15', status: 'upcoming' },
      { installation: 'INST-002', location: 'Bulawayo', nextService: '2024-02-10', status: 'overdue' },
      { installation: 'INST-003', location: 'Mutare', nextService: '2024-02-20', status: 'upcoming' },
      { installation: 'INST-004', location: 'Gweru', nextService: '2024-03-01', status: 'scheduled' },
    ]);
  };

  const exportData = (type: string) => {
    // Implementation for exporting data
    console.log(`Exporting ${type} data...`);
    // In production, this would generate CSV/PDF reports
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'upcoming':
        return 'success';
      case 'active':
      case 'scheduled':
        return 'primary';
      case 'pending':
      case 'warning':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssessmentIcon />
                Analytics Dashboard
              </Typography>
              <Box display="flex" gap={2}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    label="Time Range"
                  >
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                    <MenuItem value="quarter">This Quarter</MenuItem>
                    <MenuItem value="year">This Year</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadAnalyticsData}
                >
                  Refresh
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                >
                  Print
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => exportData('all')}
                >
                  Export Report
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Key Metrics Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Jobs
                  </Typography>
                  <Typography variant="h4">
                    {overviewMetrics.totalJobs}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {overviewMetrics.completedJobs} completed
                  </Typography>
                </Box>
                <WorkIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(overviewMetrics.totalRevenue)}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    <Typography variant="body2" color="success.main">
                      +{overviewMetrics.revenueGrowth}%
                    </Typography>
                  </Box>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Team Utilization
                  </Typography>
                  <Typography variant="h4">
                    {overviewMetrics.teamUtilization}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={overviewMetrics.teamUtilization}
                    sx={{ mt: 1 }}
                  />
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Completion
                  </Typography>
                  <Typography variant="h4">
                    {overviewMetrics.avgCompletionTime} days
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Per job average
                  </Typography>
                </Box>
                <CalendarIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Analytics Content */}
        <Grid item xs={12}>
          <Paper>
            <Tabs
              value={tabValue}
              onChange={(e, v) => setTabValue(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Operations" icon={<WorkIcon />} iconPosition="start" />
              <Tab label="Financial" icon={<MoneyIcon />} iconPosition="start" />
              <Tab label="Inventory" icon={<InventoryIcon />} iconPosition="start" />
              <Tab label="Team Performance" icon={<PeopleIcon />} iconPosition="start" />
              <Tab label="Installations" icon={<BuildIcon />} iconPosition="start" />
            </Tabs>

            {/* Operations Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {/* Job Trends Chart */}
                <Grid item xs={12} lg={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Job Trends
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={jobTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <ChartTooltip />
                          <Legend />
                          <Area type="monotone" dataKey="completed" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                          <Area type="monotone" dataKey="active" stackId="1" stroke="#8884d8" fill="#8884d8" />
                          <Area type="monotone" dataKey="new" stackId="1" stroke="#ffc658" fill="#ffc658" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Job Status Distribution */}
                <Grid item xs={12} lg={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Job Status Distribution
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={jobsByStatus}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {jobsByStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Jobs by Type */}
                <Grid item xs={12} lg={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Jobs by Type
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={jobsByType}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Jobs by Location Table */}
                <Grid item xs={12} lg={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Jobs by Location
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Location</TableCell>
                              <TableCell align="right">Jobs</TableCell>
                              <TableCell align="right">Revenue</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {jobsByLocation.map((row) => (
                              <TableRow key={row.location}>
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <LocationIcon fontSize="small" />
                                    {row.location}
                                  </Box>
                                </TableCell>
                                <TableCell align="right">{row.jobs}</TableCell>
                                <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Financial Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                {/* Revenue vs Expenses Chart */}
                <Grid item xs={12} lg={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Revenue vs Expenses
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <ChartTooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
                          <Line type="monotone" dataKey="expenses" stroke="#ff8042" strokeWidth={2} />
                          <Line type="monotone" dataKey="profit" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Expense Breakdown */}
                <Grid item xs={12} lg={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Expense Breakdown
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={expenseData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="amount"
                          >
                            {expenseData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Cash Flow */}
                <Grid item xs={12} lg={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Cash Flow
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={cashFlow}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <ChartTooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Legend />
                          <Bar dataKey="inflow" fill="#82ca9d" />
                          <Bar dataKey="outflow" fill="#ff8042" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Outstanding Invoices */}
                <Grid item xs={12} lg={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Outstanding Invoices
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Client</TableCell>
                              <TableCell align="right">Amount</TableCell>
                              <TableCell align="right">Days Overdue</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {outstandingInvoices.map((invoice) => (
                              <TableRow key={invoice.client}>
                                <TableCell>{invoice.client}</TableCell>
                                <TableCell align="right">{formatCurrency(invoice.amount)}</TableCell>
                                <TableCell align="right">
                                  <Chip
                                    label={`${invoice.daysOverdue} days`}
                                    size="small"
                                    color={invoice.daysOverdue > 14 ? 'error' : 'warning'}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Profit Margins */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Profit Margins by Job Type
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={profitMargins} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 50]} />
                          <YAxis dataKey="type" type="category" />
                          <ChartTooltip formatter={(value) => `${value}%`} />
                          <Bar dataKey="margin" fill="#8884d8">
                            {profitMargins.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.margin > 35 ? '#82ca9d' : '#ffc658'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Inventory Tab */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                {/* Current Stock Levels */}
                <Grid item xs={12} lg={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Current Stock Levels
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Item</TableCell>
                              <TableCell align="right">Current</TableCell>
                              <TableCell align="right">Optimal</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Stock Level</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {inventoryLevels.map((item) => {
                              const percentage = (item.current / item.optimal) * 100;
                              return (
                                <TableRow key={item.item}>
                                  <TableCell>{item.item}</TableCell>
                                  <TableCell align="right">
                                    {item.current} {item.unit}
                                  </TableCell>
                                  <TableCell align="right">
                                    {item.optimal} {item.unit}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={percentage < 80 ? 'Low' : 'Good'}
                                      size="small"
                                      color={percentage < 80 ? 'warning' : 'success'}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <LinearProgress
                                      variant="determinate"
                                      value={Math.min(percentage, 100)}
                                      color={percentage < 80 ? 'warning' : 'success'}
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Low Stock Alerts */}
                <Grid item xs={12} lg={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Low Stock Alerts
                      </Typography>
                      {lowStockAlerts.length > 0 ? (
                        <Stack spacing={2}>
                          {lowStockAlerts.map((alert) => (
                            <Alert key={alert.item} severity="warning">
                              <Typography variant="subtitle2">{alert.item}</Typography>
                              <Typography variant="body2">
                                Current: {alert.current} / Min: {alert.minimum}
                              </Typography>
                            </Alert>
                          ))}
                        </Stack>
                      ) : (
                        <Alert severity="success">All items are well stocked</Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Inventory Turnover */}
                <Grid item xs={12} lg={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Inventory Turnover Rate
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={inventoryTurnover}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <ChartTooltip />
                          <Line type="monotone" dataKey="turnover" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Recent Stock Movements */}
                <Grid item xs={12} lg={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recent Stock Movements
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Item</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell align="right">Quantity</TableCell>
                              <TableCell>Reference</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {stockMovements.map((movement, index) => (
                              <TableRow key={index}>
                                <TableCell>{movement.date}</TableCell>
                                <TableCell>{movement.item}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={movement.type}
                                    size="small"
                                    color={movement.type === 'IN' ? 'success' : 'error'}
                                  />
                                </TableCell>
                                <TableCell align="right">{movement.quantity}</TableCell>
                                <TableCell>{movement.supplier || movement.job}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Team Performance Tab */}
            <TabPanel value={tabValue} index={3}>
              <Grid container spacing={3}>
                {/* Team Productivity */}
                <Grid item xs={12} lg={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Team Productivity
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Team Member</TableCell>
                              <TableCell align="right">Jobs Completed</TableCell>
                              <TableCell align="right">Efficiency</TableCell>
                              <TableCell align="right">Rating</TableCell>
                              <TableCell>Performance</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {teamProductivity.map((member) => (
                              <TableRow key={member.name}>
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Avatar sx={{ width: 32, height: 32 }}>
                                      {member.name.split(' ').map(n => n[0]).join('')}
                                    </Avatar>
                                    {member.name}
                                  </Box>
                                </TableCell>
                                <TableCell align="right">{member.jobs}</TableCell>
                                <TableCell align="right">{member.efficiency}%</TableCell>
                                <TableCell align="right">
                                  <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                                    {member.rating}
                                    <Typography variant="body2" color="text.secondary">★</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <LinearProgress
                                    variant="determinate"
                                    value={member.efficiency}
                                    color={member.efficiency > 90 ? 'success' : 'primary'}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Performance Metrics */}
                <Grid item xs={12} lg={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Performance Metrics
                      </Typography>
                      <Stack spacing={2}>
                        {performanceMetrics.map((metric) => (
                          <Box key={metric.metric}>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="body2">{metric.metric}</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {metric.value}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={metric.value}
                              color={
                                metric.value > 90 ? 'success' :
                                metric.value > 70 ? 'primary' : 'warning'
                              }
                            />
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Team Workload */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Team Workload Distribution
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={teamWorkload}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="team" />
                          <YAxis />
                          <ChartTooltip />
                          <Legend />
                          <Bar dataKey="current" fill="#8884d8" name="Current Load" />
                          <Bar dataKey="capacity" fill="#82ca9d" name="Max Capacity" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Installations Tab */}
            <TabPanel value={tabValue} index={4}>
              <Grid container spacing={3}>
                {/* Installation Metrics */}
                <Grid item xs={12} lg={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Installation Statistics
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={installationMetrics}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                          <ChartTooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Count" />
                          <Bar yAxisId="right" dataKey="avgTime" fill="#82ca9d" name="Avg Days" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Maintenance Schedule */}
                <Grid item xs={12} lg={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Upcoming Maintenance
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Installation</TableCell>
                              <TableCell>Location</TableCell>
                              <TableCell>Next Service</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {maintenanceSchedule.map((item) => (
                              <TableRow key={item.installation}>
                                <TableCell>{item.installation}</TableCell>
                                <TableCell>{item.location}</TableCell>
                                <TableCell>{item.nextService}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={item.status}
                                    size="small"
                                    color={getStatusColor(item.status) as any}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;