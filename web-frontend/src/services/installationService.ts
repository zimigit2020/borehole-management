import api from './api.service';

export interface Installation {
  id: string;
  jobId: string;
  job?: any;
  type: 'pump' | 'electrical' | 'plumbing' | 'tank' | 'complete_system';
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'on_hold';
  technicianId?: string;
  technician?: any;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  
  // Pump Details
  pumpType?: 'submersible' | 'surface' | 'jet' | 'hand_pump' | 'solar';
  pumpBrand?: string;
  pumpModel?: string;
  pumpSerialNumber?: string;
  pumpCapacity?: number;
  pumpPower?: number;
  pumpHead?: number;
  pumpWarrantyPeriod?: string;
  
  // Electrical Details
  controlPanelType?: string;
  cableType?: string;
  cableLength?: number;
  starterType?: string;
  protectionDevices?: string;
  
  // Plumbing Details
  pipeType?: string;
  pipeDiameter?: string;
  pipeLength?: number;
  fittingsUsed?: string;
  
  // Tank Details
  tankCapacity?: number;
  tankMaterial?: string;
  tankLocation?: string;
  tankElevation?: number;
  
  // Test Results
  flowRate?: number;
  pressure?: number;
  powerConsumption?: number;
  testSuccessful?: boolean;
  testNotes?: string;
  
  // Quality Checks
  electricalTestPassed?: boolean;
  pressureTestPassed?: boolean;
  leakTestPassed?: boolean;
  functionalTestPassed?: boolean;
  
  // Documentation
  photos?: string[];
  documents?: string[];
  warrantyDocument?: string;
  userManual?: string;
  
  // Client Acceptance
  clientRepresentativeName?: string;
  clientSignature?: string;
  clientSignedAt?: string;
  clientFeedback?: string;
  clientAccepted?: boolean;
  
  // Maintenance
  nextMaintenanceDate?: string;
  maintenanceInstructions?: string;
  
  // Additional Info
  issuesEncountered?: string;
  recommendations?: string;
  notes?: string;
  additionalDetails?: Record<string, any>;
  
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstallationDto {
  jobId: string;
  type: string;
  technicianId?: string;
  scheduledDate?: string;
  pumpType?: string;
  pumpBrand?: string;
  pumpModel?: string;
  pumpCapacity?: number;
  pumpPower?: number;
  tankCapacity?: number;
  tankMaterial?: string;
  notes?: string;
}

export interface CompleteInstallationDto {
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
}

class InstallationService {
  async getInstallations(filters?: {
    jobId?: string;
    technicianId?: string;
    status?: string;
    type?: string;
  }): Promise<Installation[]> {
    const params = new URLSearchParams();
    if (filters?.jobId) params.append('jobId', filters.jobId);
    if (filters?.technicianId) params.append('technicianId', filters.technicianId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    
    return api.get<Installation[]>(`/installations?${params.toString()}`);
  }

  async getInstallation(id: string): Promise<Installation> {
    return api.get<Installation>(`/installations/${id}`);
  }

  async createInstallation(data: CreateInstallationDto): Promise<Installation> {
    return api.post<Installation>('/installations', data);
  }

  async updateInstallation(id: string, data: Partial<CreateInstallationDto>): Promise<Installation> {
    return api.put<Installation>(`/installations/${id}`, data);
  }

  async deleteInstallation(id: string): Promise<void> {
    await api.delete(`/installations/${id}`);
  }

  async startInstallation(id: string): Promise<Installation> {
    return api.post<Installation>(`/installations/${id}/start`, {});
  }

  async completeInstallation(id: string, data: CompleteInstallationDto): Promise<Installation> {
    return api.post<Installation>(`/installations/${id}/complete`, data);
  }

  async putOnHold(id: string, reason: string): Promise<Installation> {
    return api.post<Installation>(`/installations/${id}/hold`, { reason });
  }

  async resume(id: string): Promise<Installation> {
    return api.post<Installation>(`/installations/${id}/resume`, {});
  }

  async getJobInstallations(jobId: string): Promise<Installation[]> {
    return api.get<Installation[]>(`/installations/job/${jobId}`);
  }

  async getTechnicianInstallations(technicianId: string): Promise<Installation[]> {
    return api.get<Installation[]>(`/installations/technician/${technicianId}`);
  }

  async getUpcomingInstallations(days: number = 7): Promise<Installation[]> {
    return api.get<Installation[]>(`/installations/upcoming?days=${days}`);
  }

  async getInstallationStats(): Promise<any> {
    return api.get<any>('/installations/stats');
  }
}

export default new InstallationService();