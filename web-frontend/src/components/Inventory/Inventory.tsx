import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  ShoppingCart as PurchaseIcon,
} from '@mui/icons-material';
import inventoryService, { InventoryItem } from '../../services/inventoryService';
import InventoryList from './InventoryList';
import InventoryMovements from './InventoryMovements';
import LowStockAlert from './LowStockAlert';
import InventoryReports from './InventoryReports';
import PurchaseOrdersList from './PurchaseOrdersList';
import AddItemDialog from './AddItemDialog';
import StockMovementDialog from './StockMovementDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [inventoryValue, setInventoryValue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [stockMovementOpen, setStockMovementOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<'in' | 'out' | 'adjust'>('in');

  useEffect(() => {
    loadInventoryData();
  }, [searchTerm, selectedCategory]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [itemsData, lowStockData, valueData] = await Promise.all([
        inventoryService.getItems({
          search: searchTerm,
          category: selectedCategory,
        }),
        inventoryService.getLowStockItems(),
        inventoryService.getInventoryValue(),
      ]);

      setItems(itemsData);
      setLowStockItems(lowStockData);
      setInventoryValue(valueData);
    } catch (err: any) {
      console.error('Error loading inventory:', err);
      setError(err.response?.data?.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleStockMovement = (item: InventoryItem, type: 'in' | 'out' | 'adjust') => {
    setSelectedItem(item);
    setMovementType(type);
    setStockMovementOpen(true);
  };

  const handleMovementComplete = () => {
    setStockMovementOpen(false);
    setSelectedItem(null);
    loadInventoryData();
  };

  const handleItemAdded = () => {
    setAddItemOpen(false);
    loadInventoryData();
  };

  if (loading && items.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Inventory Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadInventoryData}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          {activeTab === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddItemOpen(true)}
            >
              Add Item
            </Button>
          )}
          {activeTab === 2 && (
            <Button
              variant="contained"
              startIcon={<PurchaseIcon />}
              onClick={() => {
                // TODO: Open Create Purchase Order dialog
                alert('Create Purchase Order - Coming soon!');
              }}
            >
              Create Purchase Order
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Items
                  </Typography>
                  <Typography variant="h4">
                    {inventoryValue?.totalItems || 0}
                  </Typography>
                </Box>
                <InventoryIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Value
                  </Typography>
                  <Typography variant="h4">
                    ${inventoryValue?.totalValue?.toLocaleString() || 0}
                  </Typography>
                </Box>
                <MoneyIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Low Stock Items
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {lowStockItems.length}
                  </Typography>
                </Box>
                <WarningIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Categories
                  </Typography>
                  <Typography variant="h4">
                    {Object.keys(inventoryValue?.byCategory || {}).length}
                  </Typography>
                </Box>
                <TrendingDownIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <LowStockAlert items={lowStockItems} onRefresh={loadInventoryData} />
      )}

      {/* Main Content */}
      <Paper>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="inventory tabs">
          <Tab label="Inventory Items" />
          <Tab label="Stock Movements" />
          <Tab label="Purchase Orders" />
          <Tab label="Reports" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <InventoryList
            items={items}
            onStockMovement={handleStockMovement}
            onRefresh={loadInventoryData}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <InventoryMovements />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <PurchaseOrdersList />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <InventoryReports inventoryValue={inventoryValue} />
        </TabPanel>
      </Paper>

      {/* Dialogs */}
      <AddItemDialog
        open={addItemOpen}
        onClose={() => setAddItemOpen(false)}
        onItemAdded={handleItemAdded}
      />

      {selectedItem && (
        <StockMovementDialog
          open={stockMovementOpen}
          onClose={() => setStockMovementOpen(false)}
          item={selectedItem}
          type={movementType}
          onComplete={handleMovementComplete}
        />
      )}
    </Box>
  );
};

export default Inventory;