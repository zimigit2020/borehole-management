import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Job } from '../../jobs/job.entity';
import { User } from '../../users/user.entity';

export enum InstallationType {
  PUMP = 'pump',
  ELECTRICAL = 'electrical',
  PLUMBING = 'plumbing',
  TANK = 'tank',
  COMPLETE_SYSTEM = 'complete_system',
}

export enum PumpType {
  SUBMERSIBLE = 'submersible',
  SURFACE = 'surface',
  JET = 'jet',
  HAND_PUMP = 'hand_pump',
  SOLAR = 'solar',
}

export enum InstallationStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ON_HOLD = 'on_hold',
}

@Entity('installations')
export class Installation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column()
  jobId: string;

  @Column({ type: 'enum', enum: InstallationType })
  type: InstallationType;

  @Column({ type: 'enum', enum: InstallationStatus, default: InstallationStatus.SCHEDULED })
  status: InstallationStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'technicianId' })
  technician: User;

  @Column({ nullable: true })
  technicianId: string;

  @Column({ nullable: true })
  scheduledDate: Date;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  // Pump Details
  @Column({ type: 'enum', enum: PumpType, nullable: true })
  pumpType: PumpType;

  @Column({ nullable: true })
  pumpBrand: string;

  @Column({ nullable: true })
  pumpModel: string;

  @Column({ nullable: true })
  pumpSerialNumber: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pumpCapacity: number; // liters per hour

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pumpPower: number; // horsepower or watts

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pumpHead: number; // meters

  @Column({ nullable: true })
  pumpWarrantyPeriod: string;

  // Electrical Details
  @Column({ nullable: true })
  controlPanelType: string;

  @Column({ nullable: true })
  cableType: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  cableLength: number; // meters

  @Column({ nullable: true })
  starterType: string;

  @Column({ nullable: true })
  protectionDevices: string;

  // Plumbing Details
  @Column({ nullable: true })
  pipeType: string;

  @Column({ nullable: true })
  pipeDiameter: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pipeLength: number; // meters

  @Column({ nullable: true })
  fittingsUsed: string;

  // Tank Details
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  tankCapacity: number; // liters

  @Column({ nullable: true })
  tankMaterial: string;

  @Column({ nullable: true })
  tankLocation: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  tankElevation: number; // meters above ground

  // Test Results
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  flowRate: number; // liters per minute

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pressure: number; // bar or psi

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  powerConsumption: number; // watts

  @Column({ default: false })
  testSuccessful: boolean;

  @Column({ nullable: true })
  testNotes: string;

  // Quality Checks
  @Column({ default: false })
  electricalTestPassed: boolean;

  @Column({ default: false })
  pressureTestPassed: boolean;

  @Column({ default: false })
  leakTestPassed: boolean;

  @Column({ default: false })
  functionalTestPassed: boolean;

  // Documentation
  @Column('simple-array', { nullable: true })
  photos: string[];

  @Column('simple-array', { nullable: true })
  documents: string[];

  @Column({ nullable: true })
  warrantyDocument: string;

  @Column({ nullable: true })
  userManual: string;

  // Client Acceptance
  @Column({ nullable: true })
  clientRepresentativeName: string;

  @Column({ nullable: true })
  clientSignature: string;

  @Column({ nullable: true })
  clientSignedAt: Date;

  @Column({ nullable: true })
  clientFeedback: string;

  @Column({ default: false })
  clientAccepted: boolean;

  // Maintenance
  @Column({ nullable: true })
  nextMaintenanceDate: Date;

  @Column({ nullable: true })
  maintenanceInstructions: string;

  // Additional Info
  @Column({ nullable: true })
  issuesEncountered: string;

  @Column({ nullable: true })
  recommendations: string;

  @Column({ nullable: true })
  notes: string;

  @Column('json', { nullable: true })
  additionalDetails: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}