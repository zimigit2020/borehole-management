import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { InventoryMovement } from './inventory-movement.entity';

export enum ItemCategory {
  DRILLING_EQUIPMENT = 'drilling_equipment',
  PIPES_CASINGS = 'pipes_casings',
  PUMPS = 'pumps',
  ELECTRICAL = 'electrical',
  CONSUMABLES = 'consumables',
  SAFETY_EQUIPMENT = 'safety_equipment',
  TOOLS = 'tools',
  SPARE_PARTS = 'spare_parts',
}

export enum ItemUnit {
  PIECE = 'piece',
  METER = 'meter',
  KILOGRAM = 'kg',
  LITER = 'liter',
  BOX = 'box',
  PACK = 'pack',
  SET = 'set',
}

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sku: string; // Stock Keeping Unit

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ItemCategory })
  category: ItemCategory;

  @Column({ type: 'enum', enum: ItemUnit, default: ItemUnit.PIECE })
  unit: ItemUnit;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  quantityInStock: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  reservedQuantity: number; // Reserved for jobs

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  availableQuantity: number; // quantityInStock - reservedQuantity

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  minimumStock: number; // For reorder alerts

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  reorderPoint: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  reorderQuantity: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  unitCost: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalValue: number; // quantityInStock * unitCost

  @Column({ nullable: true })
  supplier: string;

  @Column({ nullable: true })
  supplierContact: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  serialNumber: string;

  @Column({ nullable: true })
  location: string; // Warehouse location

  @Column({ nullable: true })
  shelfNumber: string;

  @Column({ nullable: true })
  lastRestockDate: Date;

  @Column({ nullable: true })
  expiryDate: Date; // For consumables

  @Column({ default: true })
  isActive: boolean;

  @Column('simple-array', { nullable: true })
  images: string[]; // URLs to item images

  @Column('json', { nullable: true })
  specifications: Record<string, any>; // Additional specs

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => InventoryMovement, movement => movement.item)
  movements: InventoryMovement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}