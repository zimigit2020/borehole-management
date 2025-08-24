import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsArray,
  IsUUID,
  IsNumber,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EventType, EventStatus, EventVisibility } from '../entities/calendar-event.entity';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: EventType })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiProperty({ enum: EventStatus, required: false })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiProperty({ enum: EventVisibility, required: false })
  @IsOptional()
  @IsEnum(EventVisibility)
  visibility?: EventVisibility;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  recurrenceRule?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  attendeeIds?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  allowedRoles?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  installationId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReminderDto)
  reminders?: ReminderDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateEventDto extends CreateEventDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  externalProvider?: string;
}

export class ReminderDto {
  @ApiProperty({ enum: ['email', 'push', 'sms'] })
  @IsEnum(['email', 'push', 'sms'])
  type: 'email' | 'push' | 'sms';

  @ApiProperty()
  @IsNumber()
  minutesBefore: number;
}

export class SyncSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  syncEnabled?: boolean;

  @ApiProperty({ enum: ['one-way', 'two-way'], required: false })
  @IsOptional()
  @IsEnum(['one-way', 'two-way'])
  syncDirection?: 'one-way' | 'two-way';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  googleCalendar?: {
    refreshToken: string;
    calendarId: string;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  appleCalendar?: {
    caldavUrl: string;
    username: string;
    password: string;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  outlookCalendar?: {
    refreshToken: string;
    calendarId: string;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  syncPreferences?: {
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  syncRules?: {
    advanceNoticeDays?: number;
    includePrivateNotes?: boolean;
    includeGpsLocation?: boolean;
    autoAcceptChanges?: boolean;
    conflictResolution?: 'local' | 'remote' | 'newest' | 'manual';
  };
}

export class GoogleAuthCallbackDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  state: string;
}

export class CalendarQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ enum: EventType, required: false })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @ApiProperty({ enum: EventStatus, required: false })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  includeConflicts?: boolean;
}