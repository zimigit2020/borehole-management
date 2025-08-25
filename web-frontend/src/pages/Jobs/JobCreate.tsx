import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  MenuItem,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import jobsService from '../../services/jobs.service';

const JobCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    siteName: '',
    latitude: '',
    longitude: '',
    contactPerson: '',
    contactPhone: '',
    accessNotes: '',
    priority: 'medium',
    budgetUsd: '',
  });

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const jobData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        budgetUsd: formData.budgetUsd ? parseFloat(formData.budgetUsd) : undefined,
      };

      const newJob = await jobsService.createJob(jobData);
      navigate(`/jobs/${newJob.id}`);
    } catch (err: any) {
      console.error('Failed to create job:', err);
      setError(err.response?.data?.message || 'Failed to create job. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Create New Job
        </Typography>
        <Button onClick={() => navigate('/jobs')} startIcon={<ArrowBack />}>
          Back to Jobs
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Job Name"
                value={formData.name}
                onChange={handleChange('name')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Client Name"
                value={formData.clientName}
                onChange={handleChange('clientName')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Site Name"
                value={formData.siteName}
                onChange={handleChange('siteName')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                value={formData.latitude}
                onChange={handleChange('latitude')}
                disabled={loading}
                inputProps={{ step: 'any' }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                value={formData.longitude}
                onChange={handleChange('longitude')}
                disabled={loading}
                inputProps={{ step: 'any' }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contactPerson}
                onChange={handleChange('contactPerson')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.contactPhone}
                onChange={handleChange('contactPhone')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Priority"
                value={formData.priority}
                onChange={handleChange('priority')}
                disabled={loading}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Budget (USD)"
                type="number"
                value={formData.budgetUsd}
                onChange={handleChange('budgetUsd')}
                disabled={loading}
                inputProps={{ step: 'any' }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Access Notes"
                value={formData.accessNotes}
                onChange={handleChange('accessNotes')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  onClick={() => navigate('/jobs')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Job'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default JobCreate;