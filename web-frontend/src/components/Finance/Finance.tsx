import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Receipt as InvoiceIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import financeService, { Invoice, FinancialSummary } from '../../services/financeService';
import InvoiceList from './InvoiceList';
import PaymentsList from './PaymentsList';
import FinancialReports from './FinancialReports';
import CreateInvoiceDialog from './CreateInvoiceDialog';
import InvoiceDetailDialog from './InvoiceDetailDialog';
import RecordPaymentDialog from './RecordPaymentDialog';
import ExchangeRateDialog from './ExchangeRateDialog';

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
      id={`finance-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Finance: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceDetailOpen, setInvoiceDetailOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [exchangeRateDialogOpen, setExchangeRateDialogOpen] = useState(false);

  // Check if user has finance access (admin or project_manager)
  const hasFinanceAccess = user?.role === 'admin' || user?.role === 'project_manager';
  const canCreateInvoice = hasFinanceAccess;
  const canRecordPayment = hasFinanceAccess;
  const canViewReports = hasFinanceAccess;

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const [invoicesData, overdueData, summaryData] = await Promise.all([
        financeService.getInvoices(),
        financeService.getOverdueInvoices(),
        financeService.getFinancialSummary(
          startOfMonth.toISOString(),
          endOfMonth.toISOString()
        ),
      ]);

      setInvoices(invoicesData);
      setOverdueInvoices(overdueData);
      setFinancialSummary(summaryData);
    } catch (err: any) {
      console.error('Error loading financial data:', err);
      setError(err.response?.data?.message || 'Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceDetailOpen(true);
  };

  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setCreateInvoiceOpen(false);
    loadFinancialData();
  };

  const handlePaymentSuccess = () => {
    setPaymentDialogOpen(false);
    setSelectedInvoice(null);
    loadFinancialData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading && invoices.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Show access denied message for users without finance access
  if (!hasFinanceAccess) {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1">
            Finance Management
          </Typography>
        </Box>
        <Alert severity="warning" icon={<LockIcon />}>
          <Typography variant="h6" gutterBottom>
            Access Restricted
          </Typography>
          <Typography>
            You don't have permission to access finance management. 
            Only administrators and project managers can view and manage financial data.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Finance Management
        </Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={loadFinancialData} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {canCreateInvoice && (
            <>
              <Button
                variant="outlined"
                startIcon={<MoneyIcon />}
                onClick={() => setExchangeRateDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                Exchange Rates
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateInvoiceOpen(true)}
              >
                Create Invoice
              </Button>
            </>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Invoiced
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(financialSummary?.totalInvoiced || 0)}
                  </Typography>
                </Box>
                <InvoiceIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Paid
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {formatCurrency(financialSummary?.totalPaid || 0)}
                  </Typography>
                </Box>
                <PaymentIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Outstanding
                  </Typography>
                  <Typography variant="h5" color="warning.main">
                    {formatCurrency(financialSummary?.totalOutstanding || 0)}
                  </Typography>
                </Box>
                <MoneyIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Overdue
                  </Typography>
                  <Typography variant="h5" color="error.main">
                    {overdueInvoices.length}
                  </Typography>
                </Box>
                <WarningIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Overdue Alert */}
      {overdueInvoices.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Overdue Invoices Requiring Attention
          </Typography>
          <Box sx={{ mt: 1 }}>
            {overdueInvoices.slice(0, 3).map((invoice) => (
              <Typography key={invoice.id} variant="body2">
                • {invoice.invoiceNumber} - {invoice.clientName} - {formatCurrency(invoice.balanceDue)} 
                (Due: {new Date(invoice.dueDate).toLocaleDateString()})
              </Typography>
            ))}
            {overdueInvoices.length > 3 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                ... and {overdueInvoices.length - 3} more
              </Typography>
            )}
          </Box>
        </Alert>
      )}

      {/* Main Content */}
      <Paper>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Invoices" icon={<InvoiceIcon />} iconPosition="start" />
          <Tab label="Payments" icon={<PaymentIcon />} iconPosition="start" />
          <Tab label="Reports" icon={<ReportIcon />} iconPosition="start" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <InvoiceList
            invoices={invoices}
            onViewInvoice={handleViewInvoice}
            onRecordPayment={handleRecordPayment}
            onRefresh={loadFinancialData}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <PaymentsList onRefresh={loadFinancialData} />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <FinancialReports />
        </TabPanel>
      </Paper>

      {/* Dialogs */}
      <CreateInvoiceDialog
        open={createInvoiceOpen}
        onClose={() => setCreateInvoiceOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <ExchangeRateDialog
        open={exchangeRateDialogOpen}
        onClose={() => setExchangeRateDialogOpen(false)}
      />

      {selectedInvoice && (
        <>
          <InvoiceDetailDialog
            open={invoiceDetailOpen}
            invoice={selectedInvoice}
            onClose={() => {
              setInvoiceDetailOpen(false);
              setSelectedInvoice(null);
            }}
            onUpdate={loadFinancialData}
          />

          <RecordPaymentDialog
            open={paymentDialogOpen}
            invoice={selectedInvoice}
            onClose={() => {
              setPaymentDialogOpen(false);
              setSelectedInvoice(null);
            }}
            onSuccess={handlePaymentSuccess}
          />
        </>
      )}
    </Box>
  );
};

export default Finance;