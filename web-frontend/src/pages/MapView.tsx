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
      {/* Sidebar - Improved Design */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? 380 : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 380,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
            borderRight: 'none',
            background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
            boxShadow: '4px 0 12px rgba(0,0,0,0.08)',
          },
        }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: 1.5, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <WaterDrop sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Borehole Sites
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ 
                color: 'text.secondary',
                background: 'rgba(103, 126, 234, 0.1)',
                px: 1.5,
                py: 0.5,
                borderRadius: 10,
                fontWeight: 500
              }}>
                {filteredJobs.length} of {jobs.length} locations
              </Typography>
            </Box>
          </Box>

          <TextField
            fullWidth
            placeholder="Search by name, client, or site..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'white',
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
              Filter by Status
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={`All (${jobs.length})`}
                onClick={() => setSelectedStatus('all')}
                sx={{
                  backgroundColor: selectedStatus === 'all' ? 'primary.main' : 'white',
                  color: selectedStatus === 'all' ? 'white' : 'text.primary',
                  borderColor: selectedStatus === 'all' ? 'primary.main' : 'divider',
                  fontWeight: selectedStatus === 'all' ? 600 : 400,
                  '&:hover': {
                    backgroundColor: selectedStatus === 'all' ? 'primary.dark' : 'grey.100',
                  }
                }}
                variant={selectedStatus === 'all' ? 'filled' : 'outlined'}
              />
              {Object.entries(statusCounts).map(([status, count]) => (
                <Chip
                  key={status}
                  icon={selectedStatus === status ? getStatusIcon(status) : undefined}
                  label={`${status.charAt(0).toUpperCase() + status.slice(1)} (${count})`}
                  onClick={() => setSelectedStatus(status)}
                  sx={{
                    backgroundColor: selectedStatus === status ? getStatusColor(status) : 'white',
                    color: selectedStatus === status ? 'white' : getStatusColor(status),
                    borderColor: getStatusColor(status),
                    fontWeight: selectedStatus === status ? 600 : 400,
                    '& .MuiChip-icon': {
                      color: 'white',
                    },
                    '&:hover': {
                      backgroundColor: selectedStatus === status ? getStatusColor(status) : `${getStatusColor(status)}15`,
                    }
                  }}
                  variant={selectedStatus === status ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>

          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
            Site List
          </Typography>
          
          <Box sx={{ 
            flexGrow: 1, 
            overflow: 'auto',
            mx: -1,
            px: 1,
            '&::-webkit-scrollbar': {
              width: 8,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'grey.100',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'grey.400',
              borderRadius: 4,
              '&:hover': {
                backgroundColor: 'grey.500',
              }
            }
          }}>
            <List sx={{ py: 0 }}>
              {filteredJobs.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  color: 'text.secondary'
                }}>
                  <LocationOn sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                  <Typography variant="body2">
                    No boreholes found matching your criteria
                  </Typography>
                </Box>
              ) : (
                filteredJobs.map((job) => (
                  <ListItem
                    key={job.id}
                    onClick={() => handleJobClick(job)}
                    sx={{
                      mb: 1.5,
                      borderRadius: 2,
                      backgroundColor: selectedJob?.id === job.id 
                        ? 'rgba(103, 126, 234, 0.12)' 
                        : 'white',
                      border: '1px solid',
                      borderColor: selectedJob?.id === job.id 
                        ? 'primary.main' 
                        : 'grey.200',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: selectedJob?.id === job.id 
                          ? 'rgba(103, 126, 234, 0.15)'
                          : 'grey.50',
                        borderColor: 'primary.light',
                        transform: 'translateX(4px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {job.name}
                          </Typography>
                          <Chip
                            icon={getStatusIcon(job.status)}
                            label={job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            size="small"
                            sx={{
                              backgroundColor: getStatusColor(job.status),
                              color: 'white',
                              height: 26,
                              fontWeight: 500,
                              '& .MuiChip-icon': {
                                color: 'white',
                                fontSize: 16,
                              }
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            <strong>Client:</strong> {job.clientName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            <strong>Site:</strong> {job.siteName}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <Typography variant="caption" sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              color: 'text.secondary'
                            }}>
                              <LocationOn sx={{ fontSize: 14, mr: 0.5 }} />
                              {Number(job.latitude).toFixed(4)}°, {Number(job.longitude).toFixed(4)}°
                            </Typography>
                            {job.budgetUsd && (
                              <Typography variant="caption" sx={{ 
                                color: 'success.main',
                                fontWeight: 600
                              }}>
                                ${Number(job.budgetUsd).toLocaleString()}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))
              )}
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

        {/* Map Type Controls - Improved Design */}
        <Paper
          elevation={2}
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 1000,
            borderRadius: 2,
            overflow: 'hidden',
            background: 'white',
          }}
        >
          <ButtonGroup orientation="vertical">
            <Tooltip title="Road Map" placement="left">
              <Button
                variant={mapType === 'roadmap' ? 'contained' : 'text'}
                onClick={() => setMapType('roadmap')}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderRadius: 0,
                  backgroundColor: mapType === 'roadmap' ? 'primary.main' : 'white',
                  '&:hover': {
                    backgroundColor: mapType === 'roadmap' ? 'primary.dark' : 'grey.100',
                  }
                }}
              >
                <MapIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Satellite" placement="left">
              <Button
                variant={mapType === 'satellite' ? 'contained' : 'text'}
                onClick={() => setMapType('satellite')}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderRadius: 0,
                  backgroundColor: mapType === 'satellite' ? 'primary.main' : 'white',
                  '&:hover': {
                    backgroundColor: mapType === 'satellite' ? 'primary.dark' : 'grey.100',
                  }
                }}
              >
                <Satellite />
              </Button>
            </Tooltip>
            <Tooltip title="Terrain" placement="left">
              <Button
                variant={mapType === 'terrain' ? 'contained' : 'text'}
                onClick={() => setMapType('terrain')}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderRadius: 0,
                  backgroundColor: mapType === 'terrain' ? 'primary.main' : 'white',
                  '&:hover': {
                    backgroundColor: mapType === 'terrain' ? 'primary.dark' : 'grey.100',
                  }
                }}
              >
                <Terrain />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Paper>

        {/* Zoom Controls - Improved Design */}
        <Paper
          elevation={2}
          sx={{
            position: 'absolute',
            bottom: 280,
            right: 20,
            zIndex: 1000,
            borderRadius: 2,
            overflow: 'hidden',
            background: 'white',
          }}
        >
          <ButtonGroup orientation="vertical">
            <Button 
              onClick={() => map?.setZoom((map.getZoom() || 7) + 1)}
              sx={{
                py: 1,
                px: 2,
                fontSize: 18,
                fontWeight: 600,
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: 'grey.100',
                }
              }}
            >
              +
            </Button>
            <Button 
              onClick={() => map?.setZoom((map.getZoom() || 7) - 1)}
              sx={{
                py: 1,
                px: 2,
                fontSize: 18,
                fontWeight: 600,
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: 'grey.100',
                }
              }}
            >
              −
            </Button>
            <Tooltip title="Reset View" placement="left">
              <Button 
                onClick={handleResetView}
                sx={{
                  py: 1,
                  px: 2,
                  borderRadius: 0,
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  }
                }}
              >
                <MyLocation />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Paper>

        {/* Toggle Sidebar - Improved Design */}
        <Fab
          size="medium"
          onClick={() => setDrawerOpen(!drawerOpen)}
          sx={{
            position: 'absolute',
            top: 20,
            left: drawerOpen ? 396 : 20,
            zIndex: 1000,
            transition: 'all 0.3s ease',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b4299 100%)',
              transform: 'scale(1.05)',
            }
          }}
        >
          <ChevronLeft sx={{ 
            transform: drawerOpen ? 'none' : 'rotate(180deg)',
            transition: 'transform 0.3s ease'
          }} />
        </Fab>

        {/* Stats Overview - Improved Design */}
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            bottom: 24,
            left: drawerOpen ? 384 : 24,
            zIndex: 1000,
            transition: 'all 0.3s ease',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(249,250,251,0.98) 100%)',
            backdropFilter: 'blur(12px)',
            borderRadius: 2,
            overflow: 'hidden',
            minWidth: 420,
            maxWidth: 480,
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <WaterDrop sx={{ fontSize: 20, color: 'primary.main' }} />
              Borehole Statistics
            </Typography>
            
            <Grid container spacing={2}>
              <Grid size={3}>
                <Box 
                  sx={{ 
                    textAlign: 'center',
                    p: 1.5,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {jobs.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.95 }}>
                    Total Sites
                  </Typography>
                </Box>
              </Grid>
              
              <Grid size={3}>
                <Box 
                  sx={{ 
                    textAlign: 'center',
                    p: 1.5,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #66BB6A 0%, #43A047 100%)',
                    color: 'white'
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {statusCounts.completed || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.95 }}>
                    Completed
                  </Typography>
                </Box>
              </Grid>
              
              <Grid size={3}>
                <Box 
                  sx={{ 
                    textAlign: 'center',
                    p: 1.5,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)',
                    color: 'white'
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {(statusCounts.assigned || 0) + (statusCounts.drilling || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.95 }}>
                    In Progress
                  </Typography>
                </Box>
              </Grid>
              
              <Grid size={3}>
                <Box 
                  sx={{ 
                    textAlign: 'center',
                    p: 1.5,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #42A5F5 0%, #1E88E5 100%)',
                    color: 'white'
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {statusCounts.created || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.95 }}>
                    Pending
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {/* Progress Bar */}
            <Box sx={{ mt: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Completion Rate
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {jobs.length > 0 ? Math.round((statusCounts.completed || 0) / jobs.length * 100) : 0}%
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  height: 8, 
                  borderRadius: 4, 
                  bgcolor: 'grey.200',
                  overflow: 'hidden'
                }}
              >
                <Box 
                  sx={{ 
                    height: '100%', 
                    width: `${jobs.length > 0 ? (statusCounts.completed || 0) / jobs.length * 100 : 0}%`,
                    background: 'linear-gradient(90deg, #66BB6A 0%, #43A047 100%)',
                    transition: 'width 0.5s ease',
                    borderRadius: 4,
                  }} 
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default MapView;