import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put, UseInterceptors, UploadedFile, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { SurveysService } from './surveys.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { SyncSurveyDto } from './dto/sync-survey.dto';

@ApiTags('Surveys')
@Controller('surveys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new survey report' })
  create(@Body() createSurveyDto: CreateSurveyDto, @Request() req) {
    return this.surveysService.create(createSurveyDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all surveys' })
  findAll(@Query('surveyorId') surveyorId?: string) {
    return this.surveysService.findAll(surveyorId);
  }

  @Get('my-surveys')
  @ApiOperation({ summary: 'Get surveys for current surveyor' })
  getMySurveys(@Request() req) {
    return this.surveysService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get survey by ID' })
  findOne(@Param('id') id: string) {
    return this.surveysService.findOne(id);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Get survey by job ID' })
  findByJobId(@Param('jobId') jobId: string) {
    return this.surveysService.findByJobId(jobId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update survey' })
  update(@Param('id') id: string, @Body() updateData: Partial<CreateSurveyDto>) {
    return this.surveysService.update(id, updateData);
  }

  @Post(':id/upload-graph')
  @ApiOperation({ summary: 'Upload resistivity graph for survey' })
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
  async uploadGraph(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    return this.surveysService.uploadGraph(id, file);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync offline survey data' })
  syncOfflineData(@Body() syncData: SyncSurveyDto[], @Request() req) {
    return this.surveysService.syncOfflineData(syncData, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete survey' })
  remove(@Param('id') id: string) {
    return this.surveysService.delete(id);
  }
}