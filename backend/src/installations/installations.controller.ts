import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InstallationsService } from './installations.service';
import { CreateInstallationDto, UpdateInstallationDto } from './dto/create-installation.dto';
import { InstallationStatus } from './entities/installation.entity';

@ApiTags('installations')
@Controller('installations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InstallationsController {
  constructor(private readonly installationsService: InstallationsService) {}

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create new installation' })
  async create(@Body() dto: CreateInstallationDto) {
    return this.installationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all installations' })
  async findAll(
    @Query('jobId') jobId?: string,
    @Query('technicianId') technicianId?: string,
    @Query('status') status?: InstallationStatus,
    @Query('type') type?: string,
  ) {
    return this.installationsService.findAll({ jobId, technicianId, status, type });
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming installations' })
  async getUpcoming(@Query('days') days?: string) {
    return this.installationsService.getUpcomingInstallations(days ? parseInt(days) : 7);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get installation statistics' })
  async getStats() {
    return this.installationsService.getInstallationStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get installation by ID' })
  async findOne(@Param('id') id: string) {
    return this.installationsService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'manager', 'technician')
  @ApiOperation({ summary: 'Update installation' })
  async update(@Param('id') id: string, @Body() dto: UpdateInstallationDto) {
    return this.installationsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete installation' })
  async delete(@Param('id') id: string) {
    await this.installationsService.delete(id);
    return { message: 'Installation deleted successfully' };
  }

  @Post(':id/start')
  @Roles('admin', 'manager', 'technician')
  @ApiOperation({ summary: 'Start installation' })
  async start(@Param('id') id: string, @Request() req) {
    return this.installationsService.startInstallation(id, req.user);
  }

  @Post(':id/complete')
  @Roles('admin', 'manager', 'technician')
  @ApiOperation({ summary: 'Complete installation' })
  async complete(
    @Param('id') id: string,
    @Body() data: {
      testResults?: {
        flowRate?: number;
        pressure?: number;
        powerConsumption?: number;
        testSuccessful: boolean;
        testNotes?: string;
      };
      qualityChecks?: {
        electricalTestPassed: boolean;
        pressureTestPassed: boolean;
        leakTestPassed: boolean;
        functionalTestPassed: boolean;
      };
      clientAcceptance?: {
        clientRepresentativeName: string;
        clientSignature: string;
        clientFeedback?: string;
        clientAccepted: boolean;
      };
    },
  ) {
    return this.installationsService.completeInstallation(id, data);
  }

  @Post(':id/hold')
  @Roles('admin', 'manager', 'technician')
  @ApiOperation({ summary: 'Put installation on hold' })
  async putOnHold(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.installationsService.putOnHold(id, body.reason);
  }

  @Post(':id/resume')
  @Roles('admin', 'manager', 'technician')
  @ApiOperation({ summary: 'Resume installation' })
  async resume(@Param('id') id: string) {
    return this.installationsService.resume(id);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Get installations for a job' })
  async getJobInstallations(@Param('jobId') jobId: string) {
    return this.installationsService.getJobInstallations(jobId);
  }

  @Get('technician/:technicianId')
  @ApiOperation({ summary: 'Get installations for a technician' })
  async getTechnicianInstallations(@Param('technicianId') technicianId: string) {
    return this.installationsService.getTechnicianInstallations(technicianId);
  }
}