import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Installation, InstallationStatus } from './entities/installation.entity';
import { CreateInstallationDto, UpdateInstallationDto } from './dto/create-installation.dto';
import { User } from '../users/user.entity';

@Injectable()
export class InstallationsService {
  constructor(
    @InjectRepository(Installation)
    private installationsRepository: Repository<Installation>,
  ) {}

  async create(dto: CreateInstallationDto): Promise<Installation> {
    // Check if installation already exists for this job
    const existing = await this.installationsRepository.findOne({
      where: { jobId: dto.jobId, type: dto.type },
    });

    if (existing) {
      throw new BadRequestException(`Installation of type ${dto.type} already exists for this job`);
    }

    const installation = this.installationsRepository.create(dto);
    return this.installationsRepository.save(installation);
  }

  async findAll(filters?: {
    jobId?: string;
    technicianId?: string;
    status?: InstallationStatus;
    type?: string;
  }): Promise<Installation[]> {
    const query = this.installationsRepository.createQueryBuilder('installation')
      .leftJoinAndSelect('installation.job', 'job')
      .leftJoinAndSelect('installation.technician', 'technician');

    if (filters?.jobId) {
      query.andWhere('installation.jobId = :jobId', { jobId: filters.jobId });
    }

    if (filters?.technicianId) {
      query.andWhere('installation.technicianId = :technicianId', { technicianId: filters.technicianId });
    }

    if (filters?.status) {
      query.andWhere('installation.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      query.andWhere('installation.type = :type', { type: filters.type });
    }

    return query.orderBy('installation.scheduledDate', 'ASC').getMany();
  }

  async findOne(id: string): Promise<Installation> {
    const installation = await this.installationsRepository.findOne({
      where: { id },
      relations: ['job', 'technician'],
    });

    if (!installation) {
      throw new NotFoundException('Installation not found');
    }

    return installation;
  }

  async update(id: string, dto: UpdateInstallationDto): Promise<Installation> {
    const installation = await this.findOne(id);

    // Handle status transitions
    if (dto.status) {
      await this.validateStatusTransition(installation.status, dto.status);

      // Set timestamps based on status
      if (dto.status === InstallationStatus.IN_PROGRESS && !installation.startedAt) {
        dto.startedAt = new Date().toISOString();
      }

      if (dto.status === InstallationStatus.COMPLETED && !installation.completedAt) {
        dto.completedAt = new Date().toISOString();
      }
    }

    Object.assign(installation, dto);
    return this.installationsRepository.save(installation);
  }

  async delete(id: string): Promise<void> {
    const installation = await this.findOne(id);

    if (installation.status !== InstallationStatus.SCHEDULED) {
      throw new BadRequestException('Can only delete scheduled installations');
    }

    await this.installationsRepository.delete(id);
  }

  async startInstallation(id: string, user: User): Promise<Installation> {
    const installation = await this.findOne(id);

    if (installation.status !== InstallationStatus.SCHEDULED) {
      throw new BadRequestException('Installation must be scheduled to start');
    }

    installation.status = InstallationStatus.IN_PROGRESS;
    installation.startedAt = new Date();
    installation.technicianId = user.id;

    return this.installationsRepository.save(installation);
  }

  async completeInstallation(
    id: string,
    data: {
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
  ): Promise<Installation> {
    const installation = await this.findOne(id);

    if (installation.status !== InstallationStatus.IN_PROGRESS) {
      throw new BadRequestException('Installation must be in progress to complete');
    }

    // Update test results
    if (data.testResults) {
      Object.assign(installation, data.testResults);
    }

    // Update quality checks
    if (data.qualityChecks) {
      Object.assign(installation, data.qualityChecks);
    }

    // Update client acceptance
    if (data.clientAcceptance) {
      Object.assign(installation, data.clientAcceptance);
      installation.clientSignedAt = new Date();
    }

    installation.status = InstallationStatus.COMPLETED;
    installation.completedAt = new Date();

    return this.installationsRepository.save(installation);
  }

  async putOnHold(id: string, reason: string): Promise<Installation> {
    const installation = await this.findOne(id);

    if (installation.status === InstallationStatus.COMPLETED) {
      throw new BadRequestException('Cannot put completed installation on hold');
    }

    installation.status = InstallationStatus.ON_HOLD;
    installation.issuesEncountered = reason;

    return this.installationsRepository.save(installation);
  }

  async resume(id: string): Promise<Installation> {
    const installation = await this.findOne(id);

    if (installation.status !== InstallationStatus.ON_HOLD) {
      throw new BadRequestException('Installation must be on hold to resume');
    }

    installation.status = InstallationStatus.IN_PROGRESS;

    return this.installationsRepository.save(installation);
  }

  async getJobInstallations(jobId: string): Promise<Installation[]> {
    return this.installationsRepository.find({
      where: { jobId },
      relations: ['technician'],
      order: { createdAt: 'ASC' },
    });
  }

  async getTechnicianInstallations(technicianId: string): Promise<Installation[]> {
    return this.installationsRepository.find({
      where: { technicianId },
      relations: ['job'],
      order: { scheduledDate: 'ASC' },
    });
  }

  async getUpcomingInstallations(days: number = 7): Promise<Installation[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const query = this.installationsRepository.createQueryBuilder('installation')
      .leftJoinAndSelect('installation.job', 'job')
      .leftJoinAndSelect('installation.technician', 'technician')
      .where('installation.status = :status', { status: InstallationStatus.SCHEDULED })
      .andWhere('installation.scheduledDate <= :futureDate', { futureDate })
      .orderBy('installation.scheduledDate', 'ASC');

    return query.getMany();
  }

  async getInstallationStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    averageCompletionTime: number;
  }> {
    const installations = await this.installationsRepository.find();

    const byStatus = installations.reduce((acc, inst) => {
      acc[inst.status] = (acc[inst.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = installations.reduce((acc, inst) => {
      acc[inst.type] = (acc[inst.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average completion time for completed installations
    const completed = installations.filter(i => 
      i.status === InstallationStatus.COMPLETED && i.startedAt && i.completedAt
    );

    let averageCompletionTime = 0;
    if (completed.length > 0) {
      const totalTime = completed.reduce((sum, inst) => {
        const start = new Date(inst.startedAt).getTime();
        const end = new Date(inst.completedAt).getTime();
        return sum + (end - start);
      }, 0);
      averageCompletionTime = totalTime / completed.length / (1000 * 60 * 60); // Convert to hours
    }

    return {
      total: installations.length,
      byStatus,
      byType,
      averageCompletionTime,
    };
  }

  private async validateStatusTransition(
    currentStatus: InstallationStatus,
    newStatus: InstallationStatus,
  ): Promise<void> {
    const validTransitions: Record<InstallationStatus, InstallationStatus[]> = {
      [InstallationStatus.SCHEDULED]: [
        InstallationStatus.IN_PROGRESS,
        InstallationStatus.ON_HOLD,
      ],
      [InstallationStatus.IN_PROGRESS]: [
        InstallationStatus.COMPLETED,
        InstallationStatus.ON_HOLD,
        InstallationStatus.FAILED,
      ],
      [InstallationStatus.ON_HOLD]: [
        InstallationStatus.IN_PROGRESS,
        InstallationStatus.FAILED,
      ],
      [InstallationStatus.COMPLETED]: [],
      [InstallationStatus.FAILED]: [InstallationStatus.SCHEDULED],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}