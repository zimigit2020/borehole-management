import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface CreateExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  expense?: any;
}

const categories = [
  { value: 'fuel', label: 'Fuel' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'materials', label: 'Materials' },
  { value: 'labor', label: 'Labor' },
  { value: 'transport', label: 'Transport' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'meals', label: 'Meals' },
  { value: 'office_supplies', label: 'Office Supplies' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'permits', label: 'Permits & Licenses' },
  { value: 'professional_fees', label: 'Professional Fees' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'miscellaneous', label: 'Miscellaneous' },
];

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'company_card', label: 'Company Card' },
  { value: 'personal_expense', label: 'Personal (Needs Reimbursement)' },
];

const CreateExpenseDialog: React.FC<CreateExpenseDialogProps> = ({
  open,
  onClose,
  onSuccess,
  expense,
}) => {
  const [formData, setFormData] = useState({
    description: '',
    category: 'materials',
    amount: '',
    currency: 'USD',
    expenseDate: new Date(),
    paymentMethod: 'cash',
    vendor: '',
    vendorInvoiceNumber: '',
    receiptNumber: '',
    jobId: '',
    notes: '',
    requiresReimbursement: false,
  });
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expense) {
      setFormData({
        ...expense,
        expenseDate: new Date(expense.expenseDate),
      });
    }
    fetchJobs();
  }, [expense]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('access_token');
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

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const url = expense
        ? `${process.env.REACT_APP_API_URL}/finance/expenses/${expense.id}`
        : `${process.env.REACT_APP_API_URL}/finance/expenses`;

      const response = await fetch(url, {
        method: expense ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          expenseDate: formData.expenseDate.toISOString(),
          jobId: formData.jobId || undefined,
        }),
      });

      if (response.ok) {
        onSuccess?.();
        onClose();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save expense');
      }
    } catch (error) {
      setError('An error occurred while saving the expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{expense ? 'Edit Expense' : 'Create New Expense'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            required
            multiline
            rows={2}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              fullWidth
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Payment Method"
              value={formData.paymentMethod}
              onChange={(e) => {
                const method = e.target.value;
                setFormData({
                  ...formData,
                  paymentMethod: method,
                  requiresReimbursement: method === 'personal_expense',
                });
              }}
              fullWidth
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method.value} value={method.value}>
                  {method.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              select
              label="Currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="ZWG">ZWG</MenuItem>
              <MenuItem value="ZAR">ZAR</MenuItem>
            </TextField>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Expense Date"
                value={formData.expenseDate}
                onChange={(date) => date && setFormData({ ...formData, expenseDate: date })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Vendor"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              fullWidth
            />

            <TextField
              select
              label="Job (Optional)"
              value={formData.jobId}
              onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
              fullWidth
            >
              <MenuItem value="">None</MenuItem>
              {jobs.map((job) => (
                <MenuItem key={job.id} value={job.id}>
                  {job.jobNumber} - {job.clientName}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Vendor Invoice #"
              value={formData.vendorInvoiceNumber}
              onChange={(e) => setFormData({ ...formData, vendorInvoiceNumber: e.target.value })}
              fullWidth
            />

            <TextField
              label="Receipt #"
              value={formData.receiptNumber}
              onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
              fullWidth
            />
          </Box>

          <TextField
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.requiresReimbursement}
                onChange={(e) => setFormData({ ...formData, requiresReimbursement: e.target.checked })}
              />
            }
            label="Requires Reimbursement"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.description || !formData.amount}
        >
          {loading ? <CircularProgress size={24} /> : expense ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateExpenseDialog;