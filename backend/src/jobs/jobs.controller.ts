import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put, UseInterceptors, UploadedFile, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobsService } from './jobs.service';
import { JobWorkflowService } from './workflow/job-workflow.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateJobDto } from './dto/create-job.dto';
import { AssignSurveyorDto } from './dto/assign-surveyor.dto';
import { AssignDrillerDto, CompleteDrillingDto } from './dto/update-job-status.dto';
import { JobStatus } from './job.entity';

@ApiTags('Jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly workflowService: JobWorkflowService,
  ) {}

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
  assignSurveyor(@Param('id') id: string, @Body() assignDto: AssignSurveyorDto, @Request() req) {
    return this.workflowService.assignSurveyor(id, assignDto, req.user);
  }

  @Post(':id/complete-survey')
  @ApiOperation({ summary: 'Mark survey as complete' })
  completeSurvey(@Param('id') id: string, @Body() body: { notes?: string }, @Request() req) {
    return this.workflowService.completeSurvey(id, req.user, body.notes);
  }

  @Post(':id/assign-driller')
  @ApiOperation({ summary: 'Assign driller to job and start drilling' })
  assignDriller(@Param('id') id: string, @Body() assignDto: AssignDrillerDto, @Request() req) {
    return this.workflowService.assignDriller(id, assignDto, req.user);
  }

  @Post(':id/complete-drilling')
  @ApiOperation({ summary: 'Complete drilling with results' })
  completeDrilling(@Param('id') id: string, @Body() completeDto: CompleteDrillingDto, @Request() req) {
    return this.workflowService.completeDrilling(id, completeDto, req.user);
  }

  @Post(':id/revert-status')
  @ApiOperation({ summary: 'Revert job to previous status' })
  revertStatus(@Param('id') id: string, @Body() body: { reason: string }, @Request() req) {
    return this.workflowService.revertStatus(id, body.reason, req.user);
  }

  @Get('by-status/:status')
  @ApiOperation({ summary: 'Get jobs by status' })
  getJobsByStatus(@Param('status') status: JobStatus) {
    return this.workflowService.getJobsByStatus(status);
  }

  @Get('my-jobs')
  @ApiOperation({ summary: 'Get jobs assigned to current user' })
  getMyJobs(@Request() req) {
    return this.workflowService.getJobsAssignedToUser(req.user.id);
  }

  @Get('workflow-stats')
  @ApiOperation({ summary: 'Get workflow statistics' })
  getWorkflowStats() {
    return this.workflowService.getWorkflowStats();
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