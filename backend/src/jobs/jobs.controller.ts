import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put, UseInterceptors, UploadedFile, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateJobDto } from './dto/create-job.dto';
import { AssignSurveyorDto } from './dto/assign-surveyor.dto';

@ApiTags('Jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job' })
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs' })
  findAll(@Query('surveyorId') surveyorId?: string) {
    return this.jobsService.findAll(surveyorId);
  }

  @Get('assigned')
  @ApiOperation({ summary: 'Get jobs assigned to current surveyor' })
  getAssignedJobs(@Request() req) {
    return this.jobsService.getAssignedJobs(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update job' })
  update(@Param('id') id: string, @Body() updateData: Partial<CreateJobDto>) {
    return this.jobsService.update(id, updateData);
  }

  @Post(':id/assign-surveyor')
  @ApiOperation({ summary: 'Assign surveyor to job' })
  assignSurveyor(@Param('id') id: string, @Body() assignDto: AssignSurveyorDto) {
    return this.jobsService.assignSurveyor(id, assignDto);
  }

  @Post(':id/complete-survey')
  @ApiOperation({ summary: 'Mark survey as complete' })
  completeSurvey(@Param('id') id: string) {
    return this.jobsService.markSurveyComplete(id);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import jobs from Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importFromExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    return this.jobsService.importFromExcel(file.buffer);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete job' })
  remove(@Param('id') id: string) {
    return this.jobsService.delete(id);
  }
}