import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import installationService, { CreateInstallationDto } from '../../services/installationService';
import jobsService, { Job } from '../../services/jobsService';

interface CreateInstallationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const installationTypes = [
  { value: 'pump', label: 'Pump Installation' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'tank', label: 'Water Tank' },
  { value: 'complete_system', label: 'Complete System' },
];

const pumpTypes = [
  { value: 'submersible', label: 'Submersible' },
  { value: 'surface', label: 'Surface' },
  { value: 'jet', label: 'Jet Pump' },
  { value: 'hand_pump', label: 'Hand Pump' },
  { value: 'solar', label: 'Solar Pump' },
];

const CreateInstallationDialog: React.FC<CreateInstallationDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateInstallationDto>({
    jobId: '',
    type: 'pump',
    scheduledDate: new Date().toISOString(),
    pumpType: 'submersible',
    pumpBrand: '',
    pumpModel: '',
    notes: '',
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadJobs();
    }
  }, [open]);

  const loadJobs = async () => {
    try {
      const data = await jobsService.getJobs();
      setJobs(data.filter(job => job.status !== 'completed'));
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleChange = (field: keyof CreateInstallationDto) => (event: any) => {
    setFormData({
      ...formData,
      [field]: event.target?.value !== undefined ? event.target.value : event,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      await installationService.createInstallation(formData);
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create installation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      jobId: '',
      type: 'pump',
      scheduledDate: new Date().toISOString(),
      pumpType: 'submersible',
      pumpBrand: '',
      pumpModel: '',
      notes: '',
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Schedule New Installation</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={12}>
            <FormControl fullWidth required>
              <InputLabel>Job</InputLabel>
              <Select
                value={formData.jobId}
                onChange={handleChange('jobId')}
                label="Job"
              >
                {jobs.map((job) => (
                  <MenuItem key={job.id} value={job.id}>
                    {job.jobNumber} - {job.clientName} ({job.siteAddress})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>Installation Type</InputLabel>
              <Select
                value={formData.type}
                onChange={handleChange('type')}
                label="Installation Type"
              >
                {installationTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Scheduled Date"
                value={formData.scheduledDate ? new Date(formData.scheduledDate) : null}
                onChange={(date) => handleChange('scheduledDate')(date?.toISOString())}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>

          {formData.type === 'pump' && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Pump Type</InputLabel>
                  <Select
                    value={formData.pumpType}
                    onChange={handleChange('pumpType')}
                    label="Pump Type"
                  >
                    {pumpTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Pump Brand"
                  value={formData.pumpBrand}
                  onChange={handleChange('pumpBrand')}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Pump Model"
                  value={formData.pumpModel}
                  onChange={handleChange('pumpModel')}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Pump Capacity (L/hr)"
                  type="number"
                  value={formData.pumpCapacity || ''}
                  onChange={handleChange('pumpCapacity')}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Pump Power (HP)"
                  type="number"
                  value={formData.pumpPower || ''}
                  onChange={handleChange('pumpPower')}
                />
              </Grid>
            </>
          )}

          {formData.type === 'tank' && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Tank Capacity (Liters)"
                  type="number"
                  value={formData.tankCapacity || ''}
                  onChange={handleChange('tankCapacity')}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Tank Material"
                  value={formData.tankMaterial || ''}
                  onChange={handleChange('tankMaterial')}
                />
              </Grid>
            </>
          )}

          <Grid size={12}>
            <TextField
              fullWidth
              label="Notes"
              value={formData.notes}
              onChange={handleChange('notes')}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !formData.jobId}>
          Schedule Installation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateInstallationDialog;