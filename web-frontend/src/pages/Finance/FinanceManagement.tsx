import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Alert,
  Tooltip,
  Stack,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Receipt,
  AccountBalance,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Payment,
  CalendarToday,
  Print,
  Email,
  Download,
  Upload,
  FilterList,
  MoreVert,
  CheckCircle,
  Warning,
  Error,
  Schedule,
  PictureAsPdf,
  Send,
  Paid,
  RequestQuote,
  PointOfSale,
  MoneyOff,
  Assessment,
} from '@mui/icons-material';

interface Invoice {
  id: string;
  invoiceNumber: string;
  jobId: string;
  jobName: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  terms?: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer';
  reference: string;
  notes?: string;
}

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  vendor: string;
  paymentMethod: string;
  reference: string;
  jobId?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  receipt?: string;
}

const FinanceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Mock data
  useEffect(() => {
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        jobId: 'JOB001',
        jobName: 'Venice Borehole Drilling',
        clientId: 'CLIENT001',
        clientName: 'Venice Community Trust',
        clientEmail: 'venice@community.zw',
        clientPhone: '+263 77 123 4567',
        issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          { id: '1', description: 'Site Survey & Assessment', quantity: 1, unitPrice: 500, total: 500 },
          { id: '2', description: 'Borehole Drilling (130m)', quantity: 130, unitPrice: 45, total: 5850 },
          { id: '3', description: 'Casing & Installation', quantity: 1, unitPrice: 1200, total: 1200 },
          { id: '4', description: 'Pump Installation', quantity: 1, unitPrice: 1650, total: 1650 },
        ],
        subtotal: 9200,
        tax: 1380,
        discount: 0,
        total: 10580,
        amountPaid: 5000,
        balance: 5580,
        status: 'partial',
        notes: 'Payment terms: 50% upfront, 50% on completion',
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        jobId: 'JOB002',
        jobName: 'Chivhu School Borehole',
        clientId: 'CLIENT002',
        clientName: 'Chivhu Primary School',
        clientEmail: 'admin@chivhuprimary.edu.zw',
        clientPhone: '+263 71 987 6543',
        issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          { id: '1', description: 'Geological Survey', quantity: 1, unitPrice: 450, total: 450 },
          { id: '2', description: 'Borehole Drilling (85m)', quantity: 85, unitPrice: 45, total: 3825 },
          { id: '3', description: 'Water Quality Testing', quantity: 1, unitPrice: 200, total: 200 },
        ],
        subtotal: 4475,
        tax: 671.25,
        discount: 200,
        total: 4946.25,
        amountPaid: 4946.25,
        balance: 0,
        status: 'paid',
      },
      {
        id: '3',
        invoiceNumber: 'INV-2024-003',
        jobId: 'JOB003',
        jobName: 'Mutare Industrial Borehole',
        clientId: 'CLIENT003',
        clientName: 'Mutare Beverages Ltd',
        clientEmail: 'accounts@mutarebev.co.zw',
        clientPhone: '+263 20 123 456',
        issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          { id: '1', description: 'Hydrogeological Assessment', quantity: 1, unitPrice: 800, total: 800 },
          { id: '2', description: 'Borehole Drilling (200m)', quantity: 200, unitPrice: 50, total: 10000 },
          { id: '3', description: 'High Capacity Pump System', quantity: 1, unitPrice: 3500, total: 3500 },
        ],
        subtotal: 14300,
        tax: 2145,
        discount: 0,
        total: 16445,
        amountPaid: 0,
        balance: 16445,
        status: 'sent',
      },
    ];

    const mockPayments: Payment[] = [
      {
        id: '1',
        invoiceId: '1',
        invoiceNumber: 'INV-2024-001',
        clientName: 'Venice Community Trust',
        amount: 5000,
        paymentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: 'bank_transfer',
        reference: 'TRF2024001',
        notes: 'Initial 50% payment',
      },
      {
        id: '2',
        invoiceId: '2',
        invoiceNumber: 'INV-2024-002',
        clientName: 'Chivhu Primary School',
        amount: 4946.25,
        paymentDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: 'bank_transfer',
        reference: 'TRF2024002',
      },
    ];

    const mockExpenses: Expense[] = [
      {
        id: '1',
        category: 'Fuel',
        description: 'Diesel for drilling rig - Venice job',
        amount: 350,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        vendor: 'Puma Energy',
        paymentMethod: 'cash',
        reference: 'RCPT2024001',
        jobId: 'JOB001',
        status: 'approved',
        approvedBy: 'John Manager',
      },
      {
        id: '2',
        category: 'Equipment',
        description: 'Drilling bits replacement',
        amount: 1200,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        vendor: 'Mining Supplies Co',
        paymentMethod: 'bank_transfer',
        reference: 'PO2024002',
        status: 'pending',
      },
      {
        id: '3',
        category: 'Labor',
        description: 'Contract drilling crew - 3 days',
        amount: 450,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        vendor: 'Workforce Solutions',
        paymentMethod: 'cash',
        reference: 'CASH2024001',
        jobId: 'JOB002',
        status: 'approved',
        approvedBy: 'Sarah Admin',
      },
    ];

    setInvoices(mockInvoices);
    setFilteredInvoices(mockInvoices);
    setPayments(mockPayments);
    setExpenses(mockExpenses);
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, statusFilter]);

  const filterInvoices = () => {
    let filtered = [...invoices];

    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.jobName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  };

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setInvoiceDialogOpen(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceDialogOpen(true);
  };

  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentDialogOpen(true);
  };

  const handleSendInvoice = (invoice: Invoice) => {
    console.log('Send invoice:', invoice.invoiceNumber);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    console.log('Print invoice:', invoice.invoiceNumber);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'partial':
        return 'info';
      case 'sent':
      case 'viewed':
        return 'primary';
      case 'overdue':
        return 'error';
      case 'draft':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle />;
      case 'partial':
        return <Schedule />;
      case 'overdue':
        return <Error />;
      case 'draft':
        return <Edit />;
      default:
        return <Receipt />;
    }
  };

  // Calculate financial statistics
  const stats = {
    totalRevenue: invoices.reduce((sum, inv) => sum + inv.amountPaid, 0),
    outstanding: invoices.reduce((sum, inv) => sum + inv.balance, 0),
    totalExpenses: expenses.filter(e => e.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0),
    profit: 0,
  };
  stats.profit = stats.totalRevenue - stats.totalExpenses;

  const recentActivity = [
    { type: 'payment', description: 'Payment received from Venice Community Trust', amount: 5000, date: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { type: 'invoice', description: 'Invoice sent to Mutare Beverages Ltd', amount: 16445, date: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    { type: 'expense', description: 'Fuel purchase approved', amount: -350, date: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Finance & Invoicing
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage invoices, track payments, and monitor financial health
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                    ${stats.totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    +12% from last month
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 50, color: 'rgba(255,255,255,0.5)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                    Outstanding
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                    ${stats.outstanding.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    3 pending invoices
                  </Typography>
                </Box>
                <RequestQuote sx={{ fontSize: 50, color: 'rgba(255,255,255,0.5)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f5365c 0%, #f56565 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                    Total Expenses
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                    ${stats.totalExpenses.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    This month
                  </Typography>
                </Box>
                <MoneyOff sx={{ fontSize: 50, color: 'rgba(255,255,255,0.5)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #11cdef 0%, #1171ef 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                    Net Profit
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                    ${stats.profit.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {((stats.profit / stats.totalRevenue) * 100).toFixed(1)}% margin
                  </Typography>
                </Box>
                <Assessment sx={{ fontSize: 50, color: 'rgba(255,255,255,0.5)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Invoices" icon={<Receipt />} iconPosition="start" />
          <Tab label="Payments" icon={<Paid />} iconPosition="start" />
          <Tab label="Expenses" icon={<Payment />} iconPosition="start" />
          <Tab label="Reports" icon={<Assessment />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          {/* Search and Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              placeholder="Search invoices..."
              variant="outlined"
              size="small"
              sx={{ flex: 1 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="partial">Partial</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateInvoice}
            >
              Create Invoice
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
            >
              Export
            </Button>
          </Box>

          {/* Invoices Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Job</TableCell>
                  <TableCell align="center">Issue Date</TableCell>
                  <TableCell align="center">Due Date</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Paid</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((invoice) => (
                    <TableRow key={invoice.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {invoice.invoiceNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {invoice.clientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {invoice.clientEmail}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{invoice.jobName}</TableCell>
                      <TableCell align="center">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography variant="body2">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </Typography>
                          {new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' && (
                            <Typography variant="caption" color="error">
                              Overdue
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ${invoice.total.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        ${invoice.amountPaid.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            color: invoice.balance > 0 ? 'warning.main' : 'success.main'
                          }}
                        >
                          ${invoice.balance.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={invoice.status}
                          color={getStatusColor(invoice.status) as any}
                          size="small"
                          icon={getStatusIcon(invoice.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="View">
                            <IconButton size="small" onClick={() => handleViewInvoice(invoice)}>
                              <Receipt fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {invoice.status !== 'paid' && (
                            <Tooltip title="Record Payment">
                              <IconButton size="small" color="success" onClick={() => handleRecordPayment(invoice)}>
                                <Paid fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Send">
                            <IconButton size="small" color="primary" onClick={() => handleSendInvoice(invoice)}>
                              <Send fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Print">
                            <IconButton size="small" onClick={() => handlePrintInvoice(invoice)}>
                              <Print fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredInvoices.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>Payment History</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {payment.invoiceNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{payment.clientName}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        +${payment.amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.paymentMethod.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {payment.reference}
                      </Typography>
                    </TableCell>
                    <TableCell>{payment.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Expense Tracking</Typography>
            <Button variant="contained" startIcon={<Add />}>
              Record Expense
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Job</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id} hover>
                    <TableCell>
                      {new Date(expense.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip label={expense.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                        -${expense.amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{expense.vendor}</TableCell>
                    <TableCell>{expense.jobId || '-'}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={expense.status}
                        color={expense.status === 'approved' ? 'success' : expense.status === 'rejected' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="View Receipt">
                          <IconButton size="small">
                            <Receipt fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {expense.status === 'pending' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton size="small" color="success">
                                <CheckCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton size="small" color="error">
                                <Error fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid size={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Financial Overview</Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography color="text.secondary">Revenue vs Expenses Chart</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid size={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Recent Activity</Typography>
              <List>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        {activity.type === 'payment' ? (
                          <Paid color="success" />
                        ) : activity.type === 'invoice' ? (
                          <Receipt color="primary" />
                        ) : (
                          <Payment color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={new Date(activity.date).toLocaleString()}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: activity.amount > 0 ? 'success.main' : 'error.main'
                        }}
                      >
                        {activity.amount > 0 ? '+' : ''}${Math.abs(activity.amount).toLocaleString()}
                      </Typography>
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default FinanceManagement;