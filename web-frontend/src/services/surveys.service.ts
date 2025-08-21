import api from './api.service';
import { API_ENDPOINTS } from '../config/api';

export interface Survey {
  id: string;
  jobId: string;
  surveyorId: string;
  siteName: string;
  constituency: string;
  ward: string;
  latitude: number;
  longitude: number;
  contactPerson?: string;
  contactPhone?: string;
  geology: string;
  surveyMethod: string;
  minDrillingDepth: number;
  maxDrillingDepth: number;
  expectedWaterBreaks: number[];
  recommendations: string;
  specialNotes?: string;
  disclaimer?: string;
  resistivityGraphUrl?: string;
  sitePhotos: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface CreateSurveyDto {
  jobId: string;
  surveyorId: string;
  siteName: string;
  constituency: string;
  ward: string;
  latitude: number;
  longitude: number;
  contactPerson?: string;
  contactPhone?: string;
  geology: string;
  surveyMethod: string;
  minDrillingDepth: number;
  maxDrillingDepth: number;
  expectedWaterBreaks: number[];
  recommendations: string;
  specialNotes?: string;
  disclaimer?: string;
}

export interface SyncSurveyDto extends CreateSurveyDto {
  localId: string;
  createdAt: string;
  updatedAt: string;
}

class SurveysService {
  async getAllSurveys(): Promise<Survey[]> {
    try {
      return await api.get<Survey[]>(API_ENDPOINTS.SURVEYS);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      throw error;
    }
  }

  async getSurveysByJob(jobId: string): Promise<Survey[]> {
    try {
      return await api.get<Survey[]>(API_ENDPOINTS.SURVEY_BY_JOB(jobId));
    } catch (error) {
      console.error('Error fetching surveys for job:', error);
      throw error;
    }
  }

  async createSurvey(surveyData: CreateSurveyDto): Promise<Survey> {
    try {
      return await api.post<Survey>(API_ENDPOINTS.SURVEYS, surveyData);
    } catch (error) {
      console.error('Error creating survey:', error);
      throw error;
    }
  }

  async approveSurvey(id: string): Promise<Survey> {
    try {
      return await api.patch<Survey>(`${API_ENDPOINTS.SURVEYS}/${id}/approve`, {});
    } catch (error) {
      console.error('Error approving survey:', error);
      throw error;
    }
  }

  async rejectSurvey(id: string, reason?: string): Promise<Survey> {
    try {
      return await api.patch<Survey>(`${API_ENDPOINTS.SURVEYS}/${id}/reject`, { reason });
    } catch (error) {
      console.error('Error rejecting survey:', error);
      throw error;
    }
  }

  async syncSurveys(surveys: SyncSurveyDto[]): Promise<{ synced: number; failed: number }> {
    try {
      return await api.post<{ synced: number; failed: number }>(API_ENDPOINTS.SURVEY_SYNC, { surveys });
    } catch (error) {
      console.error('Error syncing surveys:', error);
      throw error;
    }
  }

  async uploadSurveyImage(surveyId: string, file: File, type: 'resistivity' | 'site'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      const response = await api.upload<{ url: string }>(`${API_ENDPOINTS.SURVEYS}/${surveyId}/upload`, formData);
      return response.url;
    } catch (error) {
      console.error('Error uploading survey image:', error);
      throw error;
    }
  }
}

export default new SurveysService();