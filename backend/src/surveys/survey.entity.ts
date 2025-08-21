import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';

@Entity('survey_reports')
export class SurveyReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column()
  jobId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'surveyorId' })
  surveyor: User;

  @Column()
  surveyorId: string;

  // GPS Data
  @Column('decimal', { precision: 10, scale: 8 })
  gpsLat: number;

  @Column('decimal', { precision: 11, scale: 8 })
  gpsLng: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  gpsAccuracy: number;

  @Column({ nullable: true })
  gpsCapturedAt: Date;

  // Survey Data
  @Column('decimal', { precision: 6, scale: 2 })
  recommendedMinDepth: number;

  @Column('decimal', { precision: 6, scale: 2 })
  recommendedMaxDepth: number;

  @Column('simple-array')
  expectedBreaks: number[];

  @Column({ nullable: true })
  soilType: string;

  @Column({ type: 'text', nullable: true })
  groundConditions: string;

  @Column({ nullable: true })
  surveyMethod: string;

  // Graph/resistivity file
  @Column({ nullable: true })
  graphFileId: string;

  // Quality assurance
  @Column({ default: false })
  disclaimerAck: boolean;

  @Column({ type: 'text', nullable: true })
  surveyorNotes: string;

  // Offline sync fields
  @Column({ nullable: true })
  deviceId: string;

  @Column({ nullable: true })
  offlineCreatedAt: Date;

  @Column({ default: false })
  synced: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}