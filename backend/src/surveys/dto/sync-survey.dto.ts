import { IsString, IsNumber, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SyncSurveyDto {
  @ApiProperty({ example: 'uuid-of-job' })
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @ApiProperty({ example: -18.9292 })
  @IsNumber()
  @IsNotEmpty()
  gpsLat: number;

  @ApiProperty({ example: 32.8509 })
  @IsNumber()
  @IsNotEmpty()
  gpsLng: number;

  @ApiProperty({ example: 5.2 })
  @IsNumber()
  @IsOptional()
  gpsAccuracy?: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @IsNotEmpty()
  recommendedMinDepth: number;

  @ApiProperty({ example: 40 })
  @IsNumber()
  @IsNotEmpty()
  recommendedMaxDepth: number;

  @ApiProperty({ example: [10, 25, 35], type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  expectedBreaks: number[];

  @ApiProperty({ example: 'Clay' })
  @IsString()
  @IsOptional()
  soilType?: string;

  @ApiProperty({ example: 'Rocky terrain' })
  @IsString()
  @IsOptional()
  groundConditions?: string;

  @ApiProperty({ example: 'Resistivity' })
  @IsString()
  @IsOptional()
  surveyMethod?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  disclaimerAck: boolean;

  @ApiProperty({ example: 'Notes from field' })
  @IsString()
  @IsOptional()
  surveyorNotes?: string;

  @ApiProperty({ example: 'android-device-123' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  @IsDateString()
  @IsNotEmpty()
  offlineCreatedAt: Date;

  @ApiProperty({ example: 'graph-file-id', required: false })
  @IsString()
  @IsOptional()
  graphFileId?: string;
}