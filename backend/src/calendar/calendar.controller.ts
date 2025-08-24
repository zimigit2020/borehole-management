import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Response,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CalendarService } from './calendar.service';
import {
  CreateEventDto,
  UpdateEventDto,
  SyncSettingsDto,
  CalendarQueryDto,
  GoogleAuthCallbackDto,
} from './dto/calendar.dto';
import { CalendarEvent, CalendarSyncSettings } from './entities/calendar-event.entity';

@ApiTags('calendar')
@Controller('calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  // Events endpoints
  @Get('events')
  @ApiOperation({ summary: 'Get calendar events for current user' })
  async getEvents(@Request() req, @Query() query: CalendarQueryDto) {
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDate = query.endDate
      ? new Date(query.endDate)
      : new Date(new Date().setMonth(new Date().getMonth() + 3));

    return this.calendarService.getEventsForUser(
      req.user,
      startDate,
      endDate,
      {
        eventType: query.eventType,
        status: query.status,
        jobId: query.jobId,
      },
    );
  }

  @Post('events')
  @ApiOperation({ summary: 'Create a new calendar event' })
  async createEvent(@Body() dto: CreateEventDto, @Request() req) {
    return this.calendarService.createEvent(dto, req.user);
  }

  @Put('events/:id')
  @ApiOperation({ summary: 'Update a calendar event' })
  async updateEvent(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @Request() req,
  ) {
    return this.calendarService.updateEvent(id, dto, req.user);
  }

  @Delete('events/:id')
  @ApiOperation({ summary: 'Delete a calendar event' })
  async deleteEvent(@Param('id') id: string, @Request() req) {
    await this.calendarService.deleteEvent(id, req.user);
    return { message: 'Event deleted successfully' };
  }

  @Get('events/:id/conflicts')
  @ApiOperation({ summary: 'Get conflicts for a specific event' })
  async getEventConflicts(@Param('id') id: string) {
    // TODO: Implement conflict checking for specific event
    return [];
  }

  // Sync settings endpoints
  @Get('sync/settings')
  @ApiOperation({ summary: 'Get calendar sync settings' })
  async getSyncSettings(@Request() req) {
    return this.calendarService.getSyncSettings(req.user.id);
  }

  @Put('sync/settings')
  @ApiOperation({ summary: 'Update calendar sync settings' })
  async updateSyncSettings(@Body() dto: SyncSettingsDto, @Request() req) {
    return this.calendarService.updateSyncSettings(req.user.id, dto);
  }

  // iCal feed endpoint (public with token)
  @Get('feed/:userId/:token.ics')
  @ApiOperation({ summary: 'Get iCal feed for calendar subscription' })
  @Header('Content-Type', 'text/calendar')
  @Header('Content-Disposition', 'inline; filename="calendar.ics"')
  async getICalFeed(
    @Param('userId') userId: string,
    @Param('token') token: string,
    @Response() res,
  ) {
    const icalContent = await this.calendarService.generateICalFeed(userId, token);
    res.send(icalContent);
  }

  // Google Calendar OAuth endpoints
  @Get('sync/google/auth')
  @ApiOperation({ summary: 'Initiate Google Calendar OAuth flow' })
  async initiateGoogleAuth(@Request() req) {
    // TODO: Implement Google OAuth URL generation
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const scope = 'https://www.googleapis.com/auth/calendar';
    const state = req.user.id;

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `access_type=offline&` +
      `state=${state}`;

    return { authUrl };
  }

  @Post('sync/google/callback')
  @ApiOperation({ summary: 'Handle Google Calendar OAuth callback' })
  async handleGoogleCallback(@Body() dto: GoogleAuthCallbackDto, @Request() req) {
    // TODO: Exchange code for tokens and save to sync settings
    return { message: 'Google Calendar connected successfully' };
  }

  @Delete('sync/google')
  @ApiOperation({ summary: 'Disconnect Google Calendar' })
  async disconnectGoogle(@Request() req) {
    // TODO: Remove Google Calendar connection
    return { message: 'Google Calendar disconnected' };
  }

  // CalDAV endpoints for Apple Calendar
  @Get('sync/caldav/instructions')
  @ApiOperation({ summary: 'Get CalDAV setup instructions' })
  async getCalDAVInstructions(@Request() req) {
    const settings = await this.calendarService.getSyncSettings(req.user.id);
    
    return {
      server: `${process.env.API_URL}/caldav`,
      username: req.user.email,
      passwordNote: 'Use your account password or generate app-specific password',
      calendarUrl: `${process.env.API_URL}/caldav/calendars/${req.user.id}/default`,
      webcalUrl: `webcal://${process.env.API_URL.replace('https://', '')}/calendar/feed/${req.user.id}/${settings.caldavToken}.ics`,
      instructions: {
        ios: {
          steps: [
            'Go to Settings > Calendar > Accounts',
            'Tap "Add Account"',
            'Select "Other"',
            'Choose "Add CalDAV Account"',
            'Enter the server details provided',
            'Tap "Next" to verify and save',
          ],
        },
        macos: {
          steps: [
            'Open Calendar app',
            'Go to Calendar > Preferences > Accounts',
            'Click the "+" button',
            'Select "Other CalDAV Account"',
            'Enter the server details provided',
            'Click "Sign In"',
          ],
        },
        subscriptionAlternative: {
          note: 'For read-only access, you can subscribe to the calendar:',
          steps: [
            'Copy the webcal URL provided',
            'On iOS: Open the URL in Safari and confirm subscription',
            'On macOS: Calendar > File > New Calendar Subscription',
          ],
        },
      },
    };
  }

  // Team availability endpoint (for managers)
  @Get('team-availability')
  @Roles('manager', 'admin')
  @ApiOperation({ summary: 'Get team availability overview' })
  async getTeamAvailability(@Query('date') date: string) {
    // TODO: Implement team availability checking
    const checkDate = date ? new Date(date) : new Date();
    
    return {
      date: checkDate,
      teams: [],
      conflicts: [],
    };
  }

  // Bulk operations (for managers)
  @Post('events/bulk')
  @Roles('manager', 'admin')
  @ApiOperation({ summary: 'Create multiple events at once' })
  async createBulkEvents(@Body() events: CreateEventDto[], @Request() req) {
    const createdEvents = [];
    for (const event of events) {
      const created = await this.calendarService.createEvent(event, req.user);
      createdEvents.push(created);
    }
    return createdEvents;
  }

  // Statistics endpoint
  @Get('statistics')
  @ApiOperation({ summary: 'Get calendar statistics' })
  async getStatistics(@Request() req, @Query('period') period: string = 'month') {
    // TODO: Implement calendar statistics
    return {
      period,
      totalEvents: 0,
      eventsByType: {},
      upcomingEvents: 0,
      completedEvents: 0,
      conflictCount: 0,
    };
  }

  // Export endpoint
  @Get('export')
  @ApiOperation({ summary: 'Export calendar data' })
  @Header('Content-Type', 'text/calendar')
  @Header('Content-Disposition', 'attachment; filename="calendar-export.ics"')
  async exportCalendar(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Response() res,
  ) {
    const start = new Date(startDate || new Date().setMonth(new Date().getMonth() - 1));
    const end = new Date(endDate || new Date().setMonth(new Date().getMonth() + 3));
    
    const events = await this.calendarService.getEventsForUser(
      req.user,
      start,
      end,
    );
    
    // Generate iCal content
    let icalContent = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\n';
    // TODO: Add events to iCal format
    icalContent += 'END:VCALENDAR\r\n';
    
    res.send(icalContent);
  }
}