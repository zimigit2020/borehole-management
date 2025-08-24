import api from './api.service';

export interface Job {
  id: string;
  jobNumber: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  siteAddress: string;
  gpsLatitude: number;
  gpsLongitude: number;
  jobType: string;
  priority: string;
  status: string;
  surveyDate?: string;
  drillingDate?: string;
  installationDate?: string;
  assignedTeam?: string;
  assignedDriller?: string;
  estimatedDepth?: number;
  actualDepth?: number;
  waterYield?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

class JobsService {
  async getJobs(): Promise<Job[]> {
    return api.get<Job[]>('/jobs');
  }

  async getJob(id: string): Promise<Job> {
    return api.get<Job>(`/jobs/${id}`);
  }

  async createJob(data: Partial<Job>): Promise<Job> {
    return api.post<Job>('/jobs', data);
  }

  async updateJob(id: string, data: Partial<Job>): Promise<Job> {
    return api.put<Job>(`/jobs/${id}`, data);
  }

  async deleteJob(id: string): Promise<void> {
    await api.delete(`/jobs/${id}`);
  }

  async importJobs(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<any>('/jobs/import', formData);
  }
}

export default new JobsService();