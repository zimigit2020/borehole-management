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
} from '@mui/material';
import { format } from 'date-fns';
import inventoryService, { InventoryMovement } from '../../services/inventoryService';

const InventoryMovements: React.FC = () => {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getMovements();
      setMovements(data);
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'stock_in':
        return 'success';
      case 'stock_out':
        return 'error';
      case 'reserved':
        return 'warning';
      case 'released':
        return 'info';
      case 'adjustment':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatMovementType = (type: string) => {
    return type.replace(/_/g, ' ').toUpperCase();
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
        Recent Stock Movements
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell align="center">Previous Stock</TableCell>
              <TableCell align="center">New Stock</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell>
                  {format(new Date(movement.createdAt), 'MMM dd, yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  {movement.item?.name || 'N/A'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={formatMovementType(movement.type)}
                    color={getMovementColor(movement.type) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  {movement.quantity}
                </TableCell>
                <TableCell align="center">
                  {movement.previousStock || '-'}
                </TableCell>
                <TableCell align="center">
                  {movement.newStock || '-'}
                </TableCell>
                <TableCell>
                  {movement.reference || movement.jobId || '-'}
                </TableCell>
                <TableCell>
                  {movement.user?.username || '-'}
                </TableCell>
                <TableCell>
                  {movement.notes || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InventoryMovements;