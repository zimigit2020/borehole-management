import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PurchaseOrderService } from './purchase-order.service';
import { 
  CreatePurchaseOrderDto, 
  UpdatePurchaseOrderDto, 
  ApprovePurchaseOrderDto, 
  RejectPurchaseOrderDto,
  ReceivePurchaseOrderDto 
} from './dto/purchase-order.dto';
import { PurchaseOrderStatus } from './entities/purchase-order.entity';

@ApiTags('purchase-orders')
@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Post()
  @Roles('admin', 'manager', 'inventory_manager')
  @ApiOperation({ summary: 'Create new purchase order' })
  async create(@Body() dto: CreatePurchaseOrderDto, @Request() req) {
    return this.purchaseOrderService.create(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders' })
  async findAll(
    @Query('status') status?: PurchaseOrderStatus,
    @Query('supplier') supplier?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('jobId') jobId?: string,
  ) {
    return this.purchaseOrderService.findAll({
      status,
      supplier,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      jobId,
    });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get purchase order summary' })
  async getSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.purchaseOrderService.getPurchaseOrderSummary(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('supplier/:supplierId/performance')
  @ApiOperation({ summary: 'Get supplier performance metrics' })
  async getSupplierPerformance(@Param('supplierId') supplierId: string) {
    return this.purchaseOrderService.getSupplierPerformance(supplierId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  async findOne(@Param('id') id: string) {
    return this.purchaseOrderService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'manager', 'inventory_manager')
  @ApiOperation({ summary: 'Update purchase order' })
  async update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.purchaseOrderService.update(id, dto);
  }

  @Post(':id/submit')
  @Roles('admin', 'manager', 'inventory_manager')
  @ApiOperation({ summary: 'Submit purchase order for approval' })
  async submitForApproval(@Param('id') id: string) {
    return this.purchaseOrderService.submitForApproval(id);
  }

  @Post(':id/approve')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Approve purchase order' })
  async approve(@Param('id') id: string, @Body() dto: ApprovePurchaseOrderDto, @Request() req) {
    return this.purchaseOrderService.approve(id, dto, req.user);
  }

  @Post(':id/reject')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Reject purchase order' })
  async reject(@Param('id') id: string, @Body() dto: RejectPurchaseOrderDto, @Request() req) {
    return this.purchaseOrderService.reject(id, dto, req.user);
  }

  @Post(':id/send')
  @Roles('admin', 'manager', 'inventory_manager')
  @ApiOperation({ summary: 'Send purchase order to supplier' })
  async send(@Param('id') id: string) {
    return this.purchaseOrderService.send(id);
  }

  @Post(':id/receive')
  @Roles('admin', 'manager', 'inventory_manager')
  @ApiOperation({ summary: 'Receive items from purchase order' })
  async receive(@Param('id') id: string, @Body() dto: ReceivePurchaseOrderDto, @Request() req) {
    return this.purchaseOrderService.receive(id, dto, req.user);
  }

  @Post(':id/cancel')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cancel purchase order' })
  async cancel(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.purchaseOrderService.cancel(id, body.reason);
  }

  @Post(':id/close')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Close purchase order' })
  async close(@Param('id') id: string) {
    return this.purchaseOrderService.close(id);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Delete purchase order' })
  async delete(@Param('id') id: string) {
    await this.purchaseOrderService.delete(id);
    return { message: 'Purchase order deleted successfully' };
  }
}