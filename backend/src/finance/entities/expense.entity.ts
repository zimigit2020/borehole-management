import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Job } from '../../jobs/job.entity';

export enum ExpenseCategory {
  FUEL = 'fuel',
  EQUIPMENT = 'equipment',
  MATERIALS = 'materials',
  LABOR = 'labor',
  TRANSPORT = 'transport',
  ACCOMMODATION = 'accommodation',
  MEALS = 'meals',
  UTILITIES = 'utilities',
  RENT = 'rent',
  INSURANCE = 'insurance',
  MAINTENANCE = 'maintenance',
  OFFICE_SUPPLIES = 'office_supplies',
  PROFESSIONAL_FEES = 'professional_fees',
  PERMITS_LICENSES = 'permits_licenses',
  MARKETING = 'marketing',
  OTHER = 'other',
}

export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
  REIMBURSED = 'reimbursed',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CHEQUE = 'cheque',
  MOBILE_MONEY = 'mobile_money',
  PETTY_CASH = 'petty_cash',
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: ExpenseCategory })
  category: ExpenseCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amountInUSD: number; // Converted amount for reporting

  @Column({ type: 'date' })
  expenseDate: Date;

  @Column({ type: 'enum', enum: ExpenseStatus, default: ExpenseStatus.PENDING })
  status: ExpenseStatus;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod?: PaymentMethod;

  @Column({ nullable: true })
  vendor?: string;

  @Column({ nullable: true })
  vendorInvoiceNumber?: string;

  @Column({ nullable: true })
  receiptNumber?: string;

  @Column({ nullable: true })
  receiptUrl?: string; // URL to uploaded receipt

  @ManyToOne(() => Job, { nullable: true })
  @JoinColumn({ name: 'jobId' })
  job?: Job;

  @Column({ nullable: true })
  jobId?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'submittedById' })
  submittedBy: User;

  @Column()
  submittedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy?: User;

  @Column({ nullable: true })
  approvedById?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ nullable: true })
  approvalNotes?: string;

  @Column({ nullable: true })
  notes?: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ default: false })
  isRecurring: boolean;

  @Column({ nullable: true })
  recurringFrequency?: string; // monthly, weekly, etc.

  @Column({ default: false })
  requiresReimbursement: boolean;

  @Column({ type: 'timestamp', nullable: true })
  reimbursedAt?: Date;

  @Column({ nullable: true })
  reimbursementReference?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}