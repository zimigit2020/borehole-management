import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, IsNull, Not } from 'typeorm';
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryMovement, MovementType } from './entities/inventory-movement.entity';
import { 
  CreatePurchaseOrderDto, 
  UpdatePurchaseOrderDto, 
  ApprovePurchaseOrderDto, 
  RejectPurchaseOrderDto,
  ReceivePurchaseOrderDto 
} from './dto/purchase-order.dto';

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
    @InjectRepository(InventoryItem)
    private inventoryItemRepository: Repository<InventoryItem>,
    @InjectRepository(InventoryMovement)
    private inventoryMovementRepository: Repository<InventoryMovement>,
  ) {}

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    const lastOrder = await this.purchaseOrderRepository
      .createQueryBuilder('po')
      .where('po.orderNumber LIKE :pattern', { pattern: `PO-${year}${month}%` })
      .orderBy('po.orderNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `PO-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  async create(dto: CreatePurchaseOrderDto, user: any): Promise<PurchaseOrder> {
    const orderNumber = await this.generateOrderNumber();

    // Calculate totals
    let subtotal = 0;
    const items = dto.items.map(item => {
      const itemTotal = item.quantity * item.unitPrice;
      const discountAmount = item.discountPercent ? itemTotal * (item.discountPercent / 100) : 0;
      const totalPrice = itemTotal - discountAmount;
      subtotal += totalPrice;

      return {
        ...item,
        discountAmount,
        totalPrice,
        receivedQuantity: 0,
      };
    });

    const taxAmount = dto.taxRate ? subtotal * (dto.taxRate / 100) : 0;
    const totalAmount = subtotal + taxAmount + (dto.shippingCost || 0) - (dto.discountAmount || 0);

    const purchaseOrder = this.purchaseOrderRepository.create({
      ...dto,
      orderNumber,
      status: PurchaseOrderStatus.DRAFT,
      subtotal,
      taxAmount,
      totalAmount,
      createdById: user.id,
      orderDate: new Date(dto.orderDate),
      expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : null,
    });

    const savedOrder = await this.purchaseOrderRepository.save(purchaseOrder);

    // Save items
    for (const item of items) {
      await this.purchaseOrderItemRepository.save({
        ...item,
        purchaseOrderId: savedOrder.id,
      });
    }

    return this.findOne(savedOrder.id);
  }

  async findAll(filters?: {
    status?: PurchaseOrderStatus;
    supplier?: string;
    startDate?: Date;
    endDate?: Date;
    jobId?: string;
  }): Promise<PurchaseOrder[]> {
    const query = this.purchaseOrderRepository
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.items', 'items')
      .leftJoinAndSelect('po.createdBy', 'createdBy')
      .leftJoinAndSelect('po.approvedBy', 'approvedBy');

    if (filters?.status) {
      query.andWhere('po.status = :status', { status: filters.status });
    }

    if (filters?.supplier) {
      query.andWhere('po.supplier ILIKE :supplier', { supplier: `%${filters.supplier}%` });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('po.orderDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters?.jobId) {
      query.andWhere('po.jobId = :jobId', { jobId: filters.jobId });
    }

    return query.orderBy('po.orderDate', 'DESC').getMany();
  }

  async findOne(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['items', 'createdBy', 'approvedBy', 'rejectedBy', 'receivedBy'],
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    return purchaseOrder;
  }

  async update(id: string, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if (purchaseOrder.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Can only edit draft purchase orders');
    }

    // Update items if provided
    if (dto.items) {
      // Delete existing items
      await this.purchaseOrderItemRepository.delete({ purchaseOrderId: id });

      // Calculate new totals
      let subtotal = 0;
      for (const item of dto.items) {
        const itemTotal = item.quantity * item.unitPrice;
        const discountAmount = item.discountPercent ? itemTotal * (item.discountPercent / 100) : 0;
        const totalPrice = itemTotal - discountAmount;
        subtotal += totalPrice;

        await this.purchaseOrderItemRepository.save({
          ...item,
          purchaseOrderId: id,
          discountAmount,
          totalPrice,
          receivedQuantity: 0,
        });
      }

      const taxAmount = dto.taxRate !== undefined ? subtotal * (dto.taxRate / 100) : purchaseOrder.taxAmount;
      const totalAmount = subtotal + taxAmount + (dto.shippingCost || purchaseOrder.shippingCost) - (dto.discountAmount || purchaseOrder.discountAmount);

      await this.purchaseOrderRepository.update(id, {
        ...dto,
        subtotal,
        taxAmount,
        totalAmount,
        expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : purchaseOrder.expectedDeliveryDate,
      });
    } else {
      // Update without changing items
      await this.purchaseOrderRepository.update(id, {
        ...dto,
        expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : purchaseOrder.expectedDeliveryDate,
      });
    }

    return this.findOne(id);
  }

  async submitForApproval(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if (purchaseOrder.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Can only submit draft purchase orders for approval');
    }

    await this.purchaseOrderRepository.update(id, {
      status: PurchaseOrderStatus.PENDING_APPROVAL,
    });

    return this.findOne(id);
  }

  async approve(id: string, dto: ApprovePurchaseOrderDto, user: any): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if (purchaseOrder.status !== PurchaseOrderStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Can only approve purchase orders pending approval');
    }

    await this.purchaseOrderRepository.update(id, {
      status: PurchaseOrderStatus.APPROVED,
      approvedById: user.id,
      approvedAt: new Date(),
      approvalNotes: dto.approvalNotes,
    });

    return this.findOne(id);
  }

  async reject(id: string, dto: RejectPurchaseOrderDto, user: any): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if (purchaseOrder.status !== PurchaseOrderStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Can only reject purchase orders pending approval');
    }

    await this.purchaseOrderRepository.update(id, {
      status: PurchaseOrderStatus.REJECTED,
      rejectedById: user.id,
      rejectedAt: new Date(),
      rejectionReason: dto.reason,
    });

    return this.findOne(id);
  }

  async send(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if (purchaseOrder.status !== PurchaseOrderStatus.APPROVED) {
      throw new BadRequestException('Can only send approved purchase orders');
    }

    await this.purchaseOrderRepository.update(id, {
      status: PurchaseOrderStatus.SENT,
      sentAt: new Date(),
    });

    // TODO: Send email to supplier

    return this.findOne(id);
  }

  async receive(id: string, dto: ReceivePurchaseOrderDto, user: any): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if (![PurchaseOrderStatus.SENT, PurchaseOrderStatus.PARTIALLY_RECEIVED].includes(purchaseOrder.status)) {
      throw new BadRequestException('Can only receive items for sent purchase orders');
    }

    // Update received quantities for items
    let allItemsReceived = true;
    let someItemsReceived = false;

    for (const receivedItem of dto.items) {
      const item = purchaseOrder.items.find(i => i.id === receivedItem.itemId);
      if (!item) {
        throw new NotFoundException(`Purchase order item ${receivedItem.itemId} not found`);
      }

      const newReceivedQuantity = item.receivedQuantity + receivedItem.receivedQuantity;
      if (newReceivedQuantity > item.quantity) {
        throw new BadRequestException(`Cannot receive more than ordered quantity for item ${item.description}`);
      }

      await this.purchaseOrderItemRepository.update(receivedItem.itemId, {
        receivedQuantity: newReceivedQuantity,
        receivedDate: new Date(),
        receivedBy: user.id,
        notes: receivedItem.notes,
      });

      if (newReceivedQuantity < item.quantity) {
        allItemsReceived = false;
      }
      if (newReceivedQuantity > 0) {
        someItemsReceived = true;
      }

      // Create inventory movements if requested
      if (dto.createInventoryMovements && item.inventoryItemId) {
        const inventoryItem = await this.inventoryItemRepository.findOne({
          where: { id: item.inventoryItemId },
        });

        if (inventoryItem) {
          const previousStock = inventoryItem.quantityInStock;
          const newStock = previousStock + receivedItem.receivedQuantity;

          // Update inventory item
          await this.inventoryItemRepository.update(item.inventoryItemId, {
            quantityInStock: newStock,
            availableQuantity: newStock - inventoryItem.reservedQuantity,
            lastRestockDate: new Date(),
          });

          // Create movement record
          await this.inventoryMovementRepository.save({
            itemId: item.inventoryItemId,
            type: MovementType.PURCHASE_ORDER,
            quantity: receivedItem.receivedQuantity,
            unitCost: item.unitPrice,
            totalCost: receivedItem.receivedQuantity * item.unitPrice,
            userId: user.id,
            reference: purchaseOrder.orderNumber,
            supplier: purchaseOrder.supplier,
            reason: `Received from PO ${purchaseOrder.orderNumber}`,
            notes: receivedItem.notes,
            previousStock,
            newStock,
          });
        }
      }
    }

    // Update purchase order status
    let newStatus = purchaseOrder.status;
    if (allItemsReceived) {
      newStatus = PurchaseOrderStatus.RECEIVED;
    } else if (someItemsReceived) {
      newStatus = PurchaseOrderStatus.PARTIALLY_RECEIVED;
    }

    await this.purchaseOrderRepository.update(id, {
      status: newStatus,
      receivedById: user.id,
      receivedAt: new Date(),
      actualDeliveryDate: allItemsReceived ? new Date() : null,
      receivingNotes: dto.receivingNotes,
      invoiceNumber: dto.invoiceNumber,
      invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : null,
      invoiceAmount: dto.invoiceAmount,
    });

    return this.findOne(id);
  }

  async cancel(id: string, reason: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if (purchaseOrder.status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestException('Purchase order is already cancelled');
    }

    if ([PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.CLOSED].includes(purchaseOrder.status)) {
      throw new BadRequestException('Cannot cancel received or closed purchase orders');
    }

    await this.purchaseOrderRepository.update(id, {
      status: PurchaseOrderStatus.CANCELLED,
      notes: `${purchaseOrder.notes || ''}\nCancellation reason: ${reason}`,
    });

    return this.findOne(id);
  }

  async close(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if (purchaseOrder.status !== PurchaseOrderStatus.RECEIVED) {
      throw new BadRequestException('Can only close fully received purchase orders');
    }

    await this.purchaseOrderRepository.update(id, {
      status: PurchaseOrderStatus.CLOSED,
    });

    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const purchaseOrder = await this.findOne(id);

    if (purchaseOrder.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft purchase orders');
    }

    await this.purchaseOrderRepository.delete(id);
  }

  async getPurchaseOrderSummary(startDate: Date, endDate: Date): Promise<any> {
    const purchaseOrders = await this.purchaseOrderRepository.find({
      where: {
        orderDate: Between(startDate, endDate),
      },
    });

    const summary = {
      totalOrders: purchaseOrders.length,
      totalValue: purchaseOrders.reduce((sum, po) => sum + Number(po.totalAmount), 0),
      byStatus: {},
      bySupplier: {},
      averageOrderValue: 0,
      pendingApproval: 0,
      pendingDelivery: 0,
    };

    for (const po of purchaseOrders) {
      // By status
      if (!summary.byStatus[po.status]) {
        summary.byStatus[po.status] = { count: 0, value: 0 };
      }
      summary.byStatus[po.status].count++;
      summary.byStatus[po.status].value += Number(po.totalAmount);

      // By supplier
      if (!summary.bySupplier[po.supplier]) {
        summary.bySupplier[po.supplier] = { count: 0, value: 0 };
      }
      summary.bySupplier[po.supplier].count++;
      summary.bySupplier[po.supplier].value += Number(po.totalAmount);

      // Pending counts
      if (po.status === PurchaseOrderStatus.PENDING_APPROVAL) {
        summary.pendingApproval++;
      }
      if ([PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.SENT, PurchaseOrderStatus.PARTIALLY_RECEIVED].includes(po.status)) {
        summary.pendingDelivery++;
      }
    }

    summary.averageOrderValue = summary.totalOrders > 0 ? summary.totalValue / summary.totalOrders : 0;

    return summary;
  }

  async getSupplierPerformance(supplierId: string): Promise<any> {
    const purchaseOrders = await this.purchaseOrderRepository.find({
      where: { supplier: supplierId },
      relations: ['items'],
    });

    const performance = {
      totalOrders: purchaseOrders.length,
      totalSpent: 0,
      averageDeliveryTime: 0,
      onTimeDeliveryRate: 0,
      rejectionRate: 0,
      orderHistory: [],
    };

    let deliveryTimes = [];
    let onTimeDeliveries = 0;
    let rejectedOrders = 0;

    for (const po of purchaseOrders) {
      performance.totalSpent += Number(po.totalAmount);

      if (po.status === PurchaseOrderStatus.REJECTED) {
        rejectedOrders++;
      }

      if (po.actualDeliveryDate && po.orderDate) {
        const deliveryTime = Math.floor((po.actualDeliveryDate.getTime() - po.orderDate.getTime()) / (1000 * 60 * 60 * 24));
        deliveryTimes.push(deliveryTime);

        if (po.expectedDeliveryDate && po.actualDeliveryDate <= po.expectedDeliveryDate) {
          onTimeDeliveries++;
        }
      }

      performance.orderHistory.push({
        orderNumber: po.orderNumber,
        date: po.orderDate,
        amount: po.totalAmount,
        status: po.status,
        deliveryTime: po.actualDeliveryDate ? Math.floor((po.actualDeliveryDate.getTime() - po.orderDate.getTime()) / (1000 * 60 * 60 * 24)) : null,
      });
    }

    if (deliveryTimes.length > 0) {
      performance.averageDeliveryTime = deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length;
      performance.onTimeDeliveryRate = (onTimeDeliveries / deliveryTimes.length) * 100;
    }

    performance.rejectionRate = performance.totalOrders > 0 ? (rejectedOrders / performance.totalOrders) * 100 : 0;

    return performance;
  }
}