import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InventoryItem } from './inventory-item.entity';
import { User } from '../../users/user.entity';
import { Job } from '../../jobs/job.entity';

export enum MovementType {
  STOCK_IN = 'stock_in',        // Adding stock
  STOCK_OUT = 'stock_out',      // Using stock
  TRANSFER = 'transfer',        // Moving between locations
  ADJUSTMENT = 'adjustment',    // Inventory count adjustment
  RESERVED = 'reserved',        // Reserved for job
  RELEASED = 'released',        // Released from reservation
  DAMAGED = 'damaged',          // Damaged/lost items
  RETURNED = 'returned',        // Returned from job
}

@Entity('inventory_movements')
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InventoryItem, item => item.movements)
  @JoinColumn({ name: 'itemId' })
  item: InventoryItem;

  @Column()
  itemId: string;

  @Column({ type: 'enum', enum: MovementType })
  type: MovementType;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  unitCost: number; // Cost at time of movement

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  totalCost: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User; // Who performed the movement

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => Job, { nullable: true })
  @JoinColumn({ name: 'jobId' })
  job: Job; // Associated job if applicable

  @Column({ nullable: true })
  jobId: string;

  @Column({ nullable: true })
  fromLocation: string;

  @Column({ nullable: true })
  toLocation: string;

  @Column({ nullable: true })
  reference: string; // PO number, invoice, etc.

  @Column({ nullable: true })
  supplier: string; // For stock_in

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  notes: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  previousStock: number; // Stock level before movement

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  newStock: number; // Stock level after movement

  @Column({ default: false })
  isReversed: boolean; // If this movement was reversed

  @Column({ nullable: true })
  reversedBy: string; // User who reversed

  @Column({ nullable: true })
  reversedAt: Date;

  @Column({ nullable: true })
  reversalReason: string;

  @CreateDateColumn()
  createdAt: Date;
}