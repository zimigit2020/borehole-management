import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DrillingReportsService } from './drilling-reports.service';
import { CreateDrillingReportDto, UpdateDrillingReportDto, ApproveDrillingReportDto } from './dto/create-drilling-report.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Drilling Reports')
@Controller('drilling-reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DrillingReportsController {
  constructor(private readonly drillingReportsService: DrillingReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new drilling report' })
  create(@Body() createDto: CreateDrillingReportDto, @Request() req) {
    return this.drillingReportsService.create(createDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all drilling reports' })
  @ApiQuery({ name: 'jobId', required: false })
  @ApiQuery({ name: 'drillerId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  findAll(
    @Query('jobId') jobId?: string,
    @Query('drillerId') drillerId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = {
      jobId,
      drillerId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };
    return this.drillingReportsService.findAll(filters);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get drilling reports statistics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'drillerId', required: false })
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('drillerId') drillerId?: string,
  ) {
    const filters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      drillerId,
    };
    return this.drillingReportsService.getStatistics(filters);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Get drilling report by job ID' })
  findByJobId(@Param('jobId') jobId: string) {
    return this.drillingReportsService.findByJobId(jobId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get drilling report by ID' })
  findOne(@Param('id') id: string) {
    return this.drillingReportsService.findOne(id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Generate PDF of drilling report' })
  async generatePDF(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.drillingReportsService.generatePDF(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="drilling-report-${id}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.status(HttpStatus.OK).send(pdf);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update drilling report' })
  update(
    @Param('id') id: string, 
    @Body() updateDto: UpdateDrillingReportDto,
    @Request() req,
  ) {
    return this.drillingReportsService.update(id, updateDto, req.user);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit drilling report for approval' })
  submitReport(@Param('id') id: string, @Request() req) {
    return this.drillingReportsService.submitReport(id, req.user);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve or reject drilling report' })
  approveReport(
    @Param('id') id: string,
    @Body() approveDto: ApproveDrillingReportDto,
    @Request() req,
  ) {
    return this.drillingReportsService.approveReport(id, approveDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete drilling report' })
  remove(@Param('id') id: string, @Request() req) {
    return this.drillingReportsService.delete(id, req.user);
  }
}