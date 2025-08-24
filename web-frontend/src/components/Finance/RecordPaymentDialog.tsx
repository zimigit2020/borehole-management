import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import financeService, { Invoice, CreatePaymentDto } from '../../services/financeService';

interface RecordPaymentDialogProps {
  open: boolean;
  invoice: Invoice;
  onClose: () => void;
  onSuccess: () => void;
}

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'card', label: 'Card' },
];

const RecordPaymentDialog: React.FC<RecordPaymentDialogProps> = ({
  open,
  invoice,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreatePaymentDto>({
    invoiceId: invoice.id,
    amount: invoice.balanceDue,
    method: 'cash',
    paymentDate: new Date().toISOString(),
    referenceNumber: '',
    bankName: '',
    accountNumber: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (formData.amount <= 0) {
        setError('Payment amount must be greater than 0');
        return;
      }
      
      if (formData.amount > invoice.balanceDue) {
        setError(`Payment amount cannot exceed balance due (${formatCurrency(invoice.balanceDue)})`);
        return;
      }
      
      await financeService.recordPayment(formData);
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      invoiceId: invoice.id,
      amount: invoice.balanceDue,
      method: 'cash',
      paymentDate: new Date().toISOString(),
      referenceNumber: '',
      bankName: '',
      accountNumber: '',
      notes: '',
    });
    setError(null);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD',
    }).format(amount);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Record Payment</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Invoice: {invoice.invoiceNumber}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Client: {invoice.clientName}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Balance Due: <strong>{formatCurrency(invoice.balanceDue)}</strong>
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Payment Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              required
              inputProps={{ step: 0.01, min: 0, max: invoice.balanceDue }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                label="Payment Method"
              >
                {paymentMethods.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Payment Date"
                value={new Date(formData.paymentDate)}
                onChange={(date) => setFormData({ ...formData, paymentDate: date?.toISOString() || '' })}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>

          {(formData.method === 'bank_transfer' || formData.method === 'cheque') && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Reference Number"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Bank Name"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                />
              </Grid>
              {formData.method === 'cheque' && (
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Account Number"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  />
                </Grid>
              )}
            </>
          )}

          {formData.method === 'mobile_money' && (
            <Grid size={12}>
              <TextField
                fullWidth
                label="Transaction Reference"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              />
            </Grid>
          )}

          <Grid size={12}>
            <TextField
              fullWidth
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>

        {formData.amount === invoice.balanceDue && (
          <Alert severity="info" sx={{ mt: 2 }}>
            This payment will fully settle the invoice.
          </Alert>
        )}
        
        {formData.amount < invoice.balanceDue && formData.amount > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Partial payment. Remaining balance will be: {formatCurrency(invoice.balanceDue - formData.amount)}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || formData.amount <= 0}
        >
          Record Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecordPaymentDialog;