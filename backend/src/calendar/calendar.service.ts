import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, LessThan, MoreThan, IsNull, Not } from 'typeorm';
import { CalendarEvent, EventType, EventStatus, EventVisibility, CalendarSyncSettings } from './entities/calendar-event.entity';
import { User, UserRole } from '../users/user.entity';
import { CreateEventDto, UpdateEventDto, SyncSettingsDto } from './dto/calendar.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as ical from 'node-ical';
import * as uuid from 'uuid';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarEvent)
    private eventsRepository: Repository<CalendarEvent>,
    @InjectRepository(CalendarSyncSettings)
    private syncSettingsRepository: Repository<CalendarSyncSettings>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Get events based on user role
  async getEventsForUser(
    user: User,
    startDate: Date,
    endDate: Date,
    filters?: {
      eventType?: EventType;
      status?: EventStatus;
      jobId?: string;
    },
  ): Promise<CalendarEvent[]> {
    const query = this.eventsRepository.createQueryBuilder('event')
      .leftJoinAndSelect('event.attendees', 'attendees')
      .leftJoinAndSelect('event.job', 'job')
      .leftJoinAndSelect('event.installation', 'installation')
      .leftJoinAndSelect('event.invoice', 'invoice')
      .where('event.startDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('event.deletedAt IS NULL');

    // Apply role-based filtering
    switch (user.role) {
      case UserRole.DRILLER:
      case UserRole.SURVEYOR:
        // Specialists see only their assigned work
        query.andWhere(
          '(event.createdById = :userId OR attendees.id = :userId OR event.visibility = :public)',
          {
            userId: user.id,
            public: EventVisibility.PUBLIC,
          },
        );
        break;

      // Note: Add finance roles when they're added to UserRole enum
      // For now, project managers can see finance events
      case UserRole.PROJECT_MANAGER:
        query.andWhere(
          '(event.eventType IN (:...financeTypes) OR event.visibility = :public)',
          {
            financeTypes: [
              EventType.PAYMENT_DUE,
              EventType.INVOICE_FOLLOW_UP,
              EventType.PAYMENT_MILESTONE,
            ],
            public: EventVisibility.PUBLIC,
          },
        );
        break;

      case UserRole.ADMIN:
        // Management sees everything
        // No additional filters needed
        break;

      default:
        // Other roles see only public events or events they're invited to
        query.andWhere(
          '(event.visibility = :public OR :userId = ANY(attendees.id))',
          {
            public: EventVisibility.PUBLIC,
            userId: user.id,
          },
        );
    }

    // Apply additional filters
    if (filters?.eventType) {
      query.andWhere('event.eventType = :eventType', {
        eventType: filters.eventType,
      });
    }

    if (filters?.status) {
      query.andWhere('event.status = :status', { status: filters.status });
    }

    if (filters?.jobId) {
      query.andWhere('event.jobId = :jobId', { jobId: filters.jobId });
    }

    return query.orderBy('event.startDate', 'ASC').getMany();
  }

  // Create a new event
  async createEvent(dto: CreateEventDto, user: User): Promise<CalendarEvent> {
    // Check permissions based on event type
    this.checkEventPermissions(dto.eventType, user);

    const event = this.eventsRepository.create({
      ...dto,
      createdById: user.id,
      color: dto.color || this.getDefaultColor(dto.eventType),
      visibility: dto.visibility || this.getDefaultVisibility(dto.eventType, user.role),
    });

    // Check for conflicts
    const conflicts = await this.checkForConflicts(event);
    if (conflicts.length > 0) {
      event.hasConflict = true;
      event.conflictsWith = conflicts.map(c => c.id);
    }

    const savedEvent = await this.eventsRepository.save(event);

    // Sync to external calendars if enabled
    await this.syncEventToExternal(savedEvent, user);

    return savedEvent;
  }

  // Update an event
  async updateEvent(
    id: string,
    dto: UpdateEventDto,
    user: User,
  ): Promise<CalendarEvent> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['attendees'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if user can edit this event
    if (!this.canEditEvent(event, user)) {
      throw new ForbiddenException('You cannot edit this event');
    }

    Object.assign(event, dto);

    // Re-check for conflicts if dates changed
    if (dto.startDate || dto.endDate) {
      const conflicts = await this.checkForConflicts(event);
      event.hasConflict = conflicts.length > 0;
      event.conflictsWith = conflicts.map(c => c.id);
    }

    const updatedEvent = await this.eventsRepository.save(event);

    // Sync changes to external calendars
    await this.syncEventToExternal(updatedEvent, user);

    return updatedEvent;
  }

  // Delete (soft) an event
  async deleteEvent(id: string, user: User): Promise<void> {
    const event = await this.eventsRepository.findOne({ where: { id } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!this.canEditEvent(event, user)) {
      throw new ForbiddenException('You cannot delete this event');
    }

    event.status = EventStatus.CANCELLED;
    event.deletedAt = new Date();

    await this.eventsRepository.save(event);

    // Remove from external calendars
    await this.removeEventFromExternal(event, user);
  }

  // Check for scheduling conflicts
  async checkForConflicts(event: CalendarEvent): Promise<CalendarEvent[]> {
    const conflicts = await this.eventsRepository.find({
      where: {
        startDate: LessThan(event.endDate),
        endDate: MoreThan(event.startDate),
        status: Not(EventStatus.CANCELLED),
        deletedAt: IsNull(),
      },
    });

    return conflicts.filter(c => {
      // Check if events actually conflict based on resources/attendees
      if (c.id === event.id) return false;

      // Check attendee conflicts
      if (event.attendees && c.attendees) {
        const hasAttendeeConflict = event.attendees.some(a1 =>
          c.attendees.some(a2 => a1.id === a2.id),
        );
        if (hasAttendeeConflict) return true;
      }

      // Check job conflicts (can't have multiple operations on same job)
      if (event.jobId && c.jobId && event.jobId === c.jobId) {
        return true;
      }

      return false;
    });
  }

  // Generate iCal feed for a user
  async generateICalFeed(userId: string, token: string): Promise<string> {
    // Validate token
    const syncSettings = await this.syncSettingsRepository.findOne({
      where: { userId, caldavToken: token },
      relations: ['user'],
    });

    if (!syncSettings) {
      throw new ForbiddenException('Invalid calendar token');
    }

    const user = syncSettings.user;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);

    const events = await this.getEventsForUser(user, startDate, endDate);

    // Generate iCal format
    let icalContent = 'BEGIN:VCALENDAR\r\n';
    icalContent += 'VERSION:2.0\r\n';
    icalContent += 'PRODID:-//Borehole Management//Calendar//EN\r\n';
    icalContent += 'CALSCALE:GREGORIAN\r\n';
    icalContent += 'METHOD:PUBLISH\r\n';
    icalContent += `X-WR-CALNAME:${user.name} - Borehole Schedule\r\n`;
    icalContent += 'X-WR-TIMEZONE:Africa/Harare\r\n';

    for (const event of events) {
      icalContent += 'BEGIN:VEVENT\r\n';
      icalContent += `UID:${event.id}@borehole-management.com\r\n`;
      icalContent += `DTSTAMP:${this.formatICalDate(new Date())}\r\n`;
      icalContent += `DTSTART:${this.formatICalDate(event.startDate)}\r\n`;
      icalContent += `DTEND:${this.formatICalDate(event.endDate)}\r\n`;
      icalContent += `SUMMARY:${this.escapeICalText(event.title)}\r\n`;

      if (event.description) {
        icalContent += `DESCRIPTION:${this.escapeICalText(event.description)}\r\n`;
      }

      if (event.location) {
        icalContent += `LOCATION:${this.escapeICalText(event.location)}\r\n`;
      }

      if (event.gpsCoordinates) {
        icalContent += `GEO:${event.gpsCoordinates.latitude};${event.gpsCoordinates.longitude}\r\n`;
      }

      if (event.reminders && event.reminders.length > 0) {
        for (const reminder of event.reminders) {
          icalContent += 'BEGIN:VALARM\r\n';
          icalContent += 'TRIGGER:-PT' + reminder.minutesBefore + 'M\r\n';
          icalContent += 'ACTION:DISPLAY\r\n';
          icalContent += `DESCRIPTION:${this.escapeICalText(event.title)}\r\n`;
          icalContent += 'END:VALARM\r\n';
        }
      }

      icalContent += `STATUS:${this.mapStatusToICal(event.status)}\r\n`;
      icalContent += `CATEGORIES:${event.eventType}\r\n`;

      if (event.recurrenceRule) {
        icalContent += `RRULE:${event.recurrenceRule}\r\n`;
      }

      icalContent += 'END:VEVENT\r\n';
    }

    icalContent += 'END:VCALENDAR\r\n';

    return icalContent;
  }

  // Sync settings management
  async updateSyncSettings(
    userId: string,
    dto: SyncSettingsDto,
  ): Promise<CalendarSyncSettings> {
    let settings = await this.syncSettingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      settings = this.syncSettingsRepository.create({
        userId,
        caldavToken: uuid.v4(),
      });
    }

    Object.assign(settings, dto);

    return this.syncSettingsRepository.save(settings);
  }

  async getSyncSettings(userId: string): Promise<CalendarSyncSettings> {
    let settings = await this.syncSettingsRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!settings) {
      // Create default settings
      settings = await this.syncSettingsRepository.save({
        userId,
        caldavToken: uuid.v4(),
        syncEnabled: false,
        syncDirection: 'two-way',
        syncPreferences: this.getDefaultSyncPreferences(settings.user.role),
        syncRules: {
          advanceNoticeDays: 30,
          includePrivateNotes: false,
          includeGpsLocation: true,
          autoAcceptChanges: false,
          conflictResolution: 'manual',
        },
      });
    }

    return settings;
  }

  // Cron job for syncing with external calendars
  @Cron(CronExpression.EVERY_10_MINUTES)
  async syncExternalCalendars() {
    const enabledSyncs = await this.syncSettingsRepository.find({
      where: { syncEnabled: true },
      relations: ['user'],
    });

    for (const sync of enabledSyncs) {
      try {
        if (sync.googleCalendar) {
          await this.syncWithGoogle(sync);
        }
        if (sync.appleCalendar) {
          await this.syncWithCalDAV(sync);
        }
        if (sync.outlookCalendar) {
          await this.syncWithOutlook(sync);
        }

        sync.lastSyncedAt = new Date();
        sync.lastSyncError = null;
      } catch (error) {
        sync.lastSyncError = error.message;
      }

      await this.syncSettingsRepository.save(sync);
    }
  }

  // Helper methods
  private checkEventPermissions(eventType: EventType, user: User): void {
    const rolePermissions = {
      finance: [
        EventType.PAYMENT_DUE,
        EventType.INVOICE_FOLLOW_UP,
        EventType.PAYMENT_MILESTONE,
      ],
      inventory: [
        EventType.STOCK_DELIVERY,
        EventType.STOCK_REORDER,
        EventType.EQUIPMENT_RETURN,
        EventType.INVENTORY_AUDIT,
      ],
      operations: [
        EventType.DRILLING,
        EventType.SURVEY,
        EventType.INSTALLATION,
        EventType.MAINTENANCE,
      ],
    };

    // Admins and project managers can create any event
    if (user.role === UserRole.ADMIN || user.role === UserRole.PROJECT_MANAGER) {
      return;
    }

    // Check specific permissions based on available roles
    // Finance and inventory permissions will be handled by PROJECT_MANAGER for now
  }

  private canEditEvent(event: CalendarEvent, user: User): boolean {
    // Admins and project managers can edit any event
    if (user.role === UserRole.ADMIN || user.role === UserRole.PROJECT_MANAGER) {
      return true;
    }

    // Creator can edit their own events
    if (event.createdById === user.id) {
      return true;
    }

    // Attendees can edit if given permission
    if (event.attendees?.some(a => a.id === user.id)) {
      return true;
    }

    return false;
  }

  private getDefaultColor(eventType: EventType): string {
    const colors = {
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

  private getDefaultVisibility(
    eventType: EventType,
    userRole: UserRole,
  ): EventVisibility {
    if (userRole === UserRole.ADMIN || userRole === UserRole.PROJECT_MANAGER) {
      return EventVisibility.PUBLIC;
    }

    const financeTypes = [
      EventType.PAYMENT_DUE,
      EventType.INVOICE_FOLLOW_UP,
      EventType.PAYMENT_MILESTONE,
    ];

    if (financeTypes.includes(eventType)) {
      return EventVisibility.ROLE_BASED;
    }

    return EventVisibility.ROLE_BASED;
  }

  private getDefaultSyncPreferences(role: UserRole): any {
    switch (role) {
      case UserRole.DRILLER:
      case UserRole.SURVEYOR:
        return {
          assignedJobs: true,
          teamSchedules: true,
          equipmentPickups: true,
        };

      case UserRole.PROJECT_MANAGER:
        // Project managers see everything for now
        return {
          allOperations: true,
          financialMilestones: true,
          teamAvailability: true,
          strategicMeetings: true,
          paymentDues: true,
          invoiceFollowUps: true,
          stockDeliveries: true,
        };

      case UserRole.ADMIN:
        return {
          allOperations: true,
          financialMilestones: true,
          teamAvailability: true,
          strategicMeetings: true,
        };

      default:
        return {};
    }
  }

  private formatICalDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  private escapeICalText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }

  private mapStatusToICal(status: EventStatus): string {
    const mapping = {
      [EventStatus.TENTATIVE]: 'TENTATIVE',
      [EventStatus.CONFIRMED]: 'CONFIRMED',
      [EventStatus.CANCELLED]: 'CANCELLED',
      [EventStatus.COMPLETED]: 'CONFIRMED',
      [EventStatus.IN_PROGRESS]: 'CONFIRMED',
    };
    return mapping[status] || 'TENTATIVE';
  }

  // External sync methods (to be implemented)
  private async syncEventToExternal(event: CalendarEvent, user: User): Promise<void> {
    const settings = await this.getSyncSettings(user.id);
    if (!settings.syncEnabled) return;

    // TODO: Implement sync to Google/Apple/Outlook
  }

  private async removeEventFromExternal(event: CalendarEvent, user: User): Promise<void> {
    const settings = await this.getSyncSettings(user.id);
    if (!settings.syncEnabled) return;

    // TODO: Implement removal from external calendars
  }

  private async syncWithGoogle(settings: CalendarSyncSettings): Promise<void> {
    // TODO: Implement Google Calendar sync
  }

  private async syncWithCalDAV(settings: CalendarSyncSettings): Promise<void> {
    // TODO: Implement CalDAV sync
  }

  private async syncWithOutlook(settings: CalendarSyncSettings): Promise<void> {
    // TODO: Implement Outlook sync
  }
}