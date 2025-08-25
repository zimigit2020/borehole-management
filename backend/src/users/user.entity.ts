import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  PROJECT_MANAGER = 'project_manager',
  FINANCE_MANAGER = 'finance_manager',
  INVENTORY_MANAGER = 'inventory_manager',
  SURVEYOR = 'surveyor',
  DRILLER = 'driller',
  TECHNICIAN = 'technician',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.SURVEYOR })
  role: UserRole;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  // Computed property for full name
  get name(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLogin: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations will be added later for jobs and surveys
}