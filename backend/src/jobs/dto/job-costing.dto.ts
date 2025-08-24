import { IsUUID, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JobCostingFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class JobCostBreakdown {
  @ApiProperty()
  category: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  percentage: number;

  @ApiProperty()
  itemCount: number;

  @ApiPropertyOptional()
  details?: any[];
}

export class JobCostingReport {
  @ApiProperty()
  jobId: string;

  @ApiProperty()
  jobNumber: string;

  @ApiProperty()
  clientName: string;

  @ApiProperty()
  siteName: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  startDate: Date;

  @ApiPropertyOptional()
  completedDate?: Date;

  @ApiProperty()
  quotedAmount: number;

  @ApiProperty()
  invoicedAmount: number;

  @ApiProperty()
  paidAmount: number;

  @ApiProperty()
  totalCosts: number;

  @ApiProperty()
  grossProfit: number;

  @ApiProperty()
  profitMargin: number;

  @ApiProperty({ type: [JobCostBreakdown] })
  costBreakdown: JobCostBreakdown[];

  @ApiProperty()
  materialsCost: number;

  @ApiProperty()
  laborCost: number;

  @ApiProperty()
  equipmentCost: number;

  @ApiProperty()
  transportCost: number;

  @ApiProperty()
  overheadCost: number;

  @ApiProperty()
  otherCosts: number;

  @ApiPropertyOptional()
  inventoryItems?: any[];

  @ApiPropertyOptional()
  expenses?: any[];

  @ApiPropertyOptional()
  purchaseOrders?: any[];

  @ApiPropertyOptional()
  timeline?: any[];
}

export class JobProfitabilityReport {
  @ApiProperty()
  totalJobs: number;

  @ApiProperty()
  profitableJobs: number;

  @ApiProperty()
  lossJobs: number;

  @ApiProperty()
  breakEvenJobs: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  totalCosts: number;

  @ApiProperty()
  totalProfit: number;

  @ApiProperty()
  averageProfitMargin: number;

  @ApiProperty()
  bestPerformingJob: any;

  @ApiProperty()
  worstPerformingJob: any;

  @ApiProperty({ type: [Object] })
  jobsList: any[];
}

export class CostTrendReport {
  @ApiProperty()
  period: string;

  @ApiProperty()
  totalCosts: number;

  @ApiProperty()
  materialsCost: number;

  @ApiProperty()
  laborCost: number;

  @ApiProperty()
  equipmentCost: number;

  @ApiProperty()
  transportCost: number;

  @ApiProperty()
  overheadCost: number;

  @ApiProperty()
  jobCount: number;

  @ApiProperty()
  averageCostPerJob: number;
}