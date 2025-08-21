import { IsString, IsNumber, IsNotEmpty, IsOptional, IsBoolean, IsArray, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSurveyDto {
  @ApiProperty({ example: 'uuid-of-job' })
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @ApiProperty({ example: -18.9292 })
  @IsNumber()
  @IsNotEmpty()
  @Min(-90)
  @Max(90)
  gpsLat: number;

  @ApiProperty({ example: 32.8509 })
  @IsNumber()
  @IsNotEmpty()
  @Min(-180)
  @Max(180)
  gpsLng: number;

  @ApiProperty({ example: 5.2, required: false })
  @IsNumber()
  @IsOptional()
  gpsAccuracy?: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(1000)
  recommendedMinDepth: number;

  @ApiProperty({ example: 40 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(1000)
  recommendedMaxDepth: number;

  @ApiProperty({ example: [10, 25, 35], type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  expectedBreaks: number[];

  @ApiProperty({ example: 'Clay', required: false })
  @IsString()
  @IsOptional()
  soilType?: string;

  @ApiProperty({ example: 'Rocky terrain with water table at 15m', required: false })
  @IsString()
  @IsOptional()
  groundConditions?: string;

  @ApiProperty({ example: 'Resistivity', required: false })
  @IsString()
  @IsOptional()
  surveyMethod?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  disclaimerAck: boolean;

  @ApiProperty({ example: 'Site accessible only in dry season', required: false })
  @IsString()
  @IsOptional()
  surveyorNotes?: string;

  @ApiProperty({ example: 'device-uuid', required: false })
  @IsString()
  @IsOptional()
  deviceId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  offlineCreatedAt?: Date;
}