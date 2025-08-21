import api from './api.service';
import { API_ENDPOINTS } from '../config/api';

export interface Job {
  id: string;
  name: string;
  clientName: string;
  siteName: string;
  latitude: number;
  longitude: number;
  contactPerson: string;
  contactPhone: string;
  priority: 'low' | 'medium' | 'high';
  budgetUsd: number;
  status: 'pending' | 'surveyed' | 'drilling' | 'completed' | 'dry_hole';
  assignedSurveyorId?: string;
  assignedDrillerId?: string;
  surveyDate?: string;
  drillingDate?: string;
  completionDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobDto {
  name: string;
  clientName: string;
  siteName: string;
  latitude: number;
  longitude: number;
  contactPerson: string;
  contactPhone: string;
  priority: 'low' | 'medium' | 'high';
  budgetUsd: number;
  notes?: string;
}

export interface UpdateJobDto extends Partial<CreateJobDto> {
  status?: 'pending' | 'surveyed' | 'drilling' | 'completed' | 'dry_hole';
}

export interface AssignSurveyorDto {
  surveyorId: string;
}

class JobsService {
  async getAllJobs(): Promise<Job[]> {
    try {
      return await api.get<Job[]>(API_ENDPOINTS.JOBS);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }

  async getJobById(id: string): Promise<Job> {
    try {
      return await api.get<Job>(API_ENDPOINTS.JOB_BY_ID(id));
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  }

  async createJob(jobData: CreateJobDto): Promise<Job> {
    try {
      return await api.post<Job>(API_ENDPOINTS.JOBS, jobData);
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  async updateJob(id: string, jobData: UpdateJobDto): Promise<Job> {
    try {
      return await api.patch<Job>(API_ENDPOINTS.JOB_BY_ID(id), jobData);
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  async deleteJob(id: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.JOB_BY_ID(id));
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  async assignSurveyor(jobId: string, surveyorId: string): Promise<Job> {
    try {
      return await api.post<Job>(API_ENDPOINTS.JOB_ASSIGN(jobId), { surveyorId });
    } catch (error) {
      console.error('Error assigning surveyor:', error);
      throw error;
    }
  }

  async importJobsCSV(file: File): Promise<{ imported: number; failed: number }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await api.upload<{ imported: number; failed: number }>(API_ENDPOINTS.JOB_IMPORT, formData);
    } catch (error) {
      console.error('Error importing jobs:', error);
      throw error;
    }
  }
}

export default new JobsService();