import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  CheckCircle as VerifyIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import financeService, { Payment } from '../../services/financeService';

interface PaymentsListProps {
  onRefresh: () => void;
}

const PaymentsList: React.FC<PaymentsListProps> = ({ onRefresh }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await financeService.getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId: string) => {
    try {
      await financeService.verifyPayment(paymentId);
      loadPayments();
      onRefresh();
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'success';
      case 'bank_transfer':
        return 'info';
      case 'cheque':
        return 'warning';
      case 'mobile_money':
        return 'primary';
      case 'card':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment History
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Payment #</TableCell>
              <TableCell>Invoice #</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Payment Date</TableCell>
              <TableCell>Method</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {payment.paymentNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  {payment.invoice?.invoiceNumber || 'N/A'}
                </TableCell>
                <TableCell>
                  {payment.invoice?.clientName || 'N/A'}
                </TableCell>
                <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                <TableCell>
                  <Chip
                    label={payment.method.replace(/_/g, ' ').toUpperCase()}
                    color={getMethodColor(payment.method) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {formatCurrency(payment.amount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {payment.referenceNumber || '-'}
                  {payment.bankName && (
                    <Typography variant="caption" display="block" color="textSecondary">
                      {payment.bankName}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {payment.isVerified ? (
                    <Chip
                      label="Verified"
                      color="success"
                      size="small"
                      icon={<VerifyIcon />}
                    />
                  ) : (
                    <Chip
                      label="Pending"
                      color="warning"
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Invoice">
                    <IconButton size="small">
                      <ReceiptIcon />
                    </IconButton>
                  </Tooltip>
                  {!payment.isVerified && (
                    <Tooltip title="Verify Payment">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleVerifyPayment(payment.id)}
                      >
                        <VerifyIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {payments.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="textSecondary">
            No payments recorded yet
          </Typography>
        </Box>
      )}

      {/* Summary */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Total Payments
            </Typography>
            <Typography variant="h6">
              {payments.length}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Total Collected
            </Typography>
            <Typography variant="h6" color="success.main">
              {formatCurrency(
                payments.reduce((sum, p) => sum + p.amount, 0)
              )}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Verified Payments
            </Typography>
            <Typography variant="h6">
              {payments.filter(p => p.isVerified).length} / {payments.length}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default PaymentsList;