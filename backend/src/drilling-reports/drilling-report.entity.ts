import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Job } from '../jobs/job.entity';
import { User } from '../users/user.entity';

export enum DrillingMethod {
  ROTARY = 'rotary',
  PERCUSSION = 'percussion',
  AUGER = 'auger',
  CABLE_TOOL = 'cable_tool',
  MUD_ROTARY = 'mud_rotary',
  AIR_ROTARY = 'air_rotary',
}

export enum WaterQuality {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  UNUSABLE = 'unusable',
}

@Entity('drilling_reports')
export class DrillingReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job, { nullable: false })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column()
  jobId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'drillerId' })
  driller: User;

  @Column()
  drillerId: string;

  // Drilling Details
  @Column({ type: 'date' })
  drillingStartDate: Date;

  @Column({ type: 'date' })
  drillingEndDate: Date;

  @Column({ type: 'enum', enum: DrillingMethod })
  drillingMethod: DrillingMethod;

  @Column('decimal', { precision: 10, scale: 2 })
  totalDepth: number;

  @Column('decimal', { precision: 10, scale: 2 })
  waterStruckDepth: number;

  @Column('decimal', { precision: 10, scale: 2 })
  staticWaterLevel: number;

  @Column('decimal', { precision: 10, scale: 2 })
  yieldRate: number; // liters per hour

  @Column({ type: 'enum', enum: WaterQuality })
  waterQuality: WaterQuality;

  // Casing Details
  @Column('decimal', { precision: 10, scale: 2 })
  casingDepth: number;

  @Column()
  casingDiameter: string; // e.g., "6 inch", "8 inch"

  @Column()
  casingMaterial: string; // e.g., "PVC", "Steel"

  // Geological Information
  @Column('json', { nullable: true })
  geologicalFormations: {
    depth: number;
    description: string;
    soilType: string;
  }[];

  // Equipment Used
  @Column()
  rigType: string;

  @Column()
  compressorCapacity: string;

  @Column({ nullable: true })
  mudPumpCapacity: string;

  // Test Results
  @Column('decimal', { precision: 10, scale: 2 })
  pumpingTestDuration: number; // hours

  @Column('decimal', { precision: 10, scale: 2 })
  pumpingTestYield: number; // liters per hour

  @Column('decimal', { precision: 10, scale: 2 })
  recoveryTime: number; // minutes

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  drawdown: number; // meters

  // Water Analysis
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  ph: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  tds: number; // Total Dissolved Solids in mg/L

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  turbidity: number; // NTU

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  temperature: number; // Celsius

  @Column({ nullable: true })
  bacteriologicalStatus: string; // e.g., "Safe", "Contaminated"

  // Issues and Recommendations
  @Column('text', { nullable: true })
  challengesEncountered: string;

  @Column('text', { nullable: true })
  recommendations: string;

  @Column({ default: false })
  isDryHole: boolean;

  @Column({ nullable: true })
  dryHoleReason: string;

  // Installation Details
  @Column({ default: false })
  pumpInstalled: boolean;

  @Column({ nullable: true })
  pumpType: string;

  @Column({ nullable: true })
  pumpBrand: string;

  @Column({ nullable: true })
  pumpCapacity: string;

  // Documentation
  @Column('simple-array', { nullable: true })
  photos: string[]; // URLs to uploaded photos

  @Column('simple-array', { nullable: true })
  documents: string[]; // URLs to uploaded documents

  // GPS Coordinates (actual drilled location)
  @Column('decimal', { precision: 10, scale: 8 })
  actualLatitude: number;

  @Column('decimal', { precision: 11, scale: 8 })
  actualLongitude: number;

  // Status and Verification
  @Column({ default: 'draft' })
  status: 'draft' | 'submitted' | 'approved' | 'rejected';

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy: User;

  @Column({ nullable: true })
  approvedById: string;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column('text', { nullable: true })
  approvalNotes: string;

  // Additional Notes
  @Column('text', { nullable: true })
  additionalNotes: string;

  // Client Sign-off
  @Column({ nullable: true })
  clientRepresentativeName: string;

  @Column({ nullable: true })
  clientSignature: string; // Base64 or URL to signature image

  @Column({ nullable: true })
  clientSignedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}