import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from '../job.entity';
import { User, UserRole } from '../../users/user.entity';
import { UsersService } from '../../users/users.service';
import { AssignSurveyorDto } from '../dto/assign-surveyor.dto';
import { AssignDrillerDto, CompleteDrillingDto } from '../dto/update-job-status.dto';

@Injectable()
export class JobWorkflowService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    private usersService: UsersService,
  ) {}

  // Define valid status transitions
  private readonly validTransitions: Record<JobStatus, JobStatus[]> = {
    [JobStatus.CREATED]: [JobStatus.ASSIGNED],
    [JobStatus.ASSIGNED]: [JobStatus.SURVEYED, JobStatus.CREATED], // Can unassign
    [JobStatus.SURVEYED]: [JobStatus.DRILLING, JobStatus.ASSIGNED], // Can go back for re-survey
    [JobStatus.DRILLING]: [JobStatus.COMPLETED, JobStatus.SURVEYED], // Can go back if issues
    [JobStatus.COMPLETED]: [], // Terminal state
  };

  // Check if a transition is valid
  private isValidTransition(fromStatus: JobStatus, toStatus: JobStatus): boolean {
    return this.validTransitions[fromStatus]?.includes(toStatus) || false;
  }

  // Check if user has permission for this action
  private checkUserPermission(user: User, action: string): void {
    const permissions = {
      assign_surveyor: [UserRole.ADMIN, UserRole.PROJECT_MANAGER],
      assign_driller: [UserRole.ADMIN, UserRole.PROJECT_MANAGER],
      complete_survey: [UserRole.ADMIN, UserRole.SURVEYOR],
      start_drilling: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DRILLER],
      complete_drilling: [UserRole.ADMIN, UserRole.DRILLER],
    };

    const allowedRoles = permissions[action];
    if (!allowedRoles || !allowedRoles.includes(user.role)) {
      throw new ForbiddenException(`You don't have permission to ${action.replace('_', ' ')}`);
    }
  }

  // Assign surveyor to job
  async assignSurveyor(jobId: string, assignDto: AssignSurveyorDto, currentUser: User): Promise<Job> {
    this.checkUserPermission(currentUser, 'assign_surveyor');

    const job = await this.findJobWithRelations(jobId);
    
    if (job.status !== JobStatus.CREATED) {
      throw new BadRequestException(`Cannot assign surveyor to job in ${job.status} status`);
    }

    const surveyor = await this.usersService.findOne(assignDto.surveyorId);
    if (surveyor.role !== UserRole.SURVEYOR && surveyor.role !== UserRole.ADMIN) {
      throw new BadRequestException('Selected user is not a surveyor');
    }

    job.assignedSurveyor = surveyor;
    job.assignedSurveyorId = surveyor.id;
    job.assignedAt = new Date();
    job.status = JobStatus.ASSIGNED;

    await this.saveJobHistory(job, JobStatus.CREATED, JobStatus.ASSIGNED, currentUser, `Assigned to surveyor: ${surveyor.firstName} ${surveyor.lastName}`);
    
    return this.jobsRepository.save(job);
  }

  // Complete survey
  async completeSurvey(jobId: string, currentUser: User, notes?: string): Promise<Job> {
    this.checkUserPermission(currentUser, 'complete_survey');

    const job = await this.findJobWithRelations(jobId);
    
    if (job.status !== JobStatus.ASSIGNED) {
      throw new BadRequestException(`Cannot complete survey for job in ${job.status} status`);
    }

    // If current user is surveyor, they must be assigned to this job
    if (currentUser.role === UserRole.SURVEYOR && job.assignedSurveyorId !== currentUser.id) {
      throw new ForbiddenException('You are not assigned to this job');
    }

    job.status = JobStatus.SURVEYED;
    job.surveyCompletedAt = new Date();

    await this.saveJobHistory(job, JobStatus.ASSIGNED, JobStatus.SURVEYED, currentUser, notes || 'Survey completed');
    
    return this.jobsRepository.save(job);
  }

  // Assign driller and start drilling
  async assignDriller(jobId: string, assignDto: AssignDrillerDto, currentUser: User): Promise<Job> {
    this.checkUserPermission(currentUser, 'assign_driller');

    const job = await this.findJobWithRelations(jobId);
    
    if (job.status !== JobStatus.SURVEYED) {
      throw new BadRequestException(`Cannot assign driller to job in ${job.status} status. Survey must be completed first.`);
    }

    const driller = await this.usersService.findOne(assignDto.drillerId);
    if (driller.role !== UserRole.DRILLER && driller.role !== UserRole.ADMIN) {
      throw new BadRequestException('Selected user is not a driller');
    }

    job.assignedDriller = driller;
    job.assignedDrillerId = driller.id;
    job.status = JobStatus.DRILLING;

    await this.saveJobHistory(job, JobStatus.SURVEYED, JobStatus.DRILLING, currentUser, `Assigned to driller: ${driller.firstName} ${driller.lastName}. ${assignDto.notes || ''}`);
    
    return this.jobsRepository.save(job);
  }

  // Complete drilling
  async completeDrilling(jobId: string, completeDto: CompleteDrillingDto, currentUser: User): Promise<Job> {
    this.checkUserPermission(currentUser, 'complete_drilling');

    const job = await this.findJobWithRelations(jobId);
    
    if (job.status !== JobStatus.DRILLING) {
      throw new BadRequestException(`Cannot complete drilling for job in ${job.status} status`);
    }

    // If current user is driller, they must be assigned to this job
    if (currentUser.role === UserRole.DRILLER && job.assignedDrillerId !== currentUser.id) {
      throw new ForbiddenException('You are not assigned to this job');
    }

    job.status = JobStatus.COMPLETED;
    
    // Store drilling results in a JSON column (we'll add this to entity)
    const drillingResults = {
      finalDepth: completeDto.finalDepth,
      waterYield: completeDto.waterYield,
      isSuccessful: completeDto.isSuccessful,
      completedAt: new Date(),
      completedBy: currentUser.id,
    };

    // @ts-ignore - We'll add this column to the entity
    job.drillingResults = drillingResults;

    const historyNote = `Drilling completed. Depth: ${completeDto.finalDepth}m, Yield: ${completeDto.waterYield}L/hr, Success: ${completeDto.isSuccessful ? 'Yes' : 'No'}. ${completeDto.notes || ''}`;
    await this.saveJobHistory(job, JobStatus.DRILLING, JobStatus.COMPLETED, currentUser, historyNote);
    
    return this.jobsRepository.save(job);
  }

  // Move job back to previous status
  async revertStatus(jobId: string, reason: string, currentUser: User): Promise<Job> {
    const job = await this.findJobWithRelations(jobId);
    
    // Only admins and project managers can revert
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.PROJECT_MANAGER) {
      throw new ForbiddenException('Only administrators and project managers can revert job status');
    }

    const revertMap: Record<JobStatus, JobStatus> = {
      [JobStatus.ASSIGNED]: JobStatus.CREATED,
      [JobStatus.SURVEYED]: JobStatus.ASSIGNED,
      [JobStatus.DRILLING]: JobStatus.SURVEYED,
      [JobStatus.COMPLETED]: JobStatus.DRILLING,
      [JobStatus.CREATED]: JobStatus.CREATED, // Can't revert from created
    };

    const newStatus = revertMap[job.status];
    if (newStatus === job.status) {
      throw new BadRequestException('Cannot revert job in CREATED status');
    }

    const oldStatus = job.status;
    job.status = newStatus;

    // Clear assignments if reverting from assigned
    if (newStatus === JobStatus.CREATED) {
      job.assignedSurveyor = null;
      job.assignedSurveyorId = null;
      job.assignedAt = null;
    }

    // Clear drilling assignment if reverting from drilling
    if (oldStatus === JobStatus.DRILLING && newStatus === JobStatus.SURVEYED) {
      job.assignedDriller = null;
      job.assignedDrillerId = null;
    }

    await this.saveJobHistory(job, oldStatus, newStatus, currentUser, `Status reverted: ${reason}`);
    
    return this.jobsRepository.save(job);
  }

  // Get job workflow history
  async getJobHistory(jobId: string): Promise<any[]> {
    // We'll implement a separate JobHistory entity later
    // For now, return empty array
    return [];
  }

  // Helper to find job with all relations
  private async findJobWithRelations(jobId: string): Promise<Job> {
    const job = await this.jobsRepository.findOne({
      where: { id: jobId },
      relations: ['assignedSurveyor', 'assignedDriller'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  // Save job history (we'll implement JobHistory entity later)
  private async saveJobHistory(
    job: Job,
    fromStatus: JobStatus,
    toStatus: JobStatus,
    user: User,
    notes: string
  ): Promise<void> {
    // TODO: Implement JobHistory entity and save history
    console.log(`Job ${job.id}: ${fromStatus} -> ${toStatus} by ${user.email}. Notes: ${notes}`);
  }

  // Get jobs by status
  async getJobsByStatus(status: JobStatus): Promise<Job[]> {
    return this.jobsRepository.find({
      where: { status },
      relations: ['assignedSurveyor', 'assignedDriller'],
      order: { createdAt: 'DESC' },
    });
  }

  // Get jobs assigned to a user
  async getJobsAssignedToUser(userId: string): Promise<Job[]> {
    const user = await this.usersService.findOne(userId);
    
    if (user.role === UserRole.SURVEYOR) {
      return this.jobsRepository.find({
        where: { assignedSurveyorId: userId },
        relations: ['assignedSurveyor', 'assignedDriller'],
        order: { assignedAt: 'DESC' },
      });
    } else if (user.role === UserRole.DRILLER) {
      return this.jobsRepository.find({
        where: { assignedDrillerId: userId },
        relations: ['assignedSurveyor', 'assignedDriller'],
        order: { assignedAt: 'DESC' },
      });
    }

    return [];
  }

  // Get workflow statistics
  async getWorkflowStats(): Promise<any> {
    const jobs = await this.jobsRepository.find();
    
    const statusCounts = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<JobStatus, number>);

    const surveyorStats = await this.jobsRepository
      .createQueryBuilder('job')
      .select('job.assignedSurveyorId', 'surveyorId')
      .addSelect('COUNT(*)', 'count')
      .where('job.assignedSurveyorId IS NOT NULL')
      .groupBy('job.assignedSurveyorId')
      .getRawMany();

    const drillerStats = await this.jobsRepository
      .createQueryBuilder('job')
      .select('job.assignedDrillerId', 'drillerId')
      .addSelect('COUNT(*)', 'count')
      .where('job.assignedDrillerId IS NOT NULL')
      .groupBy('job.assignedDrillerId')
      .getRawMany();

    return {
      statusCounts,
      surveyorStats,
      drillerStats,
      totalJobs: jobs.length,
      completionRate: jobs.length > 0 ? (statusCounts[JobStatus.COMPLETED] || 0) / jobs.length : 0,
    };
  }
}