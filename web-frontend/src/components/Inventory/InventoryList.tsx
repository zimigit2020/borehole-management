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
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Adjust as AdjustIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { InventoryItem } from '../../services/inventoryService';

interface InventoryListProps {
  items: InventoryItem[];
  onStockMovement: (item: InventoryItem, type: 'in' | 'out' | 'adjust') => void;
  onRefresh: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  'drilling_equipment',
  'pipes_casings',
  'pumps',
  'electrical',
  'consumables',
  'safety_equipment',
  'tools',
  'spare_parts',
];

const InventoryList: React.FC<InventoryListProps> = ({
  items,
  onStockMovement,
  onRefresh,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: InventoryItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleAction = (action: 'in' | 'out' | 'adjust') => {
    if (selectedItem) {
      onStockMovement(selectedItem, action);
    }
    handleMenuClose();
  };

  const getStockLevelColor = (item: InventoryItem) => {
    const percentage = (item.quantityInStock / item.minimumStock) * 100;
    if (percentage <= 50) return 'error';
    if (percentage <= 100) return 'warning';
    return 'success';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Box>
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            label="Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="center">In Stock</TableCell>
              <TableCell align="center">Reserved</TableCell>
              <TableCell align="center">Available</TableCell>
              <TableCell align="center">Min Stock</TableCell>
              <TableCell align="right">Unit Cost</TableCell>
              <TableCell align="right">Total Value</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.sku}</TableCell>
                <TableCell>
                  <Box>
                    <Box fontWeight="medium">{item.name}</Box>
                    {item.description && (
                      <Box fontSize="small" color="text.secondary">
                        {item.description}
                      </Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.category.replace(/_/g, ' ')}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  {item.quantityInStock} {item.unit}
                </TableCell>
                <TableCell align="center">
                  {item.reservedQuantity} {item.unit}
                </TableCell>
                <TableCell align="center">
                  <Box fontWeight="medium" color="primary.main">
                    {item.availableQuantity} {item.unit}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  {item.minimumStock} {item.unit}
                </TableCell>
                <TableCell align="right">{formatCurrency(item.unitCost)}</TableCell>
                <TableCell align="right">
                  <Box fontWeight="medium">{formatCurrency(item.totalValue)}</Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      item.quantityInStock <= item.minimumStock
                        ? 'Low Stock'
                        : item.quantityInStock <= item.reorderPoint
                        ? 'Reorder'
                        : 'In Stock'
                    }
                    color={getStockLevelColor(item)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, item)}
                  >
                    <MoreIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('in')}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Stock In</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('out')}>
          <ListItemIcon>
            <RemoveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Stock Out</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('adjust')}>
          <ListItemIcon>
            <AdjustIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Adjust Stock</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default InventoryList;