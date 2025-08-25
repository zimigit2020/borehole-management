import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Button,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Receipt as ReceiptIcon,
  AttachMoney as ReimburseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  expenseDate: string;
  status: string;
  vendor?: string;
  jobId?: string;
  submittedBy?: any;
  approvedBy?: any;
  notes?: string;
  requiresReimbursement?: boolean;
  reimbursedAt?: string;
}

interface ExpensesListProps {
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onReimburse?: (id: string) => void;
  userRole?: string;
}

const ExpensesList: React.FC<ExpensesListProps> = ({
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onReimburse,
  userRole,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchExpenses();
  }, [statusFilter, categoryFilter]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/finance/expenses?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'reimbursed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
  };

  const canManageExpense = (expense: Expense) => {
    return userRole === 'admin' || userRole === 'manager';
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
          <MenuItem value="reimbursed">Reimbursed</MenuItem>
        </TextField>

        <TextField
          select
          label="Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Categories</MenuItem>
          <MenuItem value="fuel">Fuel</MenuItem>
          <MenuItem value="equipment">Equipment</MenuItem>
          <MenuItem value="materials">Materials</MenuItem>
          <MenuItem value="labor">Labor</MenuItem>
          <MenuItem value="transport">Transport</MenuItem>
          <MenuItem value="accommodation">Accommodation</MenuItem>
          <MenuItem value="meals">Meals</MenuItem>
          <MenuItem value="office_supplies">Office Supplies</MenuItem>
          <MenuItem value="utilities">Utilities</MenuItem>
          <MenuItem value="maintenance">Maintenance</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </TextField>

        <Button onClick={fetchExpenses} startIcon={<ReceiptIcon />}>
          Refresh
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted By</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography>Loading expenses...</Typography>
                </TableCell>
              </TableRow>
            ) : expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography>No expenses found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              expenses
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {format(new Date(expense.expenseDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{expense.description}</Typography>
                      {expense.notes && (
                        <Typography variant="caption" color="textSecondary">
                          {expense.notes}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{getCategoryLabel(expense.category)}</TableCell>
                    <TableCell>{expense.vendor || '-'}</TableCell>
                    <TableCell align="right">
                      {expense.currency} {expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={expense.status}
                        color={getStatusColor(expense.status) as any}
                        size="small"
                      />
                      {expense.requiresReimbursement && !expense.reimbursedAt && (
                        <Chip
                          label="Needs Reimbursement"
                          color="warning"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {expense.submittedBy?.name || '-'}
                    </TableCell>
                    <TableCell align="center">
                      {expense.status === 'pending' && canManageExpense(expense) && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => onApprove?.(expense.id)}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onReject?.(expense.id)}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {expense.status === 'approved' && 
                       expense.requiresReimbursement && 
                       !expense.reimbursedAt &&
                       canManageExpense(expense) && (
                        <Tooltip title="Record Reimbursement">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onReimburse?.(expense.id)}
                          >
                            <ReimburseIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {expense.status === 'pending' && (
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => onEdit?.(expense)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {expense.status === 'pending' && (
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete?.(expense.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={expenses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>
    </Box>
  );
};

export default ExpensesList;