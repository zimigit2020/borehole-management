import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto } from './dto/create-inventory-item.dto';
import { StockInDto, StockOutDto, ReserveStockDto, AdjustStockDto } from './dto/create-movement.dto';
import { MovementType } from './entities/inventory-movement.entity';

@ApiTags('inventory')
@Controller('api/v1/inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Item Management
  @Post('items')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create new inventory item' })
  async createItem(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.createItem(dto);
  }

  @Get('items')
  @ApiOperation({ summary: 'Get all inventory items' })
  async findAllItems(
    @Query('category') category?: string,
    @Query('lowStock') lowStock?: boolean,
    @Query('search') search?: string,
  ) {
    return this.inventoryService.findAllItems({ category, lowStock, search });
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  async findOneItem(@Param('id') id: string) {
    return this.inventoryService.findOneItem(id);
  }

  @Put('items/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update inventory item' })
  async updateItem(@Param('id') id: string, @Body() dto: UpdateInventoryItemDto) {
    return this.inventoryService.updateItem(id, dto);
  }

  @Delete('items/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete inventory item' })
  async deleteItem(@Param('id') id: string) {
    await this.inventoryService.deleteItem(id);
    return { message: 'Item deleted successfully' };
  }

  // Stock Movements
  @Post('stock-in')
  @Roles('admin', 'manager', 'technician')
  @ApiOperation({ summary: 'Add stock to inventory' })
  async stockIn(@Body() dto: StockInDto, @Request() req) {
    return this.inventoryService.stockIn(dto, req.user);
  }

  @Post('stock-out')
  @Roles('admin', 'manager', 'technician')
  @ApiOperation({ summary: 'Remove stock from inventory' })
  async stockOut(@Body() dto: StockOutDto, @Request() req) {
    return this.inventoryService.stockOut(dto, req.user);
  }

  @Post('reserve')
  @Roles('admin', 'manager', 'technician')
  @ApiOperation({ summary: 'Reserve stock for a job' })
  async reserveStock(@Body() dto: ReserveStockDto, @Request() req) {
    return this.inventoryService.reserveStock(dto, req.user);
  }

  @Post('release/:itemId')
  @Roles('admin', 'manager', 'technician')
  @ApiOperation({ summary: 'Release reserved stock' })
  async releaseReservation(
    @Param('itemId') itemId: string,
    @Body() body: { quantity: number; jobId: string },
    @Request() req,
  ) {
    return this.inventoryService.releaseReservation(
      itemId,
      body.quantity,
      body.jobId,
      req.user,
    );
  }

  @Post('adjust')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Adjust stock levels' })
  async adjustStock(@Body() dto: AdjustStockDto, @Request() req) {
    return this.inventoryService.adjustStock(dto, req.user);
  }

  // Movement History
  @Get('movements')
  @ApiOperation({ summary: 'Get inventory movements' })
  async getMovements(
    @Query('itemId') itemId?: string,
    @Query('jobId') jobId?: string,
    @Query('type') type?: MovementType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.inventoryService.getMovements({
      itemId,
      jobId,
      type,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  // Reports
  @Get('reports/low-stock')
  @ApiOperation({ summary: 'Get items with low stock' })
  async getLowStockItems() {
    return this.inventoryService.getLowStockItems();
  }

  @Get('reports/value')
  @ApiOperation({ summary: 'Get total inventory value' })
  async getInventoryValue() {
    return this.inventoryService.getInventoryValue();
  }

  @Get('reports/job-usage/:jobId')
  @ApiOperation({ summary: 'Get inventory usage for a job' })
  async getJobInventoryUsage(@Param('jobId') jobId: string) {
    return this.inventoryService.getJobInventoryUsage(jobId);
  }
}