import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { PurchaseOrderService } from './purchase-order.service';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { PurchaseOrder, PurchaseOrderItem } from './entities/purchase-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryItem, 
      InventoryMovement,
      PurchaseOrder,
      PurchaseOrderItem,
    ]),
  ],
  controllers: [InventoryController, PurchaseOrderController],
  providers: [InventoryService, PurchaseOrderService],
  exports: [InventoryService, PurchaseOrderService],
})
export class InventoryModule {}