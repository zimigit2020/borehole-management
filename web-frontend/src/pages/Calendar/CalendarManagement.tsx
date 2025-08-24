import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Switch,
  Tooltip,
  Badge,
  Avatar,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarIcon,
  Sync as SyncIcon,
  Warning as WarningIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  Inventory as InventoryIcon,
  Build as BuildIcon,
  Engineering as EngineeringIcon,
  Google as GoogleIcon,
  Apple as AppleIcon,
  Microsoft as MicrosoftIcon,
  Link as LinkIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../contexts/AuthContext';
import calendarService, { 
  CalendarEvent, 
  EventType, 
  EventStatus, 
  EventVisibility,
  CreateEventDto,
  CalendarSyncSettings,
} from '../../services/calendarService';
import { format, parseISO, addMinutes } from 'date-fns';

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
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CalendarManagement: React.FC = () => {
  const { user } = useAuth();
  const calendarRef = useRef<any>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [openSyncDialog, setOpenSyncDialog] = useState(false);
  const [openConflictDialog, setOpenConflictDialog] = useState(false);
  const [syncSettings, setSyncSettings] = useState<CalendarSyncSettings | null>(null);
  const [conflicts, setConflicts] = useState<CalendarEvent[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [filterType, setFilterType] = useState<EventType | ''>('');
  const [filterStatus, setFilterStatus] = useState<EventStatus | ''>('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [caldavToken, setCaldavToken] = useState<string>('');
  const [showCaldavInstructions, setShowCaldavInstructions] = useState(false);
  const [teamAvailability, setTeamAvailability] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);

  // Form state for event dialog
  const [eventForm, setEventForm] = useState<CreateEventDto>({
    title: '',
    description: '',
    eventType: EventType.OTHER,
    status: EventStatus.CONFIRMED,
    visibility: EventVisibility.PUBLIC,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 3600000).toISOString(),
    allDay: false,
    location: '',
    reminders: [],
  });

  // Load events
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterType) params.eventType = filterType;
      if (filterStatus) params.status = filterStatus;
      
      const data = await calendarService.getEvents(params);
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
      showSnackbar('Failed to load calendar events', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus]);

  // Load sync settings
  const loadSyncSettings = async () => {
    try {
      const settings = await calendarService.getSyncSettings();
      setSyncSettings(settings);
      setCaldavToken(settings.caldavToken || '');
    } catch (error) {
      console.error('Failed to load sync settings:', error);
    }
  };

  // Load team availability
  const loadTeamAvailability = async (date?: string) => {
    try {
      const availability = await calendarService.getTeamAvailability(date);
      setTeamAvailability(availability);
    } catch (error) {
      console.error('Failed to load team availability:', error);
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    try {
      const stats = await calendarService.getStatistics('month');
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  useEffect(() => {
    loadEvents();
    loadSyncSettings();
    loadTeamAvailability();
    loadStatistics();
  }, [loadEvents]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle calendar event click
  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      setSelectedEvent(event);
      setOpenEventDialog(true);
      setEventForm({
        title: event.title,
        description: event.description || '',
        eventType: event.eventType,
        status: event.status,
        visibility: event.visibility,
        startDate: event.startDate,
        endDate: event.endDate,
        allDay: event.allDay || false,
        location: event.location || '',
        jobId: event.jobId,
        installationId: event.installationId,
        invoiceId: event.invoiceId,
        reminders: event.reminders || [],
      });
    }
  };

  // Handle date selection for new event
  const handleDateSelect = (selectInfo: any) => {
    setSelectedEvent(null);
    setEventForm({
      title: '',
      description: '',
      eventType: EventType.OTHER,
      status: EventStatus.CONFIRMED,
      visibility: EventVisibility.PUBLIC,
      startDate: selectInfo.start.toISOString(),
      endDate: selectInfo.end.toISOString(),
      allDay: selectInfo.allDay,
      location: '',
      reminders: [],
    });
    setOpenEventDialog(true);
  };

  // Handle event drag
  const handleEventDrop = async (dropInfo: any) => {
    try {
      const eventId = dropInfo.event.id;
      await calendarService.updateEvent(eventId, {
        startDate: dropInfo.event.start.toISOString(),
        endDate: dropInfo.event.end.toISOString(),
      });
      showSnackbar('Event updated successfully', 'success');
      loadEvents();
    } catch (error) {
      console.error('Failed to update event:', error);
      showSnackbar('Failed to update event', 'error');
      dropInfo.revert();
    }
  };

  // Save event
  const handleSaveEvent = async () => {
    try {
      if (selectedEvent) {
        await calendarService.updateEvent(selectedEvent.id, eventForm);
        showSnackbar('Event updated successfully', 'success');
      } else {
        await calendarService.createEvent(eventForm);
        showSnackbar('Event created successfully', 'success');
      }
      setOpenEventDialog(false);
      loadEvents();
    } catch (error) {
      console.error('Failed to save event:', error);
      showSnackbar('Failed to save event', 'error');
    }
  };

  // Delete event
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      await calendarService.deleteEvent(selectedEvent.id);
      showSnackbar('Event deleted successfully', 'success');
      setOpenEventDialog(false);
      loadEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      showSnackbar('Failed to delete event', 'error');
    }
  };

  // Check conflicts
  const handleCheckConflicts = async () => {
    if (!selectedEvent) return;
    
    try {
      const eventConflicts = await calendarService.getEventConflicts(selectedEvent.id);
      setConflicts(eventConflicts);
      setOpenConflictDialog(true);
    } catch (error) {
      console.error('Failed to check conflicts:', error);
      showSnackbar('Failed to check conflicts', 'error');
    }
  };

  // Google Calendar auth
  const handleGoogleAuth = async () => {
    try {
      const { authUrl } = await calendarService.initiateGoogleAuth();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to initiate Google auth:', error);
      showSnackbar('Failed to connect to Google Calendar', 'error');
    }
  };

  // Disconnect Google
  const handleDisconnectGoogle = async () => {
    try {
      await calendarService.disconnectGoogle();
      showSnackbar('Google Calendar disconnected', 'success');
      loadSyncSettings();
    } catch (error) {
      console.error('Failed to disconnect Google:', error);
      showSnackbar('Failed to disconnect Google Calendar', 'error');
    }
  };

  // Get CalDAV instructions
  const handleGetCaldavInstructions = async () => {
    try {
      const instructions = await calendarService.getCalDAVInstructions();
      setCaldavToken(instructions.username.split('_')[1]); // Extract token from username
      setShowCaldavInstructions(true);
    } catch (error) {
      console.error('Failed to get CalDAV instructions:', error);
      showSnackbar('Failed to get CalDAV instructions', 'error');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSnackbar('Copied to clipboard', 'success');
  };

  // Export calendar
  const handleExportCalendar = async () => {
    try {
      const blob = await calendarService.exportCalendar();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calendar-export-${format(new Date(), 'yyyy-MM-dd')}.ics`;
      a.click();
      window.URL.revokeObjectURL(url);
      showSnackbar('Calendar exported successfully', 'success');
    } catch (error) {
      console.error('Failed to export calendar:', error);
      showSnackbar('Failed to export calendar', 'error');
    }
  };

  // Update sync settings
  const handleUpdateSyncSettings = async (settings: Partial<CalendarSyncSettings>) => {
    try {
      const updated = await calendarService.updateSyncSettings(settings);
      setSyncSettings(updated);
      showSnackbar('Sync settings updated', 'success');
    } catch (error) {
      console.error('Failed to update sync settings:', error);
      showSnackbar('Failed to update sync settings', 'error');
    }
  };

  // Get role-specific event icon
  const getEventIcon = (eventType: EventType) => {
    switch (eventType) {
      case EventType.DRILLING:
      case EventType.SURVEY:
        return <EngineeringIcon />;
      case EventType.INSTALLATION:
      case EventType.MAINTENANCE:
        return <BuildIcon />;
      case EventType.PAYMENT_DUE:
      case EventType.INVOICE_FOLLOW_UP:
      case EventType.PAYMENT_MILESTONE:
        return <PaymentIcon />;
      case EventType.STOCK_DELIVERY:
      case EventType.STOCK_REORDER:
      case EventType.EQUIPMENT_RETURN:
      case EventType.INVENTORY_AUDIT:
        return <InventoryIcon />;
      case EventType.MEETING:
      case EventType.REVIEW:
      case EventType.PLANNING:
        return <PeopleIcon />;
      default:
        return <EventIcon />;
    }
  };

  // Check if user can see all events
  const canSeeAllEvents = user?.role === 'admin' || user?.role === 'project_manager';

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Grid2 container spacing={3}>
          {/* Header */}
          <Grid2 size={12}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon />
                  Calendar Management
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={() => setTabValue(1)}
                  >
                    Filters
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SyncIcon />}
                    onClick={() => setOpenSyncDialog(true)}
                  >
                    Sync Settings
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportCalendar}
                  >
                    Export
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setSelectedEvent(null);
                      setEventForm({
                        title: '',
                        description: '',
                        eventType: EventType.OTHER,
                        status: EventStatus.CONFIRMED,
                        visibility: EventVisibility.PUBLIC,
                        startDate: new Date().toISOString(),
                        endDate: new Date(Date.now() + 3600000).toISOString(),
                        allDay: false,
                        location: '',
                        reminders: [],
                      });
                      setOpenEventDialog(true);
                    }}
                  >
                    New Event
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid2>

          {/* Statistics Cards */}
          {statistics && (
            <Grid2 size={12}>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Events
                      </Typography>
                      <Typography variant="h4">
                        {statistics.totalEvents}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Upcoming
                      </Typography>
                      <Typography variant="h4">
                        {statistics.upcomingEvents}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Completed
                      </Typography>
                      <Typography variant="h4">
                        {statistics.completedEvents}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Conflicts
                      </Typography>
                      <Typography variant="h4" color={statistics.conflictCount > 0 ? 'error' : 'textPrimary'}>
                        {statistics.conflictCount}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid2>
              </Grid2>
            </Grid2>
          )}

          {/* Main Content */}
          <Grid2 size={12}>
            <Paper>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                <Tab label="Calendar View" />
                <Tab label="Filters & Settings" />
                <Tab label="Team Availability" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                  }}
                  events={events.map(event => calendarService.formatForFullCalendar(event))}
                  eventClick={handleEventClick}
                  select={handleDateSelect}
                  eventDrop={handleEventDrop}
                  selectable={true}
                  editable={true}
                  height="auto"
                  eventDisplay="block"
                  dayMaxEvents={3}
                />
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Grid2 container spacing={3}>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Event Type Filter</InputLabel>
                      <Select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as EventType | '')}
                        label="Event Type Filter"
                      >
                        <MenuItem value="">All Types</MenuItem>
                        {Object.values(EventType).map(type => (
                          <MenuItem key={type} value={type}>
                            <Box display="flex" alignItems="center" gap={1}>
                              {getEventIcon(type)}
                              {type.replace(/_/g, ' ').toLowerCase()}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Status Filter</InputLabel>
                      <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as EventStatus | '')}
                        label="Status Filter"
                      >
                        <MenuItem value="">All Statuses</MenuItem>
                        {Object.values(EventStatus).map(status => (
                          <MenuItem key={status} value={status}>
                            {status.replace(/_/g, ' ').toLowerCase()}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid2>
                  <Grid2 size={12}>
                    <Button
                      variant="contained"
                      startIcon={<RefreshIcon />}
                      onClick={loadEvents}
                    >
                      Apply Filters
                    </Button>
                  </Grid2>
                </Grid2>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                {teamAvailability && (
                  <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                      <Typography variant="h6" gutterBottom>
                        Team Availability for {teamAvailability.date}
                      </Typography>
                    </Grid2>
                    {teamAvailability.teams.map((team: any) => (
                      <Grid2 size={{ xs: 12, md: 6 }} key={team.id}>
                        <Card>
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="subtitle1">{team.name}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {team.currentTask || 'No current task'}
                                </Typography>
                              </Box>
                              <Chip
                                label={team.available ? 'Available' : 'Busy'}
                                color={team.available ? 'success' : 'error'}
                                size="small"
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid2>
                    ))}
                  </Grid2>
                )}
              </TabPanel>
            </Paper>
          </Grid2>
        </Grid2>

        {/* Event Dialog */}
        <Dialog open={openEventDialog} onClose={() => setOpenEventDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedEvent ? 'Edit Event' : 'New Event'}
          </DialogTitle>
          <DialogContent>
            <Grid2 container spacing={2} sx={{ mt: 1 }}>
              <Grid2 size={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                />
              </Grid2>
              <Grid2 size={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Event Type</InputLabel>
                  <Select
                    value={eventForm.eventType}
                    onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value as EventType })}
                    label="Event Type"
                  >
                    {Object.values(EventType).map(type => (
                      <MenuItem key={type} value={type}>
                        {type.replace(/_/g, ' ').toLowerCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={eventForm.status}
                    onChange={(e) => setEventForm({ ...eventForm, status: e.target.value as EventStatus })}
                    label="Status"
                  >
                    {Object.values(EventStatus).map(status => (
                      <MenuItem key={status} value={status}>
                        {status.replace(/_/g, ' ').toLowerCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Start Date"
                  value={parseISO(eventForm.startDate)}
                  onChange={(date) => date && setEventForm({ ...eventForm, startDate: date.toISOString() })}
                  sx={{ width: '100%' }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="End Date"
                  value={parseISO(eventForm.endDate)}
                  onChange={(date) => date && setEventForm({ ...eventForm, endDate: date.toISOString() })}
                  sx={{ width: '100%' }}
                />
              </Grid2>
              <Grid2 size={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={eventForm.allDay}
                      onChange={(e) => setEventForm({ ...eventForm, allDay: e.target.checked })}
                    />
                  }
                  label="All Day Event"
                />
              </Grid2>
              <Grid2 size={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  InputProps={{
                    startAdornment: <LocationIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid2>
              {selectedEvent?.hasConflict && (
                <Grid2 size={12}>
                  <Alert severity="warning" action={
                    <Button size="small" onClick={handleCheckConflicts}>
                      View Conflicts
                    </Button>
                  }>
                    This event has conflicts with other events
                  </Alert>
                </Grid2>
              )}
            </Grid2>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEventDialog(false)}>Cancel</Button>
            {selectedEvent && (
              <Button color="error" onClick={handleDeleteEvent}>
                Delete
              </Button>
            )}
            <Button variant="contained" onClick={handleSaveEvent}>
              {selectedEvent ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Sync Settings Dialog */}
        <Dialog open={openSyncDialog} onClose={() => setOpenSyncDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Calendar Sync Settings</DialogTitle>
          <DialogContent>
            <Grid2 container spacing={3} sx={{ mt: 1 }}>
              {/* Google Calendar */}
              <Grid2 size={12}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={2}>
                        <GoogleIcon />
                        <Box>
                          <Typography variant="subtitle1">Google Calendar</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {syncSettings?.googleCalendar ? 'Connected' : 'Not connected'}
                          </Typography>
                        </Box>
                      </Box>
                      {syncSettings?.googleCalendar ? (
                        <Button color="error" onClick={handleDisconnectGoogle}>
                          Disconnect
                        </Button>
                      ) : (
                        <Button variant="contained" onClick={handleGoogleAuth}>
                          Connect
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid2>

              {/* CalDAV (Apple/Outlook) */}
              <Grid2 size={12}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={2}>
                        <AppleIcon />
                        <Box>
                          <Typography variant="subtitle1">CalDAV (Apple Calendar / Outlook)</Typography>
                          <Typography variant="body2" color="textSecondary">
                            Universal calendar sync via CalDAV
                          </Typography>
                        </Box>
                      </Box>
                      <Button variant="contained" onClick={handleGetCaldavInstructions}>
                        Get Instructions
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid2>

              {/* iCal Feed */}
              <Grid2 size={12}>
                <Card>
                  <CardContent>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        iCal Feed URL
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Subscribe to your calendar in any app that supports iCal feeds
                      </Typography>
                      <Box display="flex" gap={1} mt={2}>
                        <TextField
                          fullWidth
                          size="small"
                          value={calendarService.getWebcalUrl(user?.id || '', caldavToken)}
                          InputProps={{ readOnly: true }}
                        />
                        <IconButton
                          onClick={() => copyToClipboard(calendarService.getWebcalUrl(user?.id || '', caldavToken))}
                        >
                          <CopyIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid2>

              {/* Sync Preferences */}
              <Grid2 size={12}>
                <Typography variant="h6" gutterBottom>
                  Sync Preferences
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Sync assigned jobs" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={syncSettings?.syncPreferences?.assignedJobs || false}
                        onChange={(e) => handleUpdateSyncSettings({
                          syncPreferences: {
                            ...syncSettings?.syncPreferences,
                            assignedJobs: e.target.checked,
                          },
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Sync payment reminders" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={syncSettings?.syncPreferences?.paymentDues || false}
                        onChange={(e) => handleUpdateSyncSettings({
                          syncPreferences: {
                            ...syncSettings?.syncPreferences,
                            paymentDues: e.target.checked,
                          },
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Sync stock deliveries" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={syncSettings?.syncPreferences?.stockDeliveries || false}
                        onChange={(e) => handleUpdateSyncSettings({
                          syncPreferences: {
                            ...syncSettings?.syncPreferences,
                            stockDeliveries: e.target.checked,
                          },
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Grid2>
            </Grid2>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSyncDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* CalDAV Instructions Dialog */}
        <Dialog open={showCaldavInstructions} onClose={() => setShowCaldavInstructions(false)} maxWidth="md" fullWidth>
          <DialogTitle>CalDAV Setup Instructions</DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom>
              Apple Calendar
            </Typography>
            <Typography variant="body2" paragraph>
              1. Open Calendar app → Preferences → Accounts → Add Account<br />
              2. Select "Add CalDAV Account"<br />
              3. Enter these details:
            </Typography>
            <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="body2">
                Server: {window.location.hostname}/api/v1/calendar/caldav<br />
                Username: user_{caldavToken}<br />
                Password: [Use your account password]
              </Typography>
            </Box>

            <Typography variant="h6" gutterBottom>
              Outlook
            </Typography>
            <Typography variant="body2" paragraph>
              1. File → Account Settings → Internet Calendars<br />
              2. Click "New" and paste this URL:
            </Typography>
            <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
              <Typography variant="body2">
                {calendarService.getWebcalUrl(user?.id || '', caldavToken)}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCaldavInstructions(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Conflict Dialog */}
        <Dialog open={openConflictDialog} onClose={() => setOpenConflictDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Event Conflicts</DialogTitle>
          <DialogContent>
            <List>
              {conflicts.map(conflict => (
                <ListItem key={conflict.id}>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={conflict.title}
                    secondary={`${format(parseISO(conflict.startDate), 'PPpp')} - ${format(parseISO(conflict.endDate), 'PPpp')}`}
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConflictDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default CalendarManagement;