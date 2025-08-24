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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Edit as EditIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import financeService, { 
  ExchangeRate, 
  CreateExchangeRateDto, 
  UpdateExchangeRateDto,
  SupportedCurrency 
} from '../../services/financeService';

interface ExchangeRateDialogProps {
  open: boolean;
  onClose: () => void;
}

const ExchangeRateDialog: React.FC<ExchangeRateDialogProps> = ({
  open,
  onClose,
}) => {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [formData, setFormData] = useState<CreateExchangeRateDto>({
    fromCurrency: SupportedCurrency.USD,
    toCurrency: SupportedCurrency.ZAR,
    rate: 1,
    effectiveDate: new Date().toISOString(),
    notes: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadExchangeRates();
    }
  }, [open]);

  const loadExchangeRates = async () => {
    try {
      const data = await financeService.getExchangeRates(true);
      setRates(data);
    } catch (error) {
      console.error('Error loading exchange rates:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (formData.fromCurrency === formData.toCurrency) {
        setError('Cannot set exchange rate for the same currency');
        return;
      }

      if (editMode) {
        await financeService.updateExchangeRate(
          formData.fromCurrency,
          formData.toCurrency,
          {
            rate: formData.rate,
            notes: formData.notes,
          },
        );
      } else {
        await financeService.createExchangeRate(formData);
      }

      await loadExchangeRates();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save exchange rate');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rate: ExchangeRate) => {
    setFormData({
      fromCurrency: rate.fromCurrency as SupportedCurrency,
      toCurrency: rate.toCurrency as SupportedCurrency,
      rate: rate.rate,
      effectiveDate: rate.effectiveDate,
      notes: rate.notes || '',
    });
    setEditMode(true);
  };

  const resetForm = () => {
    setFormData({
      fromCurrency: SupportedCurrency.USD,
      toCurrency: SupportedCurrency.ZAR,
      rate: 1,
      effectiveDate: new Date().toISOString(),
      notes: '',
    });
    setEditMode(false);
    setError(null);
  };

  const getCurrencyLabel = (currency: string) => {
    switch (currency) {
      case SupportedCurrency.USD:
        return 'USD - US Dollar';
      case SupportedCurrency.ZAR:
        return 'ZAR - South African Rand';
      case SupportedCurrency.ZWG:
        return 'ZWG - Zimbabwe Gold';
      default:
        return currency;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Manage Exchange Rates</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            {editMode ? 'Update Exchange Rate' : 'Add New Exchange Rate'}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth required disabled={editMode}>
                <InputLabel>From Currency</InputLabel>
                <Select
                  value={formData.fromCurrency}
                  onChange={(e) => setFormData({ ...formData, fromCurrency: e.target.value as SupportedCurrency })}
                  label="From Currency"
                >
                  <MenuItem value={SupportedCurrency.USD}>USD - US Dollar</MenuItem>
                  <MenuItem value={SupportedCurrency.ZAR}>ZAR - South African Rand</MenuItem>
                  <MenuItem value={SupportedCurrency.ZWG}>ZWG - Zimbabwe Gold</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth required disabled={editMode}>
                <InputLabel>To Currency</InputLabel>
                <Select
                  value={formData.toCurrency}
                  onChange={(e) => setFormData({ ...formData, toCurrency: e.target.value as SupportedCurrency })}
                  label="To Currency"
                >
                  <MenuItem value={SupportedCurrency.USD}>USD - US Dollar</MenuItem>
                  <MenuItem value={SupportedCurrency.ZAR}>ZAR - South African Rand</MenuItem>
                  <MenuItem value={SupportedCurrency.ZWG}>ZWG - Zimbabwe Gold</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Exchange Rate"
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                required
                inputProps={{ step: 0.000001, min: 0.000001 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Effective Date"
                  value={new Date(formData.effectiveDate)}
                  onChange={(date) => setFormData({ ...formData, effectiveDate: date?.toISOString() || '' })}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {editMode ? 'Update' : 'Add'} Rate
                </Button>
                {editMode && (
                  <Button variant="outlined" onClick={resetForm}>
                    Cancel Edit
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Current Exchange Rates
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell align="right">Rate</TableCell>
                <TableCell>Effective Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell>{getCurrencyLabel(rate.fromCurrency)}</TableCell>
                  <TableCell>{getCurrencyLabel(rate.toCurrency)}</TableCell>
                  <TableCell align="right">{rate.rate.toFixed(6)}</TableCell>
                  <TableCell>{format(new Date(rate.effectiveDate), 'PPP')}</TableCell>
                  <TableCell>
                    <Chip
                      label={rate.isActive ? 'Active' : 'Inactive'}
                      color={rate.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(rate)}
                      disabled={!rate.isActive}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {rates.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography color="textSecondary">
              No exchange rates configured yet
            </Typography>
          </Box>
        )}

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Note:</strong> The system automatically calculates inverse rates. 
            For example, if you set USD to ZAR rate, the ZAR to USD rate is automatically available.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExchangeRateDialog;