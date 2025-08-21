import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from './job.entity';
import { UsersService } from '../users/users.service';
import * as XLSX from 'xlsx';
import { CreateJobDto } from './dto/create-job.dto';
import { AssignSurveyorDto } from './dto/assign-surveyor.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    private usersService: UsersService,
  ) {}

  async create(createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobsRepository.create(createJobDto);
    return this.jobsRepository.save(job);
  }

  async findAll(surveyorId?: string): Promise<Job[]> {
    const query = this.jobsRepository.createQueryBuilder('job')
      .leftJoinAndSelect('job.assignedSurveyor', 'surveyor')
      .leftJoinAndSelect('job.assignedDriller', 'driller');

    if (surveyorId) {
      query.where('job.assignedSurveyorId = :surveyorId', { surveyorId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobsRepository.findOne({
      where: { id },
      relations: ['assignedSurveyor', 'assignedDriller'],
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async update(id: string, updateData: Partial<Job>): Promise<Job> {
    await this.jobsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async assignSurveyor(jobId: string, assignDto: AssignSurveyorDto): Promise<Job> {
    const job = await this.findOne(jobId);
    const surveyor = await this.usersService.findOne(assignDto.surveyorId);

    if (surveyor.role !== 'surveyor' && surveyor.role !== 'admin') {
      throw new BadRequestException('User is not a surveyor');
    }

    job.assignedSurveyorId = surveyor.id;
    job.assignedSurveyor = surveyor;
    job.assignedAt = new Date();
    job.status = JobStatus.ASSIGNED;

    return this.jobsRepository.save(job);
  }

  async importFromExcel(buffer: Buffer): Promise<Job[]> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const jobs: Job[] = [];
      for (const row of data) {
        const job = this.jobsRepository.create({
          name: row['Project Name'] || row['Name'],
          clientName: row['Client'] || row['Client Name'],
          siteName: row['Site Name'] || row['Site'],
          latitude: parseFloat(row['Latitude'] || row['Lat']),
          longitude: parseFloat(row['Longitude'] || row['Lng'] || row['Long']),
          contactPerson: row['Contact Person'] || row['Contact'],
          contactPhone: row['Contact Phone'] || row['Phone'],
          accessNotes: row['Access Notes'] || row['Notes'],
          priority: row['Priority'] || 'normal',
          budgetUsd: row['Budget USD'] ? parseFloat(row['Budget USD']) : null,
          status: JobStatus.CREATED,
        });

        // Validate required fields
        if (!job.name || !job.clientName || !job.siteName || !job.latitude || !job.longitude) {
          throw new BadRequestException(`Missing required fields in row: ${JSON.stringify(row)}`);
        }

        jobs.push(await this.jobsRepository.save(job));
      }

      return jobs;
    } catch (error) {
      throw new BadRequestException(`Failed to import Excel file: ${error.message}`);
    }
  }

  async getAssignedJobs(surveyorId: string): Promise<Job[]> {
    return this.jobsRepository.find({
      where: { assignedSurveyorId: surveyorId },
      relations: ['assignedSurveyor'],
    });
  }

  async markSurveyComplete(jobId: string): Promise<Job> {
    const job = await this.findOne(jobId);
    job.status = JobStatus.SURVEYED;
    job.surveyCompletedAt = new Date();
    return this.jobsRepository.save(job);
  }

  async delete(id: string): Promise<void> {
    const result = await this.jobsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Job not found');
    }
  }
}