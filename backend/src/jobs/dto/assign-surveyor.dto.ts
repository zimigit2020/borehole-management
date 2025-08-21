import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignSurveyorDto {
  @ApiProperty({ example: 'uuid-of-surveyor' })
  @IsString()
  @IsNotEmpty()
  surveyorId: string;
}