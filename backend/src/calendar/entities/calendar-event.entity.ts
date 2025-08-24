import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Job } from '../../jobs/job.entity';
import { Installation } from '../../installations/entities/installation.entity';
import { Invoice } from '../../finance/entities/invoice.entity';

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
  PUBLIC = 'public',        // Everyone can see
  PRIVATE = 'private',      // Only assigned users
  ROLE_BASED = 'role_based', // Based on user role
  MANAGEMENT = 'management',  // Management only
}

@Entity('calendar_events')
@Index(['startDate', 'endDate'])
@Index(['eventType', 'status'])
export class CalendarEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: EventType })
  eventType: EventType;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.CONFIRMED })
  status: EventStatus;

  @Column({ type: 'enum', enum: EventVisibility, default: EventVisibility.ROLE_BASED })
  visibility: EventVisibility;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ default: false })
  allDay: boolean;

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'jsonb', nullable: true })
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };

  // Color coding for calendar display
  @Column({ nullable: true })
  color?: string;

  // Recurrence rule (RFC 5545 format)
  @Column({ nullable: true })
  recurrenceRule?: string;

  @Column({ nullable: true })
  recurrenceId?: string;

  // External calendar sync
  @Column({ nullable: true })
  externalId?: string;  // ID in Google/Apple calendar

  @Column({ nullable: true })
  externalProvider?: string;  // google, apple, outlook

  @Column({ nullable: true })
  externalEtag?: string;  // For sync conflict detection

  @Column({ type: 'timestamp', nullable: true })
  lastSyncedAt?: Date;

  // Reminders
  @Column({ type: 'jsonb', nullable: true })
  reminders?: {
    type: 'email' | 'push' | 'sms';
    minutesBefore: number;
    sent?: boolean;
  }[];

  // Role-based access
  @Column({ type: 'simple-array', nullable: true })
  allowedRoles?: string[];  // Which roles can see this

  @Column({ type: 'simple-array', nullable: true })
  requiredRoles?: string[];  // Which roles must handle this

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'uuid' })
  createdById: string;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'calendar_event_attendees',
    joinColumn: { name: 'eventId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  attendees: User[];

  // Related entities
  @ManyToOne(() => Job, { nullable: true })
  @JoinColumn({ name: 'jobId' })
  job?: Job;

  @Column({ type: 'uuid', nullable: true })
  jobId?: string;

  @ManyToOne(() => Installation, { nullable: true })
  @JoinColumn({ name: 'installationId' })
  installation?: Installation;

  @Column({ type: 'uuid', nullable: true })
  installationId?: string;

  @ManyToOne(() => Invoice, { nullable: true })
  @JoinColumn({ name: 'invoiceId' })
  invoice?: Invoice;

  @Column({ type: 'uuid', nullable: true })
  invoiceId?: string;

  // Metadata for different event types
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    // For drilling/survey/installation
    teamSize?: number;
    equipmentNeeded?: string[];
    estimatedDuration?: number;
    
    // For finance
    amount?: number;
    currency?: string;
    paymentMethod?: string;
    
    // For inventory
    items?: { itemId: string; quantity: number }[];
    supplier?: string;
    orderNumber?: string;
    
    // For meetings
    agenda?: string;
    meetingLink?: string;
    dialInNumber?: string;
    
    // Custom fields
    [key: string]: any;
  };

  // Conflict tracking
  @Column({ type: 'simple-array', nullable: true })
  conflictsWith?: string[];  // IDs of conflicting events

  @Column({ default: false })
  hasConflict: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Soft delete for cancelled events
  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}

@Entity('calendar_sync_settings')
export class CalendarSyncSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @Column({ default: true })
  syncEnabled: boolean;

  @Column({ type: 'enum', enum: ['one-way', 'two-way'], default: 'two-way' })
  syncDirection: 'one-way' | 'two-way';

  // Provider settings
  @Column({ type: 'jsonb', nullable: true })
  googleCalendar?: {
    refreshToken: string;
    calendarId: string;
    syncToken?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  appleCalendar?: {
    caldavUrl: string;
    username: string;
    passwordEncrypted: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  outlookCalendar?: {
    refreshToken: string;
    calendarId: string;
  };

  // What to sync based on role
  @Column({ type: 'jsonb', default: {} })
  syncPreferences: {
    // For specialists
    assignedJobs?: boolean;
    teamSchedules?: boolean;
    equipmentPickups?: boolean;
    
    // For finance
    paymentDues?: boolean;
    invoiceFollowUps?: boolean;
    monthEndTasks?: boolean;
    
    // For inventory
    stockDeliveries?: boolean;
    reorderAlerts?: boolean;
    inventoryAudits?: boolean;
    
    // For management
    allOperations?: boolean;
    financialMilestones?: boolean;
    teamAvailability?: boolean;
    strategicMeetings?: boolean;
  };

  // Sync rules
  @Column({ type: 'jsonb', default: {} })
  syncRules: {
    advanceNoticeDays?: number;
    includePrivateNotes?: boolean;
    includeGpsLocation?: boolean;
    autoAcceptChanges?: boolean;
    conflictResolution?: 'local' | 'remote' | 'newest' | 'manual';
  };

  @Column({ type: 'timestamp', nullable: true })
  lastSyncedAt?: Date;

  @Column({ nullable: true })
  lastSyncError?: string;

  @Column({ nullable: true })
  caldavToken?: string;  // For secure calendar feed URL

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}