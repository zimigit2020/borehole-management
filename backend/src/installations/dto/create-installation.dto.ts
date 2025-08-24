import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, IsBoolean, IsDateString, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InstallationType, PumpType, InstallationStatus } from '../entities/installation.entity';

export class CreateInstallationDto {
  @ApiProperty()
  @IsUUID()
  jobId: string;

  @ApiProperty({ enum: InstallationType })
  @IsEnum(InstallationType)
  type: InstallationType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  technicianId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  // Pump Details
  @ApiProperty({ enum: PumpType, required: false })
  @IsOptional()
  @IsEnum(PumpType)
  pumpType?: PumpType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pumpBrand?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pumpModel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pumpSerialNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pumpCapacity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pumpPower?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pumpHead?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pumpWarrantyPeriod?: string;

  // Electrical Details
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  controlPanelType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cableType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cableLength?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  starterType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  protectionDevices?: string;

  // Plumbing Details
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pipeType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pipeDiameter?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pipeLength?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fittingsUsed?: string;

  // Tank Details
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tankCapacity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tankMaterial?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tankLocation?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  tankElevation?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInstallationDto extends CreateInstallationDto {
  @ApiProperty({ enum: InstallationStatus, required: false })
  @IsOptional()
  @IsEnum(InstallationStatus)
  status?: InstallationStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  // Test Results
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  flowRate?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pressure?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  powerConsumption?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  testSuccessful?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  testNotes?: string;

  // Quality Checks
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  electricalTestPassed?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pressureTestPassed?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  leakTestPassed?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  functionalTestPassed?: boolean;

  // Documentation
  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  photos?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  documents?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  warrantyDocument?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userManual?: string;

  // Client Acceptance
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clientRepresentativeName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clientSignature?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  clientSignedAt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clientFeedback?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  clientAccepted?: boolean;

  // Maintenance
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  nextMaintenanceDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  maintenanceInstructions?: string;

  // Additional Info
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  issuesEncountered?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  recommendations?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  additionalDetails?: Record<string, any>;
}