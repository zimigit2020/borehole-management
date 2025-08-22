import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';

export enum JobStatus {
  CREATED = 'created',
  ASSIGNED = 'assigned',
  SURVEYED = 'surveyed',
  DRILLING = 'drilling',
  COMPLETED = 'completed',
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  clientName: string;

  @Column()
  siteName: string;

  @Column('decimal', { precision: 10, scale: 8 })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.CREATED })
  status: JobStatus;

  @Column({ nullable: true })
  contactPerson: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Column({ nullable: true })
  accessNotes: string;

  @Column({ nullable: true })
  priority: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  budgetUsd: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedSurveyorId' })
  assignedSurveyor: User;

  @Column({ nullable: true })
  assignedSurveyorId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedDrillerId' })
  assignedDriller: User;

  @Column({ nullable: true })
  assignedDrillerId: string;

  @Column({ nullable: true })
  assignedAt: Date;

  @Column({ nullable: true })
  surveyCompletedAt: Date;

  @Column({ nullable: true })
  drillingStartedAt: Date;

  @Column({ nullable: true })
  drillingCompletedAt: Date;

  @Column('json', { nullable: true })
  drillingResults: {
    finalDepth?: number;
    waterYield?: number;
    isSuccessful?: boolean;
    completedAt?: Date;
    completedBy?: string;
  };

  @Column('json', { nullable: true })
  surveyResults: {
    recommendedDepth?: number;
    soilType?: string;
    waterTableDepth?: number;
    notes?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}