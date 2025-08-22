import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider,
  FormControlLabel,
  Checkbox,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import {
  Save,
  Send,
  ArrowBack,
  ArrowForward,
  Add,
  Delete,
  CloudUpload,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api';

interface GeologicalFormation {
  depth: number;
  description: string;
  soilType: string;
}

interface DrillingReportData {
  jobId: string;
  drillingStartDate: Date | null;
  drillingEndDate: Date | null;
  drillingMethod: string;
  totalDepth: number;
  waterStruckDepth: number;
  staticWaterLevel: number;
  yieldRate: number;
  waterQuality: string;
  casingDepth: number;
  casingDiameter: string;
  casingMaterial: string;
  geologicalFormations: GeologicalFormation[];
  rigType: string;
  compressorCapacity: string;
  mudPumpCapacity: string;
  pumpingTestDuration: number;
  pumpingTestYield: number;
  recoveryTime: number;
  drawdown: number;
  ph: number;
  tds: number;
  turbidity: number;
  temperature: number;
  bacteriologicalStatus: string;
  challengesEncountered: string;
  recommendations: string;
  isDryHole: boolean;
  dryHoleReason: string;
  pumpInstalled: boolean;
  pumpType: string;
  pumpBrand: string;
  pumpCapacity: string;
  actualLatitude: number;
  actualLongitude: number;
  additionalNotes: string;
  clientRepresentativeName: string;
  clientSignature: string;
}

const steps = [
  'Drilling Details',
  'Casing & Geology',
  'Equipment & Testing',
  'Water Analysis',
  'Pump Installation',
  'Sign-off',
];

const DrillingReportForm: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingReport, setExistingReport] = useState<any>(null);

  const [formData, setFormData] = useState<DrillingReportData>({
    jobId: jobId || '',
    drillingStartDate: null,
    drillingEndDate: null,
    drillingMethod: 'rotary',
    totalDepth: 0,
    waterStruckDepth: 0,
    staticWaterLevel: 0,
    yieldRate: 0,
    waterQuality: 'good',
    casingDepth: 0,
    casingDiameter: '',
    casingMaterial: 'PVC',
    geologicalFormations: [{ depth: 0, description: '', soilType: '' }],
    rigType: '',
    compressorCapacity: '',
    mudPumpCapacity: '',
    pumpingTestDuration: 0,
    pumpingTestYield: 0,
    recoveryTime: 0,
    drawdown: 0,
    ph: 7,
    tds: 0,
    turbidity: 0,
    temperature: 0,
    bacteriologicalStatus: 'Safe',
    challengesEncountered: '',
    recommendations: '',
    isDryHole: false,
    dryHoleReason: '',
    pumpInstalled: false,
    pumpType: '',
    pumpBrand: '',
    pumpCapacity: '',
    actualLatitude: 0,
    actualLongitude: 0,
    additionalNotes: '',
    clientRepresentativeName: '',
    clientSignature: '',
  });

  useEffect(() => {
    if (jobId) {
      fetchExistingReport();
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchExistingReport = async () => {
    try {
      setLoading(true);
      const report: any = await api.get(API_ENDPOINTS.DRILLING_REPORT_BY_JOB(jobId!));
      if (report) {
        setExistingReport(report);
        // Populate form with existing data
        setFormData(prev => ({
          ...prev,
          ...report,
          drillingStartDate: report.drillingStartDate ? new Date(report.drillingStartDate) : null,
          drillingEndDate: report.drillingEndDate ? new Date(report.drillingEndDate) : null,
        }));
      }
    } catch (error) {
      // No existing report, that's okay
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDetails = async () => {
    try {
      const job: any = await api.get(`${API_ENDPOINTS.JOBS}/${jobId}`);
      // Pre-fill GPS coordinates from job
      setFormData(prev => ({
        ...prev,
        actualLatitude: job.latitude,
        actualLongitude: job.longitude,
      }));
    } catch (error) {
      console.error('Failed to fetch job details:', error);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field: keyof DrillingReportData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFormationChange = (index: number, field: keyof GeologicalFormation, value: any) => {
    const newFormations = [...formData.geologicalFormations];
    newFormations[index] = {
      ...newFormations[index],
      [field]: value,
    };
    setFormData(prev => ({
      ...prev,
      geologicalFormations: newFormations,
    }));
  };

  const addFormation = () => {
    setFormData(prev => ({
      ...prev,
      geologicalFormations: [
        ...prev.geologicalFormations,
        { depth: 0, description: '', soilType: '' },
      ],
    }));
  };

  const removeFormation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      geologicalFormations: prev.geologicalFormations.filter((_, i) => i !== index),
    }));
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setError(null);

      const dataToSave = {
        ...formData,
        drillingStartDate: formData.drillingStartDate?.toISOString(),
        drillingEndDate: formData.drillingEndDate?.toISOString(),
      };

      if (existingReport) {
        await api.put(API_ENDPOINTS.DRILLING_REPORT_BY_ID(existingReport.id), dataToSave);
        setSuccess('Report updated successfully');
      } else {
        const report = await api.post(API_ENDPOINTS.DRILLING_REPORTS, dataToSave);
        setExistingReport(report);
        setSuccess('Report saved as draft');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);

      // Save first if needed
      if (!existingReport) {
        await handleSaveDraft();
      }

      // Then submit
      await api.post(`${API_ENDPOINTS.DRILLING_REPORTS}/${existingReport?.id || ''}/submit`, {});
      setSuccess('Report submitted for approval');
      
      setTimeout(() => {
        navigate(`/jobs/${jobId}`);
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Drilling Details
        return (
          <Grid container spacing={3}>
            <Grid size={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Drilling Start Date"
                  value={formData.drillingStartDate}
                  onChange={(date) => handleInputChange('drillingStartDate', date)}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid size={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Drilling End Date"
                  value={formData.drillingEndDate}
                  onChange={(date) => handleInputChange('drillingEndDate', date)}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel>Drilling Method</InputLabel>
                <Select
                  value={formData.drillingMethod}
                  onChange={(e) => handleInputChange('drillingMethod', e.target.value)}
                  label="Drilling Method"
                >
                  <MenuItem value="rotary">Rotary</MenuItem>
                  <MenuItem value="percussion">Percussion</MenuItem>
                  <MenuItem value="auger">Auger</MenuItem>
                  <MenuItem value="cable_tool">Cable Tool</MenuItem>
                  <MenuItem value="mud_rotary">Mud Rotary</MenuItem>
                  <MenuItem value="air_rotary">Air Rotary</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Total Depth (meters)"
                type="number"
                value={formData.totalDepth}
                onChange={(e) => handleInputChange('totalDepth', Number(e.target.value))}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Water Struck Depth (meters)"
                type="number"
                value={formData.waterStruckDepth}
                onChange={(e) => handleInputChange('waterStruckDepth', Number(e.target.value))}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Static Water Level (meters)"
                type="number"
                value={formData.staticWaterLevel}
                onChange={(e) => handleInputChange('staticWaterLevel', Number(e.target.value))}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Yield Rate (liters/hour)"
                type="number"
                value={formData.yieldRate}
                onChange={(e) => handleInputChange('yieldRate', Number(e.target.value))}
              />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel>Water Quality</InputLabel>
                <Select
                  value={formData.waterQuality}
                  onChange={(e) => handleInputChange('waterQuality', e.target.value)}
                  label="Water Quality"
                >
                  <MenuItem value="excellent">Excellent</MenuItem>
                  <MenuItem value="good">Good</MenuItem>
                  <MenuItem value="fair">Fair</MenuItem>
                  <MenuItem value="poor">Poor</MenuItem>
                  <MenuItem value="unusable">Unusable</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isDryHole}
                    onChange={(e) => handleInputChange('isDryHole', e.target.checked)}
                  />
                }
                label="Dry Hole (No Water Found)"
              />
            </Grid>
            {formData.isDryHole && (
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Reason for Dry Hole"
                  multiline
                  rows={2}
                  value={formData.dryHoleReason}
                  onChange={(e) => handleInputChange('dryHoleReason', e.target.value)}
                />
              </Grid>
            )}
          </Grid>
        );

      case 1: // Casing & Geology
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h6" gutterBottom>
                Casing Information
              </Typography>
            </Grid>
            <Grid size={4}>
              <TextField
                fullWidth
                label="Casing Depth (meters)"
                type="number"
                value={formData.casingDepth}
                onChange={(e) => handleInputChange('casingDepth', Number(e.target.value))}
              />
            </Grid>
            <Grid size={4}>
              <TextField
                fullWidth
                label="Casing Diameter"
                value={formData.casingDiameter}
                onChange={(e) => handleInputChange('casingDiameter', e.target.value)}
                placeholder="e.g., 6 inch"
              />
            </Grid>
            <Grid size={4}>
              <FormControl fullWidth>
                <InputLabel>Casing Material</InputLabel>
                <Select
                  value={formData.casingMaterial}
                  onChange={(e) => handleInputChange('casingMaterial', e.target.value)}
                  label="Casing Material"
                >
                  <MenuItem value="PVC">PVC</MenuItem>
                  <MenuItem value="Steel">Steel</MenuItem>
                  <MenuItem value="HDPE">HDPE</MenuItem>
                  <MenuItem value="Concrete">Concrete</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Geological Formations
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={addFormation}
                  variant="outlined"
                  size="small"
                >
                  Add Layer
                </Button>
              </Box>
            </Grid>

            {formData.geologicalFormations.map((formation, index) => (
              <Grid size={12} key={index}>
                <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" gutterBottom>
                      Layer {index + 1}
                    </Typography>
                    {formData.geologicalFormations.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => removeFormation(index)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Box>
                  <Grid container spacing={2}>
                    <Grid size={4}>
                      <TextField
                        fullWidth
                        label="Depth (meters)"
                        type="number"
                        value={formation.depth}
                        onChange={(e) => handleFormationChange(index, 'depth', Number(e.target.value))}
                        size="small"
                      />
                    </Grid>
                    <Grid size={4}>
                      <TextField
                        fullWidth
                        label="Soil Type"
                        value={formation.soilType}
                        onChange={(e) => handleFormationChange(index, 'soilType', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid size={4}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={formation.description}
                        onChange={(e) => handleFormationChange(index, 'description', e.target.value)}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 2: // Equipment & Testing
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h6" gutterBottom>
                Equipment Used
              </Typography>
            </Grid>
            <Grid size={4}>
              <TextField
                fullWidth
                label="Rig Type"
                value={formData.rigType}
                onChange={(e) => handleInputChange('rigType', e.target.value)}
              />
            </Grid>
            <Grid size={4}>
              <TextField
                fullWidth
                label="Compressor Capacity"
                value={formData.compressorCapacity}
                onChange={(e) => handleInputChange('compressorCapacity', e.target.value)}
              />
            </Grid>
            <Grid size={4}>
              <TextField
                fullWidth
                label="Mud Pump Capacity"
                value={formData.mudPumpCapacity}
                onChange={(e) => handleInputChange('mudPumpCapacity', e.target.value)}
              />
            </Grid>

            <Grid size={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Pumping Test Results
              </Typography>
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Test Duration (hours)"
                type="number"
                value={formData.pumpingTestDuration}
                onChange={(e) => handleInputChange('pumpingTestDuration', Number(e.target.value))}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Test Yield (liters/hour)"
                type="number"
                value={formData.pumpingTestYield}
                onChange={(e) => handleInputChange('pumpingTestYield', Number(e.target.value))}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Recovery Time (minutes)"
                type="number"
                value={formData.recoveryTime}
                onChange={(e) => handleInputChange('recoveryTime', Number(e.target.value))}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Drawdown (meters)"
                type="number"
                value={formData.drawdown}
                onChange={(e) => handleInputChange('drawdown', Number(e.target.value))}
              />
            </Grid>
          </Grid>
        );

      case 3: // Water Analysis
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h6" gutterBottom>
                Water Quality Analysis
              </Typography>
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="pH Level"
                type="number"
                inputProps={{ step: 0.1, min: 0, max: 14 }}
                value={formData.ph}
                onChange={(e) => handleInputChange('ph', Number(e.target.value))}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="TDS (mg/L)"
                type="number"
                value={formData.tds}
                onChange={(e) => handleInputChange('tds', Number(e.target.value))}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Turbidity (NTU)"
                type="number"
                value={formData.turbidity}
                onChange={(e) => handleInputChange('turbidity', Number(e.target.value))}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Temperature (°C)"
                type="number"
                value={formData.temperature}
                onChange={(e) => handleInputChange('temperature', Number(e.target.value))}
              />
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>Bacteriological Status</InputLabel>
                <Select
                  value={formData.bacteriologicalStatus}
                  onChange={(e) => handleInputChange('bacteriologicalStatus', e.target.value)}
                  label="Bacteriological Status"
                >
                  <MenuItem value="Safe">Safe</MenuItem>
                  <MenuItem value="Contaminated">Contaminated</MenuItem>
                  <MenuItem value="Not Tested">Not Tested</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Challenges Encountered"
                multiline
                rows={3}
                value={formData.challengesEncountered}
                onChange={(e) => handleInputChange('challengesEncountered', e.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Recommendations"
                multiline
                rows={3}
                value={formData.recommendations}
                onChange={(e) => handleInputChange('recommendations', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 4: // Pump Installation
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.pumpInstalled}
                    onChange={(e) => handleInputChange('pumpInstalled', e.target.checked)}
                  />
                }
                label="Pump Installed"
              />
            </Grid>
            {formData.pumpInstalled && (
              <>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="Pump Type"
                    value={formData.pumpType}
                    onChange={(e) => handleInputChange('pumpType', e.target.value)}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="Pump Brand"
                    value={formData.pumpBrand}
                    onChange={(e) => handleInputChange('pumpBrand', e.target.value)}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="Pump Capacity"
                    value={formData.pumpCapacity}
                    onChange={(e) => handleInputChange('pumpCapacity', e.target.value)}
                  />
                </Grid>
              </>
            )}
            <Grid size={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                GPS Coordinates (Actual Location)
              </Typography>
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                inputProps={{ step: 0.000001 }}
                value={formData.actualLatitude}
                onChange={(e) => handleInputChange('actualLatitude', Number(e.target.value))}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                inputProps={{ step: 0.000001 }}
                value={formData.actualLongitude}
                onChange={(e) => handleInputChange('actualLongitude', Number(e.target.value))}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={4}
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 5: // Sign-off
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Client sign-off is required before submitting the report for approval.
              </Alert>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Client Representative Name"
                value={formData.clientRepresentativeName}
                onChange={(e) => handleInputChange('clientRepresentativeName', e.target.value)}
                required
              />
            </Grid>
            <Grid size={12}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Client Signature
                </Typography>
                <Box
                  sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 1,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Click to capture or upload signature
                  </Typography>
                  {formData.clientSignature && (
                    <Typography variant="caption" color="success.main" sx={{ mt: 1 }}>
                      Signature captured
                    </Typography>
                  )}
                </Box>
              </Card>
            </Grid>
            <Grid size={12}>
              <Alert severity="warning">
                By submitting this report, you confirm that all information provided is accurate 
                and has been verified by the client representative.
              </Alert>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {existingReport ? 'Edit Drilling Report' : 'New Drilling Report'}
        </Typography>
        <Button
          onClick={() => navigate(`/jobs/${jobId}`)}
          startIcon={<ArrowBack />}
        >
          Back to Job
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 400 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>

          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              onClick={handleSaveDraft}
              startIcon={<Save />}
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : 'Save Draft'}
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<Send />}
                disabled={saving || !formData.clientRepresentativeName}
              >
                Submit Report
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default DrillingReportForm;