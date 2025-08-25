import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Chip,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  Phone,
  Person,
  AttachMoney,
  Flag,
  CheckCircle,
  Schedule,
  Engineering,
  Assignment,
  Description,
  Assessment,
} from '@mui/icons-material';
import { format } from 'date-fns';
import jobsService, { Job } from '../../services/jobs.service';
import JobWorkflowActions from '../../components/JobWorkflow/JobWorkflowActions';
import JobCostingReport from '../../components/Jobs/JobCostingReport';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jobsService.getJobById(id!);
      setJob(data);
    } catch (error: any) {
      console.error('Failed to fetch job:', error);
      setError(error.response?.data?.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      created: 'warning',
      assigned: 'info',
      surveyed: 'primary',
      drilling: 'secondary',
      completed: 'success',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created':
        return <Schedule />;
      case 'assigned':
        return <Assignment />;
      case 'surveyed':
        return <LocationOn />;
      case 'drilling':
        return <Engineering />;
      case 'completed':
        return <CheckCircle />;
      default:
        return <Schedule />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate('/jobs')} startIcon={<ArrowBack />}>
          Back to Jobs
        </Button>
      </Box>
    );
  }

  if (!job) {
    return (
      <Box>
        <Alert severity="warning">Job not found</Alert>
        <Button onClick={() => navigate('/jobs')} startIcon={<ArrowBack />}>
          Back to Jobs
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {job.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mt={1}>
            <Chip
              icon={getStatusIcon(job.status)}
              label={job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              color={getStatusColor(job.status)}
              size="small"
            />
            {job.priority && (
              <Chip
                icon={<Flag />}
                label={`${job.priority} priority`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
        <Button onClick={() => navigate('/jobs')} startIcon={<ArrowBack />}>
          Back to Jobs
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Job Details" />
          <Tab label="Cost Analysis" icon={<Assessment />} iconPosition="end" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Grid container spacing={3}>
        {/* Job Information */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Job Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Client
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {job.clientName}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Site
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {job.siteName}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Location
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body1">
                      {job.latitude}, {job.longitude}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Budget
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <AttachMoney fontSize="small" color="action" />
                    <Typography variant="body1">
                      ${job.budgetUsd?.toLocaleString() || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                {job.contactPerson && (
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Contact Person
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body1">{job.contactPerson}</Typography>
                    </Box>
                  </Grid>
                )}
                {job.contactPhone && (
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Contact Phone
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body1">{job.contactPhone}</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {job.accessNotes && (
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Access Notes
                  </Typography>
                  <Typography variant="body1">{job.accessNotes}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Workflow Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Workflow Actions
              </Typography>
              <JobWorkflowActions job={job} onUpdate={fetchJob} />
              
              {/* Drilling Report Button */}
              {(job.status === 'drilling' || job.status === 'completed') && (
                <Box mt={2}>
                  <Divider sx={{ mb: 2 }} />
                  <Button
                    variant="outlined"
                    startIcon={<Description />}
                    onClick={() => navigate(`/drilling/report/${job.id}`)}
                    fullWidth
                  >
                    {job.status === 'drilling' ? 'Create Drilling Report' : 'View/Edit Drilling Report'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Drilling Results (if completed) */}
          {job.drillingResults && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Drilling Results
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Final Depth
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {job.drillingResults.finalDepth} meters
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Water Yield
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {job.drillingResults.waterYield} L/hr
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="body2" color="text.secondary">
                      Success Status
                    </Typography>
                    <Chip
                      label={job.drillingResults.isSuccessful ? 'Successful' : 'Dry Hole'}
                      color={job.drillingResults.isSuccessful ? 'success' : 'error'}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Timeline and Assignments */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Timeline
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Created"
                    secondary={job.createdAt ? format(new Date(job.createdAt), 'PPp') : 'N/A'}
                  />
                </ListItem>
                {job.assignedAt && (
                  <ListItem>
                    <ListItemText
                      primary="Assigned"
                      secondary={format(new Date(job.assignedAt), 'PPp')}
                    />
                  </ListItem>
                )}
                {job.surveyCompletedAt && (
                  <ListItem>
                    <ListItemText
                      primary="Survey Completed"
                      secondary={format(new Date(job.surveyCompletedAt), 'PPp')}
                    />
                  </ListItem>
                )}
                {job.drillingStartedAt && (
                  <ListItem>
                    <ListItemText
                      primary="Drilling Started"
                      secondary={format(new Date(job.drillingStartedAt), 'PPp')}
                    />
                  </ListItem>
                )}
                {job.drillingCompletedAt && (
                  <ListItem>
                    <ListItemText
                      primary="Drilling Completed"
                      secondary={format(new Date(job.drillingCompletedAt), 'PPp')}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Assignments
              </Typography>
              <List dense>
                {job.assignedSurveyor ? (
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary="Surveyor"
                      secondary={`${job.assignedSurveyor.firstName} ${job.assignedSurveyor.lastName}`}
                    />
                  </ListItem>
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="Surveyor"
                      secondary="Not assigned"
                    />
                  </ListItem>
                )}
                {job.assignedDriller ? (
                  <ListItem>
                    <ListItemIcon>
                      <Engineering />
                    </ListItemIcon>
                    <ListItemText
                      primary="Driller"
                      secondary={`${job.assignedDriller.firstName} ${job.assignedDriller.lastName}`}
                    />
                  </ListItem>
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="Driller"
                      secondary="Not assigned"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      )}

      {activeTab === 1 && (
        <JobCostingReport jobId={id} />
      )}
    </Box>
  );
};

export default JobDetail;