import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('exchange_rates')
@Index(['fromCurrency', 'toCurrency'])
export class ExchangeRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 3 })
  fromCurrency: string;

  @Column({ type: 'varchar', length: 3 })
  toCurrency: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  rate: number;

  @Column({ type: 'timestamp' })
  effectiveDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User;

  @Column({ type: 'uuid' })
  updatedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}