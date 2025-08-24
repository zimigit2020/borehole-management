import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  Typography,
} from '@mui/material';
import { InventoryItem } from '../../services/inventoryService';

interface LowStockAlertProps {
  items: InventoryItem[];
  onRefresh: () => void;
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <Alert severity="warning" sx={{ mb: 3 }}>
      <AlertTitle>Low Stock Alert</AlertTitle>
      <Typography variant="body2" sx={{ mb: 1 }}>
        The following items are running low on stock and need to be reordered:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {items.slice(0, 5).map((item) => (
          <Chip
            key={item.id}
            label={`${item.name} (${item.quantityInStock}/${item.minimumStock} ${item.unit})`}
            color="warning"
            size="small"
            variant="outlined"
          />
        ))}
        {items.length > 5 && (
          <Chip
            label={`+${items.length - 5} more`}
            color="warning"
            size="small"
          />
        )}
      </Box>
    </Alert>
  );
};

export default LowStockAlert;