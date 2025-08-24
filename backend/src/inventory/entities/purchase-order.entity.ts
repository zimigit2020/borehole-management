import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity';

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SENT = 'sent',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
  CLOSED = 'closed',
}

export enum PurchaseOrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum PaymentTerms {
  NET_30 = 'net_30',
  NET_60 = 'net_60',
  NET_90 = 'net_90',
  DUE_ON_RECEIPT = 'due_on_receipt',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  PREPAID = 'prepaid',
  CUSTOM = 'custom',
}

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @Column({ type: 'enum', enum: PurchaseOrderStatus, default: PurchaseOrderStatus.DRAFT })
  status: PurchaseOrderStatus;

  @Column({ type: 'enum', enum: PurchaseOrderPriority, default: PurchaseOrderPriority.NORMAL })
  priority: PurchaseOrderPriority;

  @Column()
  supplier: string;

  @Column({ nullable: true })
  supplierContact: string;

  @Column({ nullable: true })
  supplierEmail: string;

  @Column({ nullable: true })
  supplierPhone: string;

  @Column({ nullable: true })
  supplierAddress: string;

  @Column({ type: 'timestamp' })
  orderDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualDeliveryDate: Date;

  @Column({ nullable: true })
  deliveryLocation: string;

  @Column({ type: 'enum', enum: PaymentTerms, default: PaymentTerms.NET_30 })
  paymentTerms: PaymentTerms;

  @Column({ nullable: true })
  customPaymentTerms: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  internalNotes: string;

  @Column({ type: 'text', nullable: true })
  termsAndConditions: string;

  @Column({ nullable: true })
  jobId: string;

  @Column({ nullable: true })
  projectCode: string;

  @Column({ nullable: true })
  costCenter: string;

  @Column()
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ nullable: true })
  approvedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approvedById' })
  approvedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  approvalNotes: string;

  @Column({ nullable: true })
  rejectedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'rejectedById' })
  rejectedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ nullable: true })
  receivedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receivedById' })
  receivedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  receivedAt: Date;

  @Column({ type: 'text', nullable: true })
  receivingNotes: string;

  @Column({ nullable: true })
  invoiceNumber: string;

  @Column({ type: 'timestamp', nullable: true })
  invoiceDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  invoiceAmount: number;

  @Column({ nullable: true })
  attachments: string;

  @OneToMany(() => PurchaseOrderItem, item => item.purchaseOrder, { cascade: true })
  items: PurchaseOrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('purchase_order_items')
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  purchaseOrderId: string;

  @ManyToOne(() => PurchaseOrder, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchaseOrderId' })
  purchaseOrder: PurchaseOrder;

  @Column({ nullable: true })
  inventoryItemId: string;

  @Column()
  sku: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  specifications: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ default: 'piece' })
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  receivedQuantity: number;

  @Column({ type: 'timestamp', nullable: true })
  receivedDate: Date;

  @Column({ nullable: true })
  receivedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}