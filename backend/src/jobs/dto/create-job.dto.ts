import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from '../job.entity';

export class CreateJobDto {
  @ApiProperty({ example: 'Mutare Wells Project' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Mutare Rural Council' })
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @ApiProperty({ example: 'Chikanga Site A' })
  @IsString()
  @IsNotEmpty()
  siteName: string;

  @ApiProperty({ example: -18.9292 })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ example: 32.8509 })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ example: 'John Mukamuri' })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiProperty({ example: '+263771234567' })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiProperty({ example: 'Turn left at school, 4x4 required' })
  @IsString()
  @IsOptional()
  accessNotes?: string;

  @ApiProperty({ example: 'high' })
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @IsOptional()
  budgetUsd?: number;

  @ApiProperty({ enum: JobStatus, default: JobStatus.CREATED })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;
}