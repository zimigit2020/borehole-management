import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, IsArray, IsDateString, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DrillingMethod, WaterQuality } from '../drilling-report.entity';

export class CreateDrillingReportDto {
  @ApiProperty()
  @IsUUID()
  jobId: string;

  @ApiProperty()
  @IsDateString()
  drillingStartDate: string;

  @ApiProperty()
  @IsDateString()
  drillingEndDate: string;

  @ApiProperty({ enum: DrillingMethod })
  @IsEnum(DrillingMethod)
  drillingMethod: DrillingMethod;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  totalDepth: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  waterStruckDepth: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  staticWaterLevel: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  yieldRate: number;

  @ApiProperty({ enum: WaterQuality })
  @IsEnum(WaterQuality)
  waterQuality: WaterQuality;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  casingDepth: number;

  @ApiProperty()
  @IsString()
  casingDiameter: string;

  @ApiProperty()
  @IsString()
  casingMaterial: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  geologicalFormations?: {
    depth: number;
    description: string;
    soilType: string;
  }[];

  @ApiProperty()
  @IsString()
  rigType: string;

  @ApiProperty()
  @IsString()
  compressorCapacity: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mudPumpCapacity?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  pumpingTestDuration: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  pumpingTestYield: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  recoveryTime: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  drawdown?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(14)
  ph?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tds?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  turbidity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bacteriologicalStatus?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  challengesEncountered?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  recommendations?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDryHole?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dryHoleReason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pumpInstalled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pumpType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pumpBrand?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pumpCapacity?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  photos?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  documents?: string[];

  @ApiProperty()
  @IsNumber()
  actualLatitude: number;

  @ApiProperty()
  @IsNumber()
  actualLongitude: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clientRepresentativeName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clientSignature?: string;
}

export class UpdateDrillingReportDto extends CreateDrillingReportDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export class ApproveDrillingReportDto {
  @ApiProperty()
  @IsBoolean()
  approved: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  approvalNotes?: string;
}