import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Job } from './job.entity';
import { JobsService } from './jobs.service';
import { JobWorkflowService } from './workflow/job-workflow.service';
import { JobCostingService } from './job-costing.service';
import { JobsController } from './jobs.controller';
import { JobCostingController } from './job-costing.controller';
import { UsersModule } from '../users/users.module';
import { Invoice, InvoiceItem, Payment } from '../finance/entities/invoice.entity';
import { Expense } from '../finance/entities/expense.entity';
import { InventoryMovement } from '../inventory/entities/inventory-movement.entity';
import { PurchaseOrder, PurchaseOrderItem } from '../inventory/entities/purchase-order.entity';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Job,
      Invoice,
      InvoiceItem,
      Payment,
      Expense,
      InventoryMovement,
      PurchaseOrder,
      PurchaseOrderItem,
    ]),
    UsersModule,
    MulterModule.register({
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
          cb(null, true);
        } else {
          cb(new Error('Only Excel files are allowed'), false);
        }
      },
    }),
  ],
  controllers: [JobsController, JobCostingController],
  providers: [JobsService, JobWorkflowService, JobCostingService],
  exports: [JobsService, JobWorkflowService, JobCostingService],
})
export class JobsModule {}