import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
} from '@mui/material';
import inventoryService, { CreateInventoryItemDto } from '../../services/inventoryService';

interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
  onItemAdded: () => void;
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

const units = ['piece', 'meter', 'kg', 'liter', 'box', 'pack', 'set'];

const AddItemDialog: React.FC<AddItemDialogProps> = ({ open, onClose, onItemAdded }) => {
  const [formData, setFormData] = useState<CreateInventoryItemDto>({
    sku: '',
    name: '',
    description: '',
    category: 'consumables',
    unit: 'piece',
    quantityInStock: 0,
    minimumStock: 0,
    reorderPoint: 0,
    reorderQuantity: 0,
    unitCost: 0,
    supplier: '',
    location: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof CreateInventoryItemDto) => (
    event: any
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      await inventoryService.createItem(formData);
      onItemAdded();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      category: 'consumables',
      unit: 'piece',
      quantityInStock: 0,
      minimumStock: 0,
      reorderPoint: 0,
      reorderQuantity: 0,
      unitCost: 0,
      supplier: '',
      location: '',
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Inventory Item</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="SKU"
              value={formData.sku}
              onChange={handleChange('sku')}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={handleChange('name')}
              required
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={2}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={handleChange('category')}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Unit</InputLabel>
              <Select
                value={formData.unit}
                onChange={handleChange('unit')}
                label="Unit"
              >
                {units.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit.charAt(0).toUpperCase() + unit.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Initial Stock"
              type="number"
              value={formData.quantityInStock}
              onChange={handleChange('quantityInStock')}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Minimum Stock"
              type="number"
              value={formData.minimumStock}
              onChange={handleChange('minimumStock')}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Reorder Point"
              type="number"
              value={formData.reorderPoint}
              onChange={handleChange('reorderPoint')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Reorder Quantity"
              type="number"
              value={formData.reorderQuantity}
              onChange={handleChange('reorderQuantity')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Unit Cost ($)"
              type="number"
              value={formData.unitCost}
              onChange={handleChange('unitCost')}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Supplier"
              value={formData.supplier}
              onChange={handleChange('supplier')}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={handleChange('location')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Add Item
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddItemDialog;