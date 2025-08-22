import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DrillingReport } from './drilling-report.entity';
import { CreateDrillingReportDto, UpdateDrillingReportDto, ApproveDrillingReportDto } from './dto/create-drilling-report.dto';
import { JobsService } from '../jobs/jobs.service';
import { User, UserRole } from '../users/user.entity';
import { JobStatus } from '../jobs/job.entity';

@Injectable()
export class DrillingReportsService {
  constructor(
    @InjectRepository(DrillingReport)
    private drillingReportsRepository: Repository<DrillingReport>,
    private jobsService: JobsService,
  ) {}

  async create(createDto: CreateDrillingReportDto, user: User): Promise<DrillingReport> {
    // Verify job exists and is in drilling or completed status
    const job = await this.jobsService.findOne(createDto.jobId);
    
    if (job.status !== JobStatus.DRILLING && job.status !== JobStatus.COMPLETED) {
      throw new BadRequestException('Job must be in drilling or completed status to create a drilling report');
    }

    // Verify user is the assigned driller or admin
    if (user.role !== UserRole.ADMIN && job.assignedDrillerId !== user.id) {
      throw new ForbiddenException('You are not assigned as the driller for this job');
    }

    // Check if report already exists for this job
    const existingReport = await this.drillingReportsRepository.findOne({
      where: { jobId: createDto.jobId },
    });

    if (existingReport) {
      throw new BadRequestException('A drilling report already exists for this job');
    }

    const report = this.drillingReportsRepository.create({
      ...createDto,
      drillerId: user.id,
      status: 'draft',
    });

    return this.drillingReportsRepository.save(report);
  }

  async findAll(filters?: {
    jobId?: string;
    drillerId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<DrillingReport[]> {
    const query = this.drillingReportsRepository.createQueryBuilder('report')
      .leftJoinAndSelect('report.job', 'job')
      .leftJoinAndSelect('report.driller', 'driller')
      .leftJoinAndSelect('report.approvedBy', 'approvedBy');

    if (filters?.jobId) {
      query.andWhere('report.jobId = :jobId', { jobId: filters.jobId });
    }

    if (filters?.drillerId) {
      query.andWhere('report.drillerId = :drillerId', { drillerId: filters.drillerId });
    }

    if (filters?.status) {
      query.andWhere('report.status = :status', { status: filters.status });
    }

    if (filters?.startDate) {
      query.andWhere('report.drillingStartDate >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('report.drillingEndDate <= :endDate', { endDate: filters.endDate });
    }

    return query.orderBy('report.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<DrillingReport> {
    const report = await this.drillingReportsRepository.findOne({
      where: { id },
      relations: ['job', 'driller', 'approvedBy'],
    });

    if (!report) {
      throw new NotFoundException('Drilling report not found');
    }

    return report;
  }

  async findByJobId(jobId: string): Promise<DrillingReport | null> {
    return this.drillingReportsRepository.findOne({
      where: { jobId },
      relations: ['job', 'driller', 'approvedBy'],
    });
  }

  async update(id: string, updateDto: UpdateDrillingReportDto, user: User): Promise<DrillingReport> {
    const report = await this.findOne(id);

    // Only the driller who created it or admin can update
    if (user.role !== UserRole.ADMIN && report.drillerId !== user.id) {
      throw new ForbiddenException('You can only update your own drilling reports');
    }

    // Can't update if already approved
    if (report.status === 'approved') {
      throw new BadRequestException('Cannot update an approved drilling report');
    }

    Object.assign(report, updateDto);
    return this.drillingReportsRepository.save(report);
  }

  async submitReport(id: string, user: User): Promise<DrillingReport> {
    const report = await this.findOne(id);

    // Only the driller who created it can submit
    if (report.drillerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only submit your own drilling reports');
    }

    if (report.status !== 'draft') {
      throw new BadRequestException('Only draft reports can be submitted');
    }

    // Validate required fields for submission
    if (!report.clientRepresentativeName || !report.clientSignature) {
      throw new BadRequestException('Client sign-off is required before submission');
    }

    report.status = 'submitted';
    report.clientSignedAt = new Date();

    // Update job status to completed if it's still in drilling
    const job = await this.jobsService.findOne(report.jobId);
    if (job.status === JobStatus.DRILLING) {
      await this.jobsService.update(job.id, { status: JobStatus.COMPLETED });
    }

    return this.drillingReportsRepository.save(report);
  }

  async approveReport(id: string, approveDto: ApproveDrillingReportDto, user: User): Promise<DrillingReport> {
    // Only admin and project managers can approve
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.PROJECT_MANAGER) {
      throw new ForbiddenException('Only administrators and project managers can approve drilling reports');
    }

    const report = await this.findOne(id);

    if (report.status !== 'submitted') {
      throw new BadRequestException('Only submitted reports can be approved or rejected');
    }

    report.status = approveDto.approved ? 'approved' : 'rejected';
    report.approvedById = user.id;
    report.approvedAt = new Date();
    report.approvalNotes = approveDto.approvalNotes || null;

    return this.drillingReportsRepository.save(report);
  }

  async getStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
    drillerId?: string;
  }): Promise<any> {
    const query = this.drillingReportsRepository.createQueryBuilder('report');

    if (filters?.startDate) {
      query.andWhere('report.drillingStartDate >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('report.drillingEndDate <= :endDate', { endDate: filters.endDate });
    }

    if (filters?.drillerId) {
      query.andWhere('report.drillerId = :drillerId', { drillerId: filters.drillerId });
    }

    const reports = await query.getMany();

    const stats = {
      totalReports: reports.length,
      successfulBoreholes: reports.filter(r => !r.isDryHole).length,
      dryHoles: reports.filter(r => r.isDryHole).length,
      averageDepth: 0,
      averageYield: 0,
      totalMetersDrilled: 0,
      waterQualityDistribution: {} as Record<string, number>,
      drillingMethodDistribution: {} as Record<string, number>,
      statusDistribution: {} as Record<string, number>,
    };

    if (reports.length > 0) {
      const depths = reports.map(r => Number(r.totalDepth));
      const yields = reports.filter(r => !r.isDryHole).map(r => Number(r.yieldRate));
      
      stats.averageDepth = depths.reduce((a, b) => a + b, 0) / depths.length;
      stats.totalMetersDrilled = depths.reduce((a, b) => a + b, 0);
      
      if (yields.length > 0) {
        stats.averageYield = yields.reduce((a, b) => a + b, 0) / yields.length;
      }

      // Calculate distributions
      reports.forEach(report => {
        // Water quality
        if (report.waterQuality) {
          stats.waterQualityDistribution[report.waterQuality] = 
            (stats.waterQualityDistribution[report.waterQuality] || 0) + 1;
        }

        // Drilling method
        stats.drillingMethodDistribution[report.drillingMethod] = 
          (stats.drillingMethodDistribution[report.drillingMethod] || 0) + 1;

        // Status
        stats.statusDistribution[report.status] = 
          (stats.statusDistribution[report.status] || 0) + 1;
      });
    }

    return stats;
  }

  async delete(id: string, user: User): Promise<void> {
    const report = await this.findOne(id);

    // Only admin can delete reports
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can delete drilling reports');
    }

    // Can't delete approved reports
    if (report.status === 'approved') {
      throw new BadRequestException('Cannot delete an approved drilling report');
    }

    await this.drillingReportsRepository.delete(id);
  }

  async generatePDF(id: string): Promise<Buffer> {
    const report = await this.findOne(id);
    
    // TODO: Implement PDF generation using a library like puppeteer or pdfkit
    // For now, return a placeholder
    return Buffer.from('PDF generation not yet implemented');
  }
}