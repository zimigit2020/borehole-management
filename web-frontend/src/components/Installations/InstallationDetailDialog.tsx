import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import { format } from 'date-fns';
import { Installation } from '../../services/installationService';

interface InstallationDetailDialogProps {
  open: boolean;
  installation: Installation;
  onClose: () => void;
  onUpdate: () => void;
}

const InstallationDetailDialog: React.FC<InstallationDetailDialogProps> = ({
  open,
  installation,
  onClose,
  onUpdate,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'scheduled':
        return 'default';
      case 'on_hold':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'PPp');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Installation Details - {installation.job?.jobNumber || 'N/A'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Status and Type */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <Chip
              label={installation.status.replace(/_/g, ' ').toUpperCase()}
              color={getStatusColor(installation.status) as any}
            />
            <Chip
              label={installation.type.replace(/_/g, ' ').toUpperCase()}
              variant="outlined"
            />
          </Box>

          {/* Job Information */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Job Information
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="textSecondary">Job Number</Typography>
              <Typography variant="body1">{installation.job?.jobNumber || 'N/A'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="textSecondary">Client</Typography>
              <Typography variant="body1">{installation.job?.clientName || 'N/A'}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="textSecondary">Site Address</Typography>
              <Typography variant="body1">{installation.job?.siteAddress || 'N/A'}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Schedule Information */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Schedule Information
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="textSecondary">Scheduled Date</Typography>
              <Typography variant="body1">{formatDate(installation.scheduledDate)}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="textSecondary">Technician</Typography>
              <Typography variant="body1">{installation.technician?.name || 'Unassigned'}</Typography>
            </Grid>
            {installation.startedAt && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="textSecondary">Started At</Typography>
                <Typography variant="body1">{formatDate(installation.startedAt)}</Typography>
              </Grid>
            )}
            {installation.completedAt && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="textSecondary">Completed At</Typography>
                <Typography variant="body1">{formatDate(installation.completedAt)}</Typography>
              </Grid>
            )}
          </Grid>

          {/* Equipment Details */}
          {installation.type === 'pump' && (installation.pumpBrand || installation.pumpModel) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Pump Details
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {installation.pumpType && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="textSecondary">Pump Type</Typography>
                    <Typography variant="body1">{installation.pumpType.replace(/_/g, ' ')}</Typography>
                  </Grid>
                )}
                {installation.pumpBrand && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="textSecondary">Brand</Typography>
                    <Typography variant="body1">{installation.pumpBrand}</Typography>
                  </Grid>
                )}
                {installation.pumpModel && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="textSecondary">Model</Typography>
                    <Typography variant="body1">{installation.pumpModel}</Typography>
                  </Grid>
                )}
                {installation.pumpCapacity && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="textSecondary">Capacity</Typography>
                    <Typography variant="body1">{installation.pumpCapacity} L/hr</Typography>
                  </Grid>
                )}
              </Grid>
            </>
          )}

          {/* Test Results */}
          {installation.testSuccessful !== undefined && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Test Results
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Chip
                  label={installation.testSuccessful ? 'Tests Passed' : 'Tests Failed'}
                  color={installation.testSuccessful ? 'success' : 'error'}
                  sx={{ mb: 2 }}
                />
                {installation.testNotes && (
                  <Typography variant="body2">{installation.testNotes}</Typography>
                )}
              </Box>
            </>
          )}

          {/* Notes */}
          {installation.notes && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Notes
              </Typography>
              <Typography variant="body2">{installation.notes}</Typography>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstallationDetailDialog;