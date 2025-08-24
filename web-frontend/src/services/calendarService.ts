import api from './api.service';

export enum EventType {
  // Operations
  DRILLING = 'drilling',
  SURVEY = 'survey',
  INSTALLATION = 'installation',
  MAINTENANCE = 'maintenance',
  
  // Finance
  PAYMENT_DUE = 'payment_due',
  INVOICE_FOLLOW_UP = 'invoice_follow_up',
  PAYMENT_MILESTONE = 'payment_milestone',
  
  // Inventory
  STOCK_DELIVERY = 'stock_delivery',
  STOCK_REORDER = 'stock_reorder',
  EQUIPMENT_RETURN = 'equipment_return',
  INVENTORY_AUDIT = 'inventory_audit',
  
  // Management
  MEETING = 'meeting',
  REVIEW = 'review',
  PLANNING = 'planning',
  
  // General
  REMINDER = 'reminder',
  DEADLINE = 'deadline',
  OTHER = 'other',
}

export enum EventStatus {
  TENTATIVE = 'tentative',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
}

export enum EventVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  ROLE_BASED = 'role_based',
  MANAGEMENT = 'management',
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventType: EventType;
  status: EventStatus;
  visibility: EventVisibility;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  location?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  color?: string;
  recurrenceRule?: string;
  recurrenceId?: string;
  reminders?: {
    type: 'email' | 'push' | 'sms';
    minutesBefore: number;
    sent?: boolean;
  }[];
  allowedRoles?: string[];
  requiredRoles?: string[];
  attendees?: any[];
  job?: any;
  jobId?: string;
  installation?: any;
  installationId?: string;
  invoice?: any;
  invoiceId?: string;
  metadata?: any;
  conflictsWith?: string[];
  hasConflict: boolean;
  createdById: string;
  createdBy?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  eventType: EventType;
  status?: EventStatus;
  visibility?: EventVisibility;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  location?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  color?: string;
  recurrenceRule?: string;
  attendeeIds?: string[];
  allowedRoles?: string[];
  jobId?: string;
  installationId?: string;
  invoiceId?: string;
  reminders?: {
    type: 'email' | 'push' | 'sms';
    minutesBefore: number;
  }[];
  metadata?: any;
}

export interface CalendarSyncSettings {
  id: string;
  userId: string;
  syncEnabled: boolean;
  syncDirection: 'one-way' | 'two-way';
  googleCalendar?: {
    refreshToken: string;
    calendarId: string;
    syncToken?: string;
  };
  appleCalendar?: {
    caldavUrl: string;
    username: string;
  };
  outlookCalendar?: {
    refreshToken: string;
    calendarId: string;
  };
  syncPreferences: {
    assignedJobs?: boolean;
    teamSchedules?: boolean;
    equipmentPickups?: boolean;
    paymentDues?: boolean;
    invoiceFollowUps?: boolean;
    monthEndTasks?: boolean;
    stockDeliveries?: boolean;
    reorderAlerts?: boolean;
    inventoryAudits?: boolean;
    allOperations?: boolean;
    financialMilestones?: boolean;
    teamAvailability?: boolean;
    strategicMeetings?: boolean;
  };
  syncRules: {
    advanceNoticeDays?: number;
    includePrivateNotes?: boolean;
    includeGpsLocation?: boolean;
    autoAcceptChanges?: boolean;
    conflictResolution?: 'local' | 'remote' | 'newest' | 'manual';
  };
  caldavToken?: string;
  lastSyncedAt?: string;
  lastSyncError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarStatistics {
  period: string;
  totalEvents: number;
  eventsByType: Record<string, number>;
  upcomingEvents: number;
  completedEvents: number;
  conflictCount: number;
}

export interface TeamAvailability {
  date: string;
  teams: {
    id: string;
    name: string;
    status: string;
    available: boolean;
    currentTask?: string;
  }[];
  conflicts: any[];
}

class CalendarService {
  // Events
  async getEvents(params?: {
    startDate?: string;
    endDate?: string;
    eventType?: EventType;
    status?: EventStatus;
    jobId?: string;
  }): Promise<CalendarEvent[]> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.eventType) queryParams.append('eventType', params.eventType);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.jobId) queryParams.append('jobId', params.jobId);
    
    return api.get<CalendarEvent[]>(`/calendar/events?${queryParams.toString()}`);
  }

  async getEvent(id: string): Promise<CalendarEvent> {
    return api.get<CalendarEvent>(`/calendar/events/${id}`);
  }

  async createEvent(data: CreateEventDto): Promise<CalendarEvent> {
    return api.post<CalendarEvent>('/calendar/events', data);
  }

  async updateEvent(id: string, data: Partial<CreateEventDto>): Promise<CalendarEvent> {
    return api.put<CalendarEvent>(`/calendar/events/${id}`, data);
  }

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/calendar/events/${id}`);
  }

  async getEventConflicts(id: string): Promise<CalendarEvent[]> {
    return api.get<CalendarEvent[]>(`/calendar/events/${id}/conflicts`);
  }

  // Bulk operations
  async createBulkEvents(events: CreateEventDto[]): Promise<CalendarEvent[]> {
    return api.post<CalendarEvent[]>('/calendar/events/bulk', events);
  }

  // Sync settings
  async getSyncSettings(): Promise<CalendarSyncSettings> {
    return api.get<CalendarSyncSettings>('/calendar/sync/settings');
  }

  async updateSyncSettings(settings: Partial<CalendarSyncSettings>): Promise<CalendarSyncSettings> {
    return api.put<CalendarSyncSettings>('/calendar/sync/settings', settings);
  }

  // Google Calendar
  async initiateGoogleAuth(): Promise<{ authUrl: string }> {
    return api.get<{ authUrl: string }>('/calendar/sync/google/auth');
  }

  async handleGoogleCallback(code: string, state: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/calendar/sync/google/callback', { code, state });
  }

  async disconnectGoogle(): Promise<{ message: string }> {
    return api.delete<{ message: string }>('/calendar/sync/google');
  }

  // CalDAV
  async getCalDAVInstructions(): Promise<{
    server: string;
    username: string;
    passwordNote: string;
    calendarUrl: string;
    webcalUrl: string;
    instructions: any;
  }> {
    return api.get('/calendar/sync/caldav/instructions');
  }

  // Team availability
  async getTeamAvailability(date?: string): Promise<TeamAvailability> {
    const params = date ? `?date=${date}` : '';
    return api.get<TeamAvailability>(`/calendar/team-availability${params}`);
  }

  // Statistics
  async getStatistics(period: string = 'month'): Promise<CalendarStatistics> {
    return api.get<CalendarStatistics>(`/calendar/statistics?period=${period}`);
  }

  // Export
  async exportCalendar(startDate?: string, endDate?: string): Promise<Blob> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    // For now, return empty blob - this feature needs backend implementation
    return new Blob(['Calendar export not yet implemented'], { type: 'text/plain' });
  }

  // Get iCal feed URL
  getICalFeedUrl(userId: string, token: string): string {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://borehole-management-nuyvk.ondigitalocean.app/api/v1';
    return `${baseUrl}/calendar/feed/${userId}/${token}.ics`;
  }

  // Get webcal URL for direct subscription
  getWebcalUrl(userId: string, token: string): string {
    const url = this.getICalFeedUrl(userId, token);
    return url.replace('https://', 'webcal://').replace('http://', 'webcal://');
  }

  // Helper to get event color based on type
  getEventColor(eventType: EventType): string {
    const colors: Record<EventType, string> = {
      [EventType.DRILLING]: '#1976d2',
      [EventType.SURVEY]: '#4caf50',
      [EventType.INSTALLATION]: '#ff9800',
      [EventType.MAINTENANCE]: '#9c27b0',
      [EventType.PAYMENT_DUE]: '#f44336',
      [EventType.INVOICE_FOLLOW_UP]: '#2196f3',
      [EventType.PAYMENT_MILESTONE]: '#4caf50',
      [EventType.STOCK_DELIVERY]: '#795548',
      [EventType.STOCK_REORDER]: '#ff5722',
      [EventType.EQUIPMENT_RETURN]: '#607d8b',
      [EventType.INVENTORY_AUDIT]: '#607d8b',
      [EventType.MEETING]: '#3f51b5',
      [EventType.REVIEW]: '#009688',
      [EventType.PLANNING]: '#673ab7',
      [EventType.REMINDER]: '#ffc107',
      [EventType.DEADLINE]: '#f44336',
      [EventType.OTHER]: '#9e9e9e',
    };
    return colors[eventType] || '#9e9e9e';
  }

  // Helper to format event for FullCalendar
  formatForFullCalendar(event: CalendarEvent): any {
    return {
      id: event.id,
      title: event.title,
      start: event.startDate,
      end: event.endDate,
      allDay: event.allDay,
      color: event.color || this.getEventColor(event.eventType),
      extendedProps: {
        description: event.description,
        eventType: event.eventType,
        status: event.status,
        location: event.location,
        hasConflict: event.hasConflict,
        conflictsWith: event.conflictsWith,
        job: event.job,
        installation: event.installation,
        invoice: event.invoice,
        attendees: event.attendees,
        metadata: event.metadata,
      },
    };
  }
}

export default new CalendarService();