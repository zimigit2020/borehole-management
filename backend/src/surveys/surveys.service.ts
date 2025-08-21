import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveyReport } from './survey.entity';
import { JobsService } from '../jobs/jobs.service';
import { FilesService } from '../files/files.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { SyncSurveyDto } from './dto/sync-survey.dto';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(SurveyReport)
    private surveyRepository: Repository<SurveyReport>,
    private jobsService: JobsService,
    private filesService: FilesService,
  ) {}

  async create(createSurveyDto: CreateSurveyDto, surveyorId: string): Promise<SurveyReport> {
    // Verify job exists and is assigned to this surveyor
    const job = await this.jobsService.findOne(createSurveyDto.jobId);
    
    if (job.assignedSurveyorId !== surveyorId) {
      throw new BadRequestException('You are not assigned to this job');
    }

    // Check if survey already exists for this job
    const existingSurvey = await this.surveyRepository.findOne({
      where: { jobId: createSurveyDto.jobId }
    });

    if (existingSurvey) {
      throw new BadRequestException('Survey already exists for this job');
    }

    const survey = this.surveyRepository.create({
      ...createSurveyDto,
      surveyorId,
      synced: true,
      gpsCapturedAt: new Date(),
    });

    const savedSurvey = await this.surveyRepository.save(survey);

    // Update job status
    await this.jobsService.markSurveyComplete(createSurveyDto.jobId);

    return savedSurvey;
  }

  async findAll(surveyorId?: string): Promise<SurveyReport[]> {
    const query = this.surveyRepository.createQueryBuilder('survey')
      .leftJoinAndSelect('survey.job', 'job')
      .leftJoinAndSelect('survey.surveyor', 'surveyor');

    if (surveyorId) {
      query.where('survey.surveyorId = :surveyorId', { surveyorId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<SurveyReport> {
    const survey = await this.surveyRepository.findOne({
      where: { id },
      relations: ['job', 'surveyor'],
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    return survey;
  }

  async findByJobId(jobId: string): Promise<SurveyReport> {
    const survey = await this.surveyRepository.findOne({
      where: { jobId },
      relations: ['job', 'surveyor'],
    });

    if (!survey) {
      throw new NotFoundException('Survey not found for this job');
    }

    return survey;
  }

  async uploadGraph(surveyId: string, file: Express.Multer.File): Promise<SurveyReport> {
    const survey = await this.findOne(surveyId);
    
    // Upload file to DigitalOcean Spaces
    const { fileId, url } = await this.filesService.uploadResistivityGraph(file, survey.jobId);
    
    // Update survey with file reference
    survey.graphFileId = fileId;
    
    return this.surveyRepository.save(survey);
  }

  async syncOfflineData(syncData: SyncSurveyDto[], surveyorId: string): Promise<any> {
    const results = {
      synced: [],
      failed: [],
      conflicts: []
    };

    for (const data of syncData) {
      try {
        // Check if survey already exists (by deviceId and timestamp)
        const existing = await this.surveyRepository.findOne({
          where: {
            deviceId: data.deviceId,
            offlineCreatedAt: data.offlineCreatedAt,
          }
        });

        if (existing) {
          results.conflicts.push({
            deviceId: data.deviceId,
            jobId: data.jobId,
            reason: 'Already synced'
          });
          continue;
        }

        // Verify job assignment
        const job = await this.jobsService.findOne(data.jobId);
        if (job.assignedSurveyorId !== surveyorId) {
          results.failed.push({
            jobId: data.jobId,
            reason: 'Not assigned to this job'
          });
          continue;
        }

        // Create survey
        const survey = this.surveyRepository.create({
          ...data,
          surveyorId,
          synced: true,
        });

        const saved = await this.surveyRepository.save(survey);
        
        // Update job status
        await this.jobsService.markSurveyComplete(data.jobId);
        
        results.synced.push({
          id: saved.id,
          jobId: saved.jobId,
          deviceId: saved.deviceId,
        });

      } catch (error) {
        results.failed.push({
          jobId: data.jobId,
          reason: error.message
        });
      }
    }

    return results;
  }

  async update(id: string, updateData: Partial<SurveyReport>): Promise<SurveyReport> {
    await this.surveyRepository.update(id, updateData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const result = await this.surveyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Survey not found');
    }
  }
}