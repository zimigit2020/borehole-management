import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JobCostingService } from './job-costing.service';

@ApiTags('job-costing')
@Controller('job-costing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobCostingController {
  constructor(private readonly jobCostingService: JobCostingService) {}

  @Get('report/:jobId')
  @ApiOperation({ summary: 'Get detailed costing report for a specific job' })
  async getJobCostingReport(@Param('jobId') jobId: string) {
    return this.jobCostingService.getJobCostingReport(jobId);
  }

  @Get('profitability')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get job profitability report' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getJobProfitabilityReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
  ) {
    return this.jobCostingService.getJobProfitabilityReport({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      clientId,
      status,
    });
  }

  @Get('trends')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get cost trend analysis' })
  @ApiQuery({ name: 'period', enum: ['daily', 'weekly', 'monthly'], required: false })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getCostTrendReport(
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'monthly',
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.jobCostingService.getCostTrendReport(
      period,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('comparison')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Compare costs across multiple jobs' })
  @ApiQuery({ name: 'jobIds', required: true, type: [String] })
  async getJobCostComparison(@Query('jobIds') jobIds: string | string[]) {
    const ids = Array.isArray(jobIds) ? jobIds : [jobIds];
    return this.jobCostingService.getJobCostComparison(ids);
  }

  @Get('client/:clientId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get client profitability analysis' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getClientProfitability(
    @Param('clientId') clientId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.jobCostingService.getClientProfitability(
      clientId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}