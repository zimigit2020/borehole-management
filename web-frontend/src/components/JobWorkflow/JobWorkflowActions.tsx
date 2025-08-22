import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Engineering,
  Build,
  Undo,
} from '@mui/icons-material';
import { Job } from '../../services/jobs.service';
import api from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

interface JobWorkflowActionsProps {
  job: Job;
  onUpdate: () => void;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const JobWorkflowActions: React.FC<JobWorkflowActionsProps> = ({ job, onUpdate }) => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog states
  const [assignSurveyorOpen, setAssignSurveyorOpen] = useState(false);
  const [assignDrillerOpen, setAssignDrillerOpen] = useState(false);
  const [completeDrillingOpen, setCompleteDrillingOpen] = useState(false);
  const [revertStatusOpen, setRevertStatusOpen] = useState(false);
  
  // Form data
  const [selectedSurveyor, setSelectedSurveyor] = useState('');
  const [selectedDriller, setSelectedDriller] = useState('');
  const [surveyNotes, setSurveyNotes] = useState('');
  const [drillingResults, setDrillingResults] = useState({
    finalDepth: 0,
    waterYield: 0,
    isSuccessful: true,
    notes: '',
  });
  const [revertReason, setRevertReason] = useState('');
  
  // Users lists
  const [surveyors, setSurveyors] = useState<User[]>([]);
  const [drillers, setDrillers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const users = await api.get<User[]>(API_ENDPOINTS.USERS);
      setSurveyors(users.filter(u => u.role === 'surveyor' || u.role === 'admin'));
      setDrillers(users.filter(u => u.role === 'driller' || u.role === 'admin'));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleAssignSurveyor = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post(`${API_ENDPOINTS.JOBS}/${job.id}/assign-surveyor`, {
        surveyorId: selectedSurveyor,
      });
      setSuccess('Surveyor assigned successfully');
      setAssignSurveyorOpen(false);
      onUpdate();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to assign surveyor');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSurvey = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post(`${API_ENDPOINTS.JOBS}/${job.id}/complete-survey`, {
        notes: surveyNotes,
      });
      setSuccess('Survey completed successfully');
      onUpdate();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to complete survey');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriller = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post(`${API_ENDPOINTS.JOBS}/${job.id}/assign-driller`, {
        drillerId: selectedDriller,
      });
      setSuccess('Driller assigned and drilling started');
      setAssignDrillerOpen(false);
      onUpdate();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to assign driller');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDrilling = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post(`${API_ENDPOINTS.JOBS}/${job.id}/complete-drilling`, drillingResults);
      setSuccess('Drilling completed successfully');
      setCompleteDrillingOpen(false);
      onUpdate();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to complete drilling');
    } finally {
      setLoading(false);
    }
  };

  const handleRevertStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post(`${API_ENDPOINTS.JOBS}/${job.id}/revert-status`, {
        reason: revertReason,
      });
      setSuccess('Status reverted successfully');
      setRevertStatusOpen(false);
      onUpdate();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to revert status');
    } finally {
      setLoading(false);
    }
  };

  // Determine available actions based on job status and user role
  const getAvailableActions = () => {
    const actions = [];
    const isAdmin = currentUser?.role === 'admin';
    const isManager = currentUser?.role === 'project_manager';
    const isSurveyor = currentUser?.role === 'surveyor';
    const isDriller = currentUser?.role === 'driller';

    switch (job.status) {
      case 'created':
        if (isAdmin || isManager) {
          actions.push(
            <Button
              key="assign-surveyor"
              variant="contained"
              startIcon={<Assignment />}
              onClick={() => setAssignSurveyorOpen(true)}
              size="small"
            >
              Assign Surveyor
            </Button>
          );
        }
        break;

      case 'assigned':
        if (isAdmin || (isSurveyor && job.assignedSurveyorId === currentUser?.id)) {
          actions.push(
            <Button
              key="complete-survey"
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={handleCompleteSurvey}
              size="small"
            >
              Complete Survey
            </Button>
          );
        }
        break;

      case 'surveyed':
        if (isAdmin || isManager) {
          actions.push(
            <Button
              key="assign-driller"
              variant="contained"
              color="primary"
              startIcon={<Engineering />}
              onClick={() => setAssignDrillerOpen(true)}
              size="small"
            >
              Assign Driller
            </Button>
          );
        }
        break;

      case 'drilling':
        if (isAdmin || (isDriller && job.assignedDrillerId === currentUser?.id)) {
          actions.push(
            <Button
              key="complete-drilling"
              variant="contained"
              color="success"
              startIcon={<Build />}
              onClick={() => setCompleteDrillingOpen(true)}
              size="small"
            >
              Complete Drilling
            </Button>
          );
        }
        break;

      case 'completed':
        // No standard actions for completed jobs
        break;
    }

    // Add revert action for admin/manager (except for created status)
    if ((isAdmin || isManager) && job.status !== 'created') {
      actions.push(
        <Button
          key="revert"
          variant="outlined"
          color="warning"
          startIcon={<Undo />}
          onClick={() => setRevertStatusOpen(true)}
          size="small"
        >
          Revert Status
        </Button>
      );
    }

    return actions;
  };

  return (
    <>
      <Box display="flex" gap={1} flexWrap="wrap">
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2, width: '100%' }}>
            {success}
          </Alert>
        )}
        {getAvailableActions()}
      </Box>

      {/* Assign Surveyor Dialog */}
      <Dialog open={assignSurveyorOpen} onClose={() => setAssignSurveyorOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Surveyor</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Surveyor</InputLabel>
            <Select
              value={selectedSurveyor}
              onChange={(e) => setSelectedSurveyor(e.target.value)}
              label="Select Surveyor"
            >
              {surveyors.map((surveyor) => (
                <MenuItem key={surveyor.id} value={surveyor.id}>
                  {surveyor.firstName} {surveyor.lastName} ({surveyor.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignSurveyorOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignSurveyor} 
            variant="contained"
            disabled={!selectedSurveyor || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Driller Dialog */}
      <Dialog open={assignDrillerOpen} onClose={() => setAssignDrillerOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Driller & Start Drilling</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Driller</InputLabel>
            <Select
              value={selectedDriller}
              onChange={(e) => setSelectedDriller(e.target.value)}
              label="Select Driller"
            >
              {drillers.map((driller) => (
                <MenuItem key={driller.id} value={driller.id}>
                  {driller.firstName} {driller.lastName} ({driller.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDrillerOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignDriller} 
            variant="contained"
            disabled={!selectedDriller || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Assign & Start'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Drilling Dialog */}
      <Dialog open={completeDrillingOpen} onClose={() => setCompleteDrillingOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Drilling</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Final Depth (meters)"
              type="number"
              value={drillingResults.finalDepth}
              onChange={(e) => setDrillingResults({ ...drillingResults, finalDepth: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Water Yield (liters/hour)"
              type="number"
              value={drillingResults.waterYield}
              onChange={(e) => setDrillingResults({ ...drillingResults, waterYield: Number(e.target.value) })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Success Status</InputLabel>
              <Select
                value={drillingResults.isSuccessful ? 'success' : 'dry'}
                onChange={(e) => setDrillingResults({ ...drillingResults, isSuccessful: e.target.value === 'success' })}
                label="Success Status"
              >
                <MenuItem value="success">Successful - Water Found</MenuItem>
                <MenuItem value="dry">Dry Hole - No Water</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Notes"
              multiline
              rows={3}
              value={drillingResults.notes}
              onChange={(e) => setDrillingResults({ ...drillingResults, notes: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDrillingOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCompleteDrilling} 
            variant="contained"
            color="success"
            disabled={loading || drillingResults.finalDepth <= 0}
          >
            {loading ? <CircularProgress size={24} /> : 'Complete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Revert Status Dialog */}
      <Dialog open={revertStatusOpen} onClose={() => setRevertStatusOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Revert Job Status</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will move the job back to the previous status. Please provide a reason.
          </Alert>
          <TextField
            label="Reason for Reverting"
            multiline
            rows={3}
            value={revertReason}
            onChange={(e) => setRevertReason(e.target.value)}
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevertStatusOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRevertStatus} 
            variant="contained"
            color="warning"
            disabled={loading || !revertReason.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Revert'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default JobWorkflowActions;