import React, { useState, useEffect } from 'react';
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
  IconButton,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addDays } from 'date-fns';
import financeService, { CreateInvoiceDto, InvoiceItem, SupportedCurrency } from '../../services/financeService';
import jobsService, { Job } from '../../services/jobsService';

interface CreateInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateInvoiceDialog: React.FC<CreateInvoiceDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateInvoiceDto>({
    jobId: '',
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    clientPhone: '',
    issueDate: new Date().toISOString(),
    dueDate: addDays(new Date(), 30).toISOString(),
    items: [
      {
        description: '',
        quantity: 1,
        unit: 'unit',
        unitPrice: 0,
      },
    ],
    taxRate: 0,
    discountAmount: 0,
    currency: SupportedCurrency.USD,
    paymentTerms: 'Net 30',
    notes: '',
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadJobs();
    }
  }, [open]);

  const loadJobs = async () => {
    try {
      const data = await jobsService.getJobs();
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleJobChange = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setFormData({
        ...formData,
        jobId,
        clientName: job.clientName,
        clientAddress: job.siteAddress,
        clientEmail: job.clientEmail || '',
        clientPhone: job.clientPhone,
      });
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    
    // Calculate total price
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          description: '',
          quantity: 1,
          unit: 'unit',
          unitPrice: 0,
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = (subtotal * (formData.taxRate || 0)) / 100;
    const total = subtotal + taxAmount - (formData.discountAmount || 0);
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      await financeService.createInvoice(formData);
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      jobId: '',
      clientName: '',
      clientAddress: '',
      clientEmail: '',
      clientPhone: '',
      issueDate: new Date().toISOString(),
      dueDate: addDays(new Date(), 30).toISOString(),
      items: [
        {
          description: '',
          quantity: 1,
          unit: 'unit',
          unitPrice: 0,
        },
      ],
      taxRate: 0,
      discountAmount: 0,
      currency: 'USD',
      paymentTerms: 'Net 30',
      notes: '',
    });
    setError(null);
    onClose();
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Invoice</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Job Selection */}
          <Grid size={12}>
            <FormControl fullWidth required>
              <InputLabel>Job</InputLabel>
              <Select
                value={formData.jobId}
                onChange={(e) => handleJobChange(e.target.value)}
                label="Job"
              >
                {jobs.map((job) => (
                  <MenuItem key={job.id} value={job.id}>
                    {job.jobNumber} - {job.clientName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Client Information */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Client Name"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Client Phone"
              value={formData.clientPhone}
              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Client Address"
              value={formData.clientAddress}
              onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
              required
            />
          </Grid>

          {/* Dates */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Issue Date"
                value={new Date(formData.issueDate)}
                onChange={(date) => setFormData({ ...formData, issueDate: date?.toISOString() || '' })}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={new Date(formData.dueDate)}
                onChange={(date) => setFormData({ ...formData, dueDate: date?.toISOString() || '' })}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Invoice Items */}
          <Grid size={12}>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Invoice Items
            </Typography>
            <Divider />
          </Grid>

          {formData.items.map((item, index) => (
            <React.Fragment key={index}>
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextField
                  fullWidth
                  label="Description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField
                  fullWidth
                  label="Unit"
                  value={item.unit}
                  onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 10, sm: 2 }}>
                <TextField
                  fullWidth
                  label="Unit Price"
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 2, sm: 1 }}>
                <IconButton
                  onClick={() => removeItem(index)}
                  disabled={formData.items.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </React.Fragment>
          ))}

          <Grid size={12}>
            <Button
              startIcon={<AddIcon />}
              onClick={addItem}
              variant="outlined"
              size="small"
            >
              Add Item
            </Button>
          </Grid>

          {/* Currency Selection */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth required>
              <InputLabel>Currency</InputLabel>
              <Select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                label="Currency"
              >
                <MenuItem value={SupportedCurrency.USD}>USD - US Dollar</MenuItem>
                <MenuItem value={SupportedCurrency.ZAR}>ZAR - South African Rand</MenuItem>
                <MenuItem value={SupportedCurrency.ZWG}>ZWG - Zimbabwe Gold</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Tax & Discount */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Tax Rate (%)"
              type="number"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Discount Amount"
              type="number"
              value={formData.discountAmount}
              onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
            />
          </Grid>

          {/* Notes */}
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

          {/* Totals */}
          <Grid size={12}>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2">
                Subtotal: {new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: formData.currency || SupportedCurrency.USD 
                }).format(subtotal)}
              </Typography>
              <Typography variant="body2">
                Tax: {new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: formData.currency || SupportedCurrency.USD 
                }).format(taxAmount)}
              </Typography>
              {(formData.discountAmount || 0) > 0 && (
                <Typography variant="body2">
                  Discount: -{new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: formData.currency || SupportedCurrency.USD 
                  }).format(formData.discountAmount || 0)}
                </Typography>
              )}
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6">
                Total: {new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: formData.currency || SupportedCurrency.USD 
                }).format(total)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !formData.jobId || formData.items.length === 0}
        >
          Create Invoice
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateInvoiceDialog;