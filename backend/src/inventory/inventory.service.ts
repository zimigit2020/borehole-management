import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryMovement, MovementType } from './entities/inventory-movement.entity';
import { CreateInventoryItemDto, UpdateInventoryItemDto } from './dto/create-inventory-item.dto';
import { CreateMovementDto, StockInDto, StockOutDto, ReserveStockDto, AdjustStockDto } from './dto/create-movement.dto';
import { User } from '../users/user.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private itemsRepository: Repository<InventoryItem>,
    @InjectRepository(InventoryMovement)
    private movementsRepository: Repository<InventoryMovement>,
  ) {}

  // Item Management
  async createItem(dto: CreateInventoryItemDto): Promise<InventoryItem> {
    // Check if SKU already exists
    const existing = await this.itemsRepository.findOne({ where: { sku: dto.sku } });
    if (existing) {
      throw new BadRequestException('SKU already exists');
    }

    const item = this.itemsRepository.create({
      ...dto,
      availableQuantity: dto.quantityInStock,
      totalValue: dto.quantityInStock * dto.unitCost,
    });

    return this.itemsRepository.save(item);
  }

  async findAllItems(filters?: {
    category?: string;
    lowStock?: boolean;
    search?: string;
  }): Promise<InventoryItem[]> {
    const query = this.itemsRepository.createQueryBuilder('item');

    if (filters?.category) {
      query.andWhere('item.category = :category', { category: filters.category });
    }

    if (filters?.lowStock) {
      query.andWhere('item.quantityInStock <= item.minimumStock');
    }

    if (filters?.search) {
      query.andWhere(
        '(item.name ILIKE :search OR item.sku ILIKE :search OR item.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return query.orderBy('item.name', 'ASC').getMany();
  }

  async findOneItem(id: string): Promise<InventoryItem> {
    const item = await this.itemsRepository.findOne({
      where: { id },
      relations: ['movements'],
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    return item;
  }

  async updateItem(id: string, dto: UpdateInventoryItemDto): Promise<InventoryItem> {
    const item = await this.findOneItem(id);

    // Check if SKU is being changed and if it already exists
    if (dto.sku && dto.sku !== item.sku) {
      const existing = await this.itemsRepository.findOne({ where: { sku: dto.sku } });
      if (existing) {
        throw new BadRequestException('SKU already exists');
      }
    }

    Object.assign(item, dto);
    
    // Recalculate values
    item.availableQuantity = item.quantityInStock - item.reservedQuantity;
    item.totalValue = item.quantityInStock * item.unitCost;

    return this.itemsRepository.save(item);
  }

  async deleteItem(id: string): Promise<void> {
    const item = await this.findOneItem(id);
    
    if (item.quantityInStock > 0) {
      throw new BadRequestException('Cannot delete item with stock. Please adjust stock to zero first.');
    }

    await this.itemsRepository.delete(id);
  }

  // Stock Movements
  async stockIn(dto: StockInDto, user: User): Promise<InventoryMovement> {
    const item = await this.findOneItem(dto.itemId);
    
    const previousStock = item.quantityInStock;
    const newStock = previousStock + dto.quantity;

    // Update item
    item.quantityInStock = newStock;
    item.availableQuantity = newStock - item.reservedQuantity;
    item.unitCost = dto.unitCost;
    item.totalValue = newStock * dto.unitCost;
    item.lastRestockDate = new Date();
    
    await this.itemsRepository.save(item);

    // Create movement record
    const movement = this.movementsRepository.create({
      itemId: dto.itemId,
      type: MovementType.STOCK_IN,
      quantity: dto.quantity,
      unitCost: dto.unitCost,
      totalCost: dto.quantity * dto.unitCost,
      userId: user.id,
      supplier: dto.supplier,
      reference: dto.reference,
      notes: dto.notes,
      previousStock,
      newStock,
    });

    return this.movementsRepository.save(movement);
  }

  async stockOut(dto: StockOutDto, user: User): Promise<InventoryMovement> {
    const item = await this.findOneItem(dto.itemId);
    
    if (item.availableQuantity < dto.quantity) {
      throw new BadRequestException(`Insufficient stock. Available: ${item.availableQuantity}`);
    }

    const previousStock = item.quantityInStock;
    const newStock = previousStock - dto.quantity;

    // Update item
    item.quantityInStock = newStock;
    item.availableQuantity = newStock - item.reservedQuantity;
    item.totalValue = newStock * item.unitCost;
    
    await this.itemsRepository.save(item);

    // Create movement record
    const movement = this.movementsRepository.create({
      itemId: dto.itemId,
      type: MovementType.STOCK_OUT,
      quantity: dto.quantity,
      unitCost: item.unitCost,
      totalCost: dto.quantity * item.unitCost,
      userId: user.id,
      jobId: dto.jobId,
      reason: dto.reason,
      notes: dto.notes,
      previousStock,
      newStock,
    });

    return this.movementsRepository.save(movement);
  }

  async reserveStock(dto: ReserveStockDto, user: User): Promise<InventoryMovement> {
    const item = await this.findOneItem(dto.itemId);
    
    if (item.availableQuantity < dto.quantity) {
      throw new BadRequestException(`Insufficient stock to reserve. Available: ${item.availableQuantity}`);
    }

    // Update item
    item.reservedQuantity += dto.quantity;
    item.availableQuantity = item.quantityInStock - item.reservedQuantity;
    
    await this.itemsRepository.save(item);

    // Create movement record
    const movement = this.movementsRepository.create({
      itemId: dto.itemId,
      type: MovementType.RESERVED,
      quantity: dto.quantity,
      userId: user.id,
      jobId: dto.jobId,
      notes: dto.notes,
    });

    return this.movementsRepository.save(movement);
  }

  async releaseReservation(itemId: string, quantity: number, jobId: string, user: User): Promise<InventoryMovement> {
    const item = await this.findOneItem(itemId);
    
    if (item.reservedQuantity < quantity) {
      throw new BadRequestException('Cannot release more than reserved quantity');
    }

    // Update item
    item.reservedQuantity -= quantity;
    item.availableQuantity = item.quantityInStock - item.reservedQuantity;
    
    await this.itemsRepository.save(item);

    // Create movement record
    const movement = this.movementsRepository.create({
      itemId,
      type: MovementType.RELEASED,
      quantity,
      userId: user.id,
      jobId,
    });

    return this.movementsRepository.save(movement);
  }

  async adjustStock(dto: AdjustStockDto, user: User): Promise<InventoryMovement> {
    const item = await this.findOneItem(dto.itemId);
    
    const previousStock = item.quantityInStock;
    const difference = dto.newQuantity - previousStock;

    // Update item
    item.quantityInStock = dto.newQuantity;
    item.availableQuantity = dto.newQuantity - item.reservedQuantity;
    item.totalValue = dto.newQuantity * item.unitCost;
    
    await this.itemsRepository.save(item);

    // Create movement record
    const movement = this.movementsRepository.create({
      itemId: dto.itemId,
      type: MovementType.ADJUSTMENT,
      quantity: Math.abs(difference),
      userId: user.id,
      reason: dto.reason,
      notes: dto.notes,
      previousStock,
      newStock: dto.newQuantity,
    });

    return this.movementsRepository.save(movement);
  }

  // Movement History
  async getMovements(filters?: {
    itemId?: string;
    jobId?: string;
    type?: MovementType;
    startDate?: Date;
    endDate?: Date;
  }): Promise<InventoryMovement[]> {
    const query = this.movementsRepository.createQueryBuilder('movement')
      .leftJoinAndSelect('movement.item', 'item')
      .leftJoinAndSelect('movement.user', 'user')
      .leftJoinAndSelect('movement.job', 'job');

    if (filters?.itemId) {
      query.andWhere('movement.itemId = :itemId', { itemId: filters.itemId });
    }

    if (filters?.jobId) {
      query.andWhere('movement.jobId = :jobId', { jobId: filters.jobId });
    }

    if (filters?.type) {
      query.andWhere('movement.type = :type', { type: filters.type });
    }

    if (filters?.startDate) {
      query.andWhere('movement.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('movement.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return query.orderBy('movement.createdAt', 'DESC').getMany();
  }

  // Reports
  async getLowStockItems(): Promise<InventoryItem[]> {
    return this.itemsRepository
      .createQueryBuilder('item')
      .where('item.quantityInStock <= item.minimumStock')
      .andWhere('item.isActive = :isActive', { isActive: true })
      .orderBy('item.quantityInStock / item.minimumStock', 'ASC')
      .getMany();
  }

  async getInventoryValue(): Promise<{
    totalItems: number;
    totalValue: number;
    byCategory: Record<string, number>;
  }> {
    const items = await this.itemsRepository.find({ where: { isActive: true } });
    
    const totalValue = items.reduce((sum, item) => sum + Number(item.totalValue), 0);
    
    const byCategory = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + Number(item.totalValue);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalItems: items.length,
      totalValue,
      byCategory,
    };
  }

  async getJobInventoryUsage(jobId: string): Promise<{
    items: any[];
    totalCost: number;
  }> {
    const movements = await this.movementsRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.item', 'item')
      .where('movement.jobId = :jobId', { jobId })
      .andWhere('movement.type IN (:...types)', { 
        types: [MovementType.STOCK_OUT, MovementType.RESERVED] 
      })
      .getMany();

    const items = movements.map(m => ({
      itemName: m.item.name,
      sku: m.item.sku,
      quantity: m.quantity,
      unit: m.item.unit,
      unitCost: m.unitCost || m.item.unitCost,
      totalCost: m.totalCost || (m.quantity * (m.unitCost || m.item.unitCost)),
      type: m.type,
      date: m.createdAt,
    }));

    const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);

    return { items, totalCost };
  }
}