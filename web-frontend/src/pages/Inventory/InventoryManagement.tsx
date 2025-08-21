import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Alert,
  Tooltip,
  Stack,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Warning,
  LocalShipping,
  Inventory,
  TrendingDown,
  TrendingUp,
  ShoppingCart,
  Category,
  QrCodeScanner,
  Download,
  Upload,
  FilterList,
  MoreVert,
  AttachMoney,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitCost: number;
  sellingPrice: number;
  supplier: string;
  location: string;
  lastRestocked: string;
  expiryDate?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference: string;
  performedBy: string;
  date: string;
  balanceBefore: number;
  balanceAfter: number;
}

const InventoryManagement: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);

  // Mock data
  useEffect(() => {
    const mockItems: InventoryItem[] = [
      {
        id: '1',
        sku: 'DRL-BIT-001',
        name: 'Drilling Bit - 6 inch',
        category: 'Drilling Equipment',
        description: 'Heavy duty drilling bit for hard rock formations',
        unit: 'piece',
        quantity: 15,
        minStock: 5,
        maxStock: 50,
        reorderPoint: 10,
        unitCost: 450,
        sellingPrice: 650,
        supplier: 'Mining Supplies Co',
        location: 'Warehouse A - Rack 3',
        lastRestocked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'in_stock',
      },
      {
        id: '2',
        sku: 'PVC-PIPE-002',
        name: 'PVC Casing Pipe - 4 inch',
        category: 'Pipes & Casings',
        description: 'Standard PVC casing pipe, 6m length',
        unit: 'piece',
        quantity: 3,
        minStock: 10,
        maxStock: 100,
        reorderPoint: 20,
        unitCost: 85,
        sellingPrice: 120,
        supplier: 'Pipes Direct Ltd',
        location: 'Warehouse B - Section 2',
        lastRestocked: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'low_stock',
      },
      {
        id: '3',
        sku: 'PUMP-SUB-003',
        name: 'Submersible Pump - 1.5HP',
        category: 'Pumps',
        description: 'Submersible water pump for boreholes',
        unit: 'piece',
        quantity: 8,
        minStock: 3,
        maxStock: 20,
        reorderPoint: 5,
        unitCost: 1200,
        sellingPrice: 1650,
        supplier: 'Pump Masters',
        location: 'Warehouse A - Rack 1',
        lastRestocked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'in_stock',
      },
      {
        id: '4',
        sku: 'CHEM-BEN-004',
        name: 'Bentonite Clay',
        category: 'Drilling Chemicals',
        description: 'Drilling mud additive, 25kg bag',
        unit: 'bag',
        quantity: 0,
        minStock: 20,
        maxStock: 200,
        reorderPoint: 40,
        unitCost: 25,
        sellingPrice: 35,
        supplier: 'Chemical Solutions',
        location: 'Warehouse C - Chemical Store',
        lastRestocked: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'out_of_stock',
      },
      {
        id: '5',
        sku: 'TOOL-WRN-005',
        name: 'Pipe Wrench - 24 inch',
        category: 'Tools',
        description: 'Heavy duty pipe wrench',
        unit: 'piece',
        quantity: 12,
        minStock: 5,
        maxStock: 25,
        reorderPoint: 8,
        unitCost: 65,
        sellingPrice: 95,
        supplier: 'Tools & Hardware Inc',
        location: 'Warehouse A - Tool Section',
        lastRestocked: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'in_stock',
      },
    ];

    const mockMovements: StockMovement[] = [
      {
        id: '1',
        itemId: '1',
        itemName: 'Drilling Bit - 6 inch',
        type: 'out',
        quantity: 2,
        reason: 'Job #JOB001 - Venice Borehole',
        reference: 'JOB001',
        performedBy: 'John Doe',
        date: new Date().toISOString(),
        balanceBefore: 17,
        balanceAfter: 15,
      },
      {
        id: '2',
        itemId: '2',
        itemName: 'PVC Casing Pipe - 4 inch',
        type: 'in',
        quantity: 50,
        reason: 'Purchase Order #PO2024001',
        reference: 'PO2024001',
        performedBy: 'Jane Smith',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        balanceBefore: 3,
        balanceAfter: 53,
      },
      {
        id: '3',
        itemId: '3',
        itemName: 'Submersible Pump - 1.5HP',
        type: 'out',
        quantity: 1,
        reason: 'Job #JOB002 - School Borehole',
        reference: 'JOB002',
        performedBy: 'Mike Johnson',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        balanceBefore: 9,
        balanceAfter: 8,
      },
    ];

    setItems(mockItems);
    setFilteredItems(mockItems);
    setMovements(mockMovements);
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, categoryFilter, statusFilter]);

  const filterItems = () => {
    let filtered = [...items];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredItems(filtered);
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setIsEditMode(false);
    setItemDialogOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditMode(true);
    setItemDialogOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    // Implement delete logic
    console.log('Delete item:', itemId);
  };

  const handleStockMovement = (item: InventoryItem) => {
    setSelectedItem(item);
    setMovementDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'success';
      case 'low_stock':
        return 'warning';
      case 'out_of_stock':
        return 'error';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <TrendingUp />;
      case 'low_stock':
        return <Warning />;
      case 'out_of_stock':
        return <TrendingDown />;
      default:
        return <Inventory />;
    }
  };

  const stats = {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0),
    lowStock: items.filter(i => i.status === 'low_stock').length,
    outOfStock: items.filter(i => i.status === 'out_of_stock').length,
  };

  const categories = Array.from(new Set(items.map(i => i.category)));

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Inventory Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage drilling equipment, supplies, and track stock movements
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {stats.totalItems}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Items
                  </Typography>
                </Box>
                <Category sx={{ fontSize: 40, color: 'primary.light', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
                    ${stats.totalValue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Total Inventory Value
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: 'rgba(255,255,255,0.5)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
                    {stats.lowStock}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Low Stock Items
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: 'rgba(255,255,255,0.5)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f5365c 0%, #f56565 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
                    {stats.outOfStock}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Out of Stock
                  </Typography>
                </Box>
                <TrendingDown sx={{ fontSize: 40, color: 'rgba(255,255,255,0.5)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Inventory Items" icon={<Inventory />} iconPosition="start" />
          <Tab label="Stock Movements" icon={<LocalShipping />} iconPosition="start" />
          <Tab 
            label="Low Stock Alerts" 
            icon={
              <Badge badgeContent={stats.lowStock + stats.outOfStock} color="error">
                <Warning />
              </Badge>
            } 
            iconPosition="start" 
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          {/* Search and Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              placeholder="Search items..."
              variant="outlined"
              size="small"
              sx={{ flex: 1 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="in_stock">In Stock</MenuItem>
                <MenuItem value="low_stock">Low Stock</MenuItem>
                <MenuItem value="out_of_stock">Out of Stock</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddItem}
            >
              Add Item
            </Button>
            <Button
              variant="outlined"
              startIcon={<QrCodeScanner />}
            >
              Scan
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
            >
              Export
            </Button>
          </Box>

          {/* Items Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>SKU</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="center">Unit</TableCell>
                  <TableCell align="right">Unit Cost</TableCell>
                  <TableCell align="right">Total Value</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {item.sku}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.location}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: item.quantity <= item.minStock ? 700 : 400 }}>
                            {item.quantity}
                          </Typography>
                          {item.quantity <= item.minStock && (
                            <Warning fontSize="small" color="warning" />
                          )}
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(item.quantity / item.maxStock) * 100}
                          sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                          color={item.quantity <= item.minStock ? 'warning' : 'primary'}
                        />
                      </TableCell>
                      <TableCell align="center">{item.unit}</TableCell>
                      <TableCell align="right">${item.unitCost}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ${(item.quantity * item.unitCost).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={item.status.replace('_', ' ')}
                          color={getStatusColor(item.status) as any}
                          size="small"
                          icon={getStatusIcon(item.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Stock Movement">
                            <IconButton size="small" onClick={() => handleStockMovement(item)}>
                              <LocalShipping fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEditItem(item)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDeleteItem(item.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredItems.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>Recent Stock Movements</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell align="center">Type</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Performed By</TableCell>
                  <TableCell align="center">Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id} hover>
                    <TableCell>
                      {new Date(movement.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{movement.itemName}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={movement.type}
                        color={movement.type === 'in' ? 'success' : movement.type === 'out' ? 'error' : 'default'}
                        size="small"
                        icon={movement.type === 'in' ? <ArrowDownward /> : <ArrowUpward />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: movement.type === 'in' ? 'success.main' : 'error.main'
                        }}
                      >
                        {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>{movement.reason}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {movement.reference}
                      </Typography>
                    </TableCell>
                    <TableCell>{movement.performedBy}</TableCell>
                    <TableCell align="center">
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {movement.balanceBefore} → 
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {movement.balanceAfter}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Attention Required: {stats.lowStock + stats.outOfStock} items need restocking
            </Typography>
          </Alert>
          <Grid container spacing={2}>
            {filteredItems
              .filter(item => item.status === 'low_stock' || item.status === 'out_of_stock')
              .map((item) => (
                <Grid size={6} key={item.id}>
                  <Card sx={{ 
                    border: 1, 
                    borderColor: item.status === 'out_of_stock' ? 'error.main' : 'warning.main',
                    borderStyle: 'solid'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            SKU: {item.sku}
                          </Typography>
                        </Box>
                        <Chip
                          label={item.status.replace('_', ' ')}
                          color={getStatusColor(item.status) as any}
                          size="small"
                        />
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={6}>
                          <Typography variant="caption" color="text.secondary">Current Stock</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: item.status === 'out_of_stock' ? 'error.main' : 'warning.main' }}>
                            {item.quantity}
                          </Typography>
                        </Grid>
                        <Grid size={6}>
                          <Typography variant="caption" color="text.secondary">Reorder Point</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {item.reorderPoint}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary">
                          Supplier: {item.supplier}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Button size="small" variant="contained" fullWidth>
                            Create Purchase Order
                          </Button>
                          <Button size="small" variant="outlined" fullWidth>
                            View Details
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default InventoryManagement;