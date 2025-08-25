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
  Send as SendIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  LocalShipping as ReceiveIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  status: string;
  priority: string;
  supplier: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  totalAmount: number;
  currency: string;
  createdBy?: any;
  approvedBy?: any;
  items?: any[];
}

interface PurchaseOrdersListProps {
  onView?: (order: PurchaseOrder) => void;
  onEdit?: (order: PurchaseOrder) => void;
  onDelete?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onSend?: (id: string) => void;
  onReceive?: (order: PurchaseOrder) => void;
  userRole?: string;
}

const PurchaseOrdersList: React.FC<PurchaseOrdersListProps> = ({
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onSend,
  onReceive,
  userRole,
}) => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPurchaseOrders();
  }, [statusFilter]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/purchase-orders?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'pending_approval':
        return 'warning';
      case 'approved':
        return 'info';
      case 'sent':
        return 'primary';
      case 'partially_received':
        return 'warning';
      case 'received':
        return 'success';
      case 'cancelled':
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'normal':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const canManageOrder = () => {
    return userRole === 'admin' || userRole === 'manager' || userRole === 'inventory_manager';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toUpperCase();
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
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="pending_approval">Pending Approval</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="sent">Sent</MenuItem>
          <MenuItem value="partially_received">Partially Received</MenuItem>
          <MenuItem value="received">Received</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </TextField>

        <Button onClick={fetchPurchaseOrders}>Refresh</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Number</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Expected Delivery</TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography>Loading purchase orders...</Typography>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography>No purchase orders found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {order.orderNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.orderDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{order.supplier}</TableCell>
                    <TableCell>
                      {order.expectedDeliveryDate
                        ? format(new Date(order.expectedDeliveryDate), 'MMM dd, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {order.currency} {order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.priority}
                        color={getPriorityColor(order.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatStatus(order.status)}
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => onView?.(order)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {order.status === 'draft' && canManageOrder() && (
                        <>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => onEdit?.(order)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Submit for Approval">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => onApprove?.(order.id)}
                            >
                              <SendIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}

                      {order.status === 'pending_approval' && canManageOrder() && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => onApprove?.(order.id)}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onReject?.(order.id)}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}

                      {order.status === 'approved' && canManageOrder() && (
                        <Tooltip title="Send to Supplier">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onSend?.(order.id)}
                          >
                            <SendIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {(order.status === 'sent' || order.status === 'partially_received') &&
                        canManageOrder() && (
                          <Tooltip title="Receive Items">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => onReceive?.(order)}
                            >
                              <ReceiveIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                      {order.status === 'draft' && canManageOrder() && (
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete?.(order.id)}
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
          count={orders.length}
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

export default PurchaseOrdersList;