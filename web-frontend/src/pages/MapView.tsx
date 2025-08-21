import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  TextField,
  InputAdornment,
  Grid,
  Drawer,
  IconButton,
  Fab,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Search,
  FilterList,
  MyLocation,
  Layers,
  ChevronLeft,
  WaterDrop,
  LocationOn,
  CheckCircle,
  Schedule,
  Engineering,
  Warning,
  Satellite,
  Map as MapIcon,
  Terrain,
} from '@mui/icons-material';
import api from '../services/api.service';
import { API_ENDPOINTS } from '../config/api';

interface Job {
  id: string;
  name: string;
  clientName: string;
  siteName: string;
  latitude: number;
  longitude: number;
  status: string;
  priority: string;
  budgetUsd: number;
  depth?: number;
  createdAt: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: -19.0154,
  lng: 29.1549, // Zimbabwe center
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
};

// Custom marker icons for Google Maps
const getMarkerIcon = (status: string, isActive: boolean = false) => {
  const colors: Record<string, string> = {
    created: '#FFA726',
    assigned: '#42A5F5',
    surveyed: '#AB47BC',
    drilling: '#EF5350',
    completed: '#66BB6A',
  };
  
  const color = colors[status] || '#757575';
  const size = isActive ? 40 : 30;
  
  return {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: size / 24,
    anchor: new google.maps.Point(12, 24),
  };
};

const MapView: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, selectedStatus]);

  const fetchJobs = async () => {
    try {
      const data = await api.get<Job[]>(API_ENDPOINTS.JOBS);
      setJobs(data);
      setFilteredJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.siteName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(job => job.status === selectedStatus);
    }

    setFilteredJobs(filtered);
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setShowInfoWindow(true);
    if (map) {
      map.panTo({ lat: Number(job.latitude), lng: Number(job.longitude) });
      map.setZoom(15);
    }
  };

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleResetView = () => {
    if (map) {
      map.panTo(defaultCenter);
      map.setZoom(7);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      created: '#FFA726',
      assigned: '#42A5F5',
      surveyed: '#AB47BC',
      drilling: '#EF5350',
      completed: '#66BB6A',
    };
    return colors[status] || '#757575';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactElement> = {
      created: <Schedule />,
      assigned: <Engineering />,
      surveyed: <LocationOn />,
      drilling: <WaterDrop />,
      completed: <CheckCircle />,
    };
    return icons[status] || <Warning />;
  };

  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!googleMapsApiKey) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Google Maps API key is not configured. Please add your API key to the .env file:
          <br />
          REACT_APP_GOOGLE_MAPS_API_KEY=your-api-key-here
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', position: 'relative' }}>
      {/* Sidebar */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? 360 : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 360,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Borehole Locations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredJobs.length} of {jobs.length} boreholes shown
            </Typography>
          </Box>

          <TextField
            fullWidth
            size="small"
            placeholder="Search boreholes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Filter by Status
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={`All (${jobs.length})`}
                onClick={() => setSelectedStatus('all')}
                color={selectedStatus === 'all' ? 'primary' : 'default'}
                variant={selectedStatus === 'all' ? 'filled' : 'outlined'}
              />
              {Object.entries(statusCounts).map(([status, count]) => (
                <Chip
                  key={status}
                  label={`${status} (${count})`}
                  onClick={() => setSelectedStatus(status)}
                  sx={{
                    backgroundColor: selectedStatus === status ? getStatusColor(status) : 'transparent',
                    color: selectedStatus === status ? 'white' : getStatusColor(status),
                    borderColor: getStatusColor(status),
                  }}
                  variant={selectedStatus === status ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            <List sx={{ py: 0 }}>
              {filteredJobs.map((job) => (
                <ListItem
                  key={job.id}
                  onClick={() => handleJobClick(job)}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: selectedJob?.id === job.id ? 'action.selected' : 'grey.50',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {job.name}
                        </Typography>
                        <Chip
                          icon={getStatusIcon(job.status)}
                          label={job.status}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(job.status),
                            color: 'white',
                            height: 24,
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {job.clientName} • {job.siteName}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          <LocationOn sx={{ fontSize: 12, mr: 0.5 }} />
                          {Number(job.latitude).toFixed(4)}°, {Number(job.longitude).toFixed(4)}°
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Drawer>

      {/* Map Container */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <LoadScript googleMapsApiKey={googleMapsApiKey}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={7}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{ ...mapOptions, mapTypeId: mapType }}
          >
            <MarkerClusterer>
              {(clusterer) => (
                <>
                  {filteredJobs.map((job) => (
                    <Marker
                      key={job.id}
                      position={{ lat: Number(job.latitude), lng: Number(job.longitude) }}
                      icon={getMarkerIcon(job.status, selectedJob?.id === job.id)}
                      onClick={() => handleJobClick(job)}
                      clusterer={clusterer}
                    />
                  ))}
                </>
              )}
            </MarkerClusterer>

            {selectedJob && showInfoWindow && (
              <InfoWindow
                position={{ lat: Number(selectedJob.latitude), lng: Number(selectedJob.longitude) }}
                onCloseClick={() => setShowInfoWindow(false)}
              >
                <Card sx={{ boxShadow: 0, maxWidth: 300 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {selectedJob.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Client:</strong> {selectedJob.clientName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Site:</strong> {selectedJob.siteName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Coordinates:</strong> {Number(selectedJob.latitude).toFixed(6)}°, {Number(selectedJob.longitude).toFixed(6)}°
                    </Typography>
                    {selectedJob.depth && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Depth:</strong> {selectedJob.depth}m
                      </Typography>
                    )}
                    <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                      <Chip
                        label={selectedJob.status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(selectedJob.status),
                          color: 'white',
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        ${Number(selectedJob.budgetUsd).toLocaleString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>

        {/* Map Type Controls */}
        <Paper
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1000,
            p: 1,
          }}
        >
          <ButtonGroup orientation="vertical" size="small">
            <Tooltip title="Road Map" placement="left">
              <Button
                variant={mapType === 'roadmap' ? 'contained' : 'outlined'}
                onClick={() => setMapType('roadmap')}
              >
                <MapIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Satellite" placement="left">
              <Button
                variant={mapType === 'satellite' ? 'contained' : 'outlined'}
                onClick={() => setMapType('satellite')}
              >
                <Satellite />
              </Button>
            </Tooltip>
            <Tooltip title="Terrain" placement="left">
              <Button
                variant={mapType === 'terrain' ? 'contained' : 'outlined'}
                onClick={() => setMapType('terrain')}
              >
                <Terrain />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Paper>

        {/* Zoom Controls */}
        <Paper
          sx={{
            position: 'absolute',
            bottom: 32,
            right: 16,
            zIndex: 1000,
            p: 1,
          }}
        >
          <ButtonGroup orientation="vertical" size="small">
            <Button onClick={() => map?.setZoom((map.getZoom() || 7) + 1)}>+</Button>
            <Button onClick={() => map?.setZoom((map.getZoom() || 7) - 1)}>−</Button>
            <Tooltip title="Reset View" placement="left">
              <Button onClick={handleResetView}>
                <MyLocation />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Paper>

        {/* Toggle Sidebar */}
        <Fab
          color="primary"
          size="small"
          onClick={() => setDrawerOpen(!drawerOpen)}
          sx={{
            position: 'absolute',
            top: 16,
            left: drawerOpen ? 376 : 16,
            zIndex: 1000,
            transition: 'left 0.3s',
          }}
        >
          <ChevronLeft sx={{ transform: drawerOpen ? 'none' : 'rotate(180deg)' }} />
        </Fab>

        {/* Stats Overview */}
        <Grid
          container
          spacing={2}
          sx={{
            position: 'absolute',
            bottom: 16,
            left: drawerOpen ? 376 : 16,
            right: 'auto',
            zIndex: 1000,
            maxWidth: 400,
            transition: 'left 0.3s',
          }}
        >
          <Grid size={12}>
            <Card sx={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
              <CardContent sx={{ py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Quick Stats
                </Typography>
                <Box display="flex" justifyContent="space-between">
                  <Box textAlign="center">
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {jobs.length}
                    </Typography>
                    <Typography variant="caption">Total</Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#66BB6A' }}>
                      {statusCounts.completed || 0}
                    </Typography>
                    <Typography variant="caption">Completed</Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#FF6F00' }}>
                      {(statusCounts.assigned || 0) + (statusCounts.drilling || 0)}
                    </Typography>
                    <Typography variant="caption">Active</Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFA726' }}>
                      {statusCounts.created || 0}
                    </Typography>
                    <Typography variant="caption">Pending</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default MapView;