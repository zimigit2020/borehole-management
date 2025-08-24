import React, { useState } from 'react';
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
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Typography,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Payment as PaymentIcon,
  Send as SendIcon,
  Cancel as CancelIcon,
  Print as PrintIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Invoice } from '../../services/financeService';

interface InvoiceListProps {
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
  onRecordPayment: (invoice: Invoice) => void;
  onRefresh: () => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  onViewInvoice,
  onRecordPayment,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.job?.jobNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || invoice.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, invoice: Invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

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
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const isOverdue = (invoice: Invoice) => {
    return invoice.status === 'sent' && new Date(invoice.dueDate) < new Date();
  };

  return (
    <Box>
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="sent">Sent</MenuItem>
            <MenuItem value="partially_paid">Partially Paid</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Job #</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Paid</TableCell>
              <TableCell align="right">Balance</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow 
                key={invoice.id}
                sx={{ 
                  backgroundColor: isOverdue(invoice) ? 'error.lighter' : 'inherit'
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {invoice.invoiceNumber}
                  </Typography>
                </TableCell>
                <TableCell>{invoice.job?.jobNumber || 'N/A'}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{invoice.clientName}</Typography>
                    {invoice.clientEmail && (
                      <Typography variant="caption" color="textSecondary">
                        {invoice.clientEmail}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                <TableCell>
                  {formatDate(invoice.dueDate)}
                  {isOverdue(invoice) && (
                    <Typography variant="caption" color="error" display="block">
                      Overdue
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(invoice.totalAmount)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(invoice.paidAmount)}
                </TableCell>
                <TableCell align="right">
                  <Typography 
                    variant="body2" 
                    fontWeight={invoice.balanceDue > 0 ? 'bold' : 'normal'}
                    color={invoice.balanceDue > 0 ? 'error' : 'text.primary'}
                  >
                    {formatCurrency(invoice.balanceDue)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={invoice.status.replace(/_/g, ' ').toUpperCase()}
                    color={getStatusColor(invoice.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => onViewInvoice(invoice)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                    <Tooltip title="Record Payment">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onRecordPayment(invoice)}
                      >
                        <PaymentIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, invoice)}
                  >
                    <MoreIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredInvoices.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="textSecondary">
            No invoices found matching your criteria
          </Typography>
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print Invoice</ListItemText>
        </MenuItem>
        {selectedInvoice?.status === 'draft' && (
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <SendIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Send to Client</ListItemText>
          </MenuItem>
        )}
        {selectedInvoice?.status !== 'cancelled' && selectedInvoice?.status !== 'paid' && (
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <CancelIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Cancel Invoice</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default InvoiceList;