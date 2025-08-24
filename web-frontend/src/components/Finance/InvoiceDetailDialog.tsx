import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { format } from 'date-fns';
import { Invoice } from '../../services/financeService';

interface InvoiceDetailDialogProps {
  open: boolean;
  invoice: Invoice;
  onClose: () => void;
  onUpdate: () => void;
}

const InvoiceDetailDialog: React.FC<InvoiceDetailDialogProps> = ({
  open,
  invoice,
  onClose,
  onUpdate,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'partially_paid':
        return 'info';
      case 'sent':
        return 'primary';
      case 'overdue':
        return 'error';
      case 'draft':
        return 'default';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'PPP');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Invoice {invoice.invoiceNumber}</Typography>
          <Chip
            label={invoice.status.replace(/_/g, ' ').toUpperCase()}
            color={getStatusColor(invoice.status) as any}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Client Information */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Client Information
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="textSecondary">Name</Typography>
              <Typography variant="body1">{invoice.clientName}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="textSecondary">Phone</Typography>
              <Typography variant="body1">{invoice.clientPhone || 'N/A'}</Typography>
            </Grid>
            <Grid size={12}>
              <Typography variant="body2" color="textSecondary">Address</Typography>
              <Typography variant="body1">{invoice.clientAddress}</Typography>
            </Grid>
            {invoice.clientEmail && (
              <Grid size={12}>
                <Typography variant="body2" color="textSecondary">Email</Typography>
                <Typography variant="body1">{invoice.clientEmail}</Typography>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Invoice Details */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Invoice Details
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" color="textSecondary">Issue Date</Typography>
              <Typography variant="body1">{formatDate(invoice.issueDate)}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" color="textSecondary">Due Date</Typography>
              <Typography variant="body1">{formatDate(invoice.dueDate)}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" color="textSecondary">Payment Terms</Typography>
              <Typography variant="body1">{invoice.paymentTerms || 'N/A'}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Invoice Items */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Items
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="center">Unit</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="center">{item.unit}</TableCell>
                    <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Totals */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Box sx={{ minWidth: 300 }}>
              <Grid container spacing={1}>
                <Grid size={6}>
                  <Typography variant="body2">Subtotal:</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" align="right">
                    {formatCurrency(invoice.subtotal)}
                  </Typography>
                </Grid>
                {invoice.taxAmount > 0 && (
                  <>
                    <Grid size={6}>
                      <Typography variant="body2">Tax ({invoice.taxRate}%):</Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="body2" align="right">
                        {formatCurrency(invoice.taxAmount)}
                      </Typography>
                    </Grid>
                  </>
                )}
                {invoice.discountAmount > 0 && (
                  <>
                    <Grid size={6}>
                      <Typography variant="body2">Discount:</Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="body2" align="right">
                        -{formatCurrency(invoice.discountAmount)}
                      </Typography>
                    </Grid>
                  </>
                )}
                <Grid size={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid size={6}>
                  <Typography variant="h6">Total:</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="h6" align="right">
                    {formatCurrency(invoice.totalAmount)}
                  </Typography>
                </Grid>
                {invoice.paidAmount > 0 && (
                  <>
                    <Grid size={6}>
                      <Typography variant="body2" color="success.main">Paid:</Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="body2" align="right" color="success.main">
                        {formatCurrency(invoice.paidAmount)}
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="body1" fontWeight="bold">Balance Due:</Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="body1" align="right" fontWeight="bold" color="error">
                        {formatCurrency(invoice.balanceDue)}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </Box>

          {/* Notes */}
          {invoice.notes && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Notes
              </Typography>
              <Typography variant="body2">{invoice.notes}</Typography>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceDetailDialog;