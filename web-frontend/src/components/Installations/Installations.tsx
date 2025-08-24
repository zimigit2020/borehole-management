import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Grid,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import installationService, { Installation } from '../../services/installationService';
import InstallationList from './InstallationList';
import InstallationCalendar from './InstallationCalendar';
import InstallationStats from './InstallationStats';
import CreateInstallationDialog from './CreateInstallationDialog';
import InstallationDetailDialog from './InstallationDetailDialog';

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
      id={`installation-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Installations: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [upcomingInstallations, setUpcomingInstallations] = useState<Installation[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [installationsData, upcomingData, statsData] = await Promise.all([
        installationService.getInstallations(),
        installationService.getUpcomingInstallations(7),
        installationService.getInstallationStats(),
      ]);

      setInstallations(installationsData);
      setUpcomingInstallations(upcomingData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error loading installations:', err);
      setError(err.response?.data?.message || 'Failed to load installations');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (installation: Installation) => {
    setSelectedInstallation(installation);
    setDetailDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    loadData();
  };

  const handleUpdateSuccess = () => {
    setDetailDialogOpen(false);
    setSelectedInstallation(null);
    loadData();
  };

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

  if (loading && installations.length === 0) {
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
          Installation Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Schedule Installation
          </Button>
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
                    Total Installations
                  </Typography>
                  <Typography variant="h4">
                    {stats?.total || 0}
                  </Typography>
                </Box>
                <BuildIcon color="primary" sx={{ fontSize: 40 }} />
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
                    Scheduled
                  </Typography>
                  <Typography variant="h4">
                    {stats?.byStatus?.scheduled || 0}
                  </Typography>
                </Box>
                <ScheduleIcon color="info" sx={{ fontSize: 40 }} />
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
                    Completed
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats?.byStatus?.completed || 0}
                  </Typography>
                </Box>
                <CheckIcon color="success" sx={{ fontSize: 40 }} />
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
                    Avg Completion Time
                  </Typography>
                  <Typography variant="h4">
                    {stats?.averageCompletionTime?.toFixed(1) || 0}h
                  </Typography>
                </Box>
                <TrendingUpIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upcoming Installations Alert */}
      {upcomingInstallations.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Upcoming Installations (Next 7 Days)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {upcomingInstallations.map((inst) => (
              <Chip
                key={inst.id}
                label={`${inst.job?.jobNumber || 'N/A'} - ${inst.type} (${
                  inst.scheduledDate ? new Date(inst.scheduledDate).toLocaleDateString() : 'TBD'
                })`}
                color={getStatusColor(inst.status) as any}
                size="small"
                onClick={() => handleViewDetails(inst)}
              />
            ))}
          </Box>
        </Alert>
      )}

      {/* Main Content */}
      <Paper>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="All Installations" />
          <Tab label="Calendar View" />
          <Tab label="Statistics" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <InstallationList
            installations={installations}
            onViewDetails={handleViewDetails}
            onRefresh={loadData}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <InstallationCalendar
            installations={installations}
            onViewDetails={handleViewDetails}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <InstallationStats stats={stats} installations={installations} />
        </TabPanel>
      </Paper>

      {/* Dialogs */}
      <CreateInstallationDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {selectedInstallation && (
        <InstallationDetailDialog
          open={detailDialogOpen}
          installation={selectedInstallation}
          onClose={() => {
            setDetailDialogOpen(false);
            setSelectedInstallation(null);
          }}
          onUpdate={handleUpdateSuccess}
        />
      )}
    </Box>
  );
};

export default Installations;