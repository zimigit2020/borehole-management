import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from '../job.entity';

export class UpdateJobStatusDto {
  @ApiProperty({ 
    enum: JobStatus,
    description: 'New status for the job'
  })
  @IsEnum(JobStatus)
  status: JobStatus;

  @ApiProperty({ 
    required: false,
    description: 'Notes about the status change'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignDrillerDto {
  @ApiProperty({ 
    description: 'ID of the driller to assign'
  })
  @IsUUID()
  drillerId: string;

  @ApiProperty({ 
    required: false,
    description: 'Assignment notes'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CompleteDrillingDto {
  @ApiProperty({ 
    description: 'Final depth reached in meters'
  })
  finalDepth: number;

  @ApiProperty({ 
    description: 'Water yield in liters per hour'
  })
  waterYield: number;

  @ApiProperty({ 
    description: 'Was the drilling successful?'
  })
  isSuccessful: boolean;

  @ApiProperty({ 
    required: false,
    description: 'Completion notes'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}