import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import inventoryService, { InventoryItem } from '../../services/inventoryService';
import jobsService, { Job } from '../../services/jobsService';

interface StockMovementDialogProps {
  open: boolean;
  onClose: () => void;
  item: InventoryItem;
  type: 'in' | 'out' | 'adjust';
  onComplete: () => void;
}

const StockMovementDialog: React.FC<StockMovementDialogProps> = ({
  open,
  onClose,
  item,
  type,
  onComplete,
}) => {
  const [quantity, setQuantity] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(item.unitCost);
  const [supplier, setSupplier] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [jobId, setJobId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type === 'out' && open) {
      loadJobs();
    }
  }, [type, open]);

  const loadJobs = async () => {
    try {
      const data = await jobsService.getJobs();
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (type === 'in') {
        await inventoryService.stockIn({
          itemId: item.id,
          quantity,
          unitCost,
          supplier,
          reference,
          notes,
        });
      } else if (type === 'out') {
        if (!jobId) {
          setError('Please select a job');
          return;
        }
        await inventoryService.stockOut({
          itemId: item.id,
          quantity,
          jobId,
          reason,
          notes,
        });
      } else if (type === 'adjust') {
        if (!reason) {
          setError('Please provide a reason for adjustment');
          return;
        }
        await inventoryService.adjustStock({
          itemId: item.id,
          newQuantity: quantity,
          reason,
          notes,
        });
      }

      onComplete();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process stock movement');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuantity(0);
    setUnitCost(item.unitCost);
    setSupplier('');
    setReference('');
    setJobId('');
    setReason('');
    setNotes('');
    setError(null);
    onClose();
  };

  const getTitle = () => {
    switch (type) {
      case 'in':
        return 'Stock In';
      case 'out':
        return 'Stock Out';
      case 'adjust':
        return 'Adjust Stock';
      default:
        return 'Stock Movement';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{getTitle()}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Item: <strong>{item.name}</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary">
            SKU: {item.sku} | Current Stock: {item.quantityInStock} {item.unit}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Available: {item.availableQuantity} {item.unit} | Reserved: {item.reservedQuantity} {item.unit}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {type === 'adjust' ? (
            <Grid size={12}>
              <TextField
                fullWidth
                label="New Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                helperText={`Current quantity: ${item.quantityInStock} ${item.unit}`}
                required
              />
            </Grid>
          ) : (
            <Grid size={12}>
              <TextField
                fullWidth
                label={type === 'in' ? 'Quantity to Add' : 'Quantity to Remove'}
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </Grid>
          )}

          {type === 'in' && (
            <>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Unit Cost ($)"
                  type="number"
                  value={unitCost}
                  onChange={(e) => setUnitCost(Number(e.target.value))}
                  required
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Supplier"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Reference (PO Number, Invoice, etc.)"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </Grid>
            </>
          )}

          {type === 'out' && (
            <>
              <Grid size={12}>
                <FormControl fullWidth required>
                  <InputLabel>Job</InputLabel>
                  <Select
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    label="Job"
                  >
                    {jobs.map((job) => (
                      <MenuItem key={job.id} value={job.id}>
                        {job.jobNumber} - {job.clientName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </Grid>
            </>
          )}

          {type === 'adjust' && (
            <Grid size={12}>
              <TextField
                fullWidth
                label="Reason for Adjustment"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </Grid>
          )}

          <Grid size={12}>
            <TextField
              fullWidth
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockMovementDialog;