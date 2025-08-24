import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, IsDateString, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PurchaseOrderStatus, PurchaseOrderPriority, PaymentTerms } from '../entities/purchase-order.entity';

export class PurchaseOrderItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  inventoryItemId?: string;

  @ApiProperty()
  @IsString()
  sku: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specifications?: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty()
  @IsNumber()
  unitPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePurchaseOrderDto {
  @ApiProperty()
  @IsString()
  supplier: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierContact?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierAddress?: string;

  @ApiProperty()
  @IsDateString()
  orderDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryLocation?: string;

  @ApiPropertyOptional({ enum: PurchaseOrderPriority })
  @IsOptional()
  @IsEnum(PurchaseOrderPriority)
  priority?: PurchaseOrderPriority;

  @ApiPropertyOptional({ enum: PaymentTerms })
  @IsOptional()
  @IsEnum(PaymentTerms)
  paymentTerms?: PaymentTerms;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customPaymentTerms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  shippingCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  costCenter?: string;

  @ApiProperty({ type: [PurchaseOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];
}

export class UpdatePurchaseOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierContact?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryLocation?: string;

  @ApiPropertyOptional({ enum: PurchaseOrderPriority })
  @IsOptional()
  @IsEnum(PurchaseOrderPriority)
  priority?: PurchaseOrderPriority;

  @ApiPropertyOptional({ enum: PaymentTerms })
  @IsOptional()
  @IsEnum(PaymentTerms)
  paymentTerms?: PaymentTerms;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customPaymentTerms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  shippingCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({ type: [PurchaseOrderItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items?: PurchaseOrderItemDto[];
}

export class ApprovePurchaseOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  approvalNotes?: string;
}

export class RejectPurchaseOrderDto {
  @ApiProperty()
  @IsString()
  reason: string;
}

export class ReceivePurchaseOrderItemDto {
  @ApiProperty()
  @IsUUID()
  itemId: string;

  @ApiProperty()
  @IsNumber()
  receivedQuantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReceivePurchaseOrderDto {
  @ApiProperty({ type: [ReceivePurchaseOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceivePurchaseOrderItemDto)
  items: ReceivePurchaseOrderItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receivingNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  invoiceAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  createInventoryMovements?: boolean;
}