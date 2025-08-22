export const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

export const API_ENDPOINTS = {
  // Base
  BASE: '',
  
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  
  // Jobs
  JOBS: '/jobs',
  JOB_BY_ID: (id: string) => `/jobs/${id}`,
  JOB_ASSIGN: (id: string) => `/jobs/${id}/assign`,
  JOB_IMPORT: '/jobs/import',
  
  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  
  // Surveys
  SURVEYS: '/surveys',
  SURVEY_BY_JOB: (jobId: string) => `/surveys/job/${jobId}`,
  SURVEY_SYNC: '/surveys/sync',
  
  // Drilling Reports
  DRILLING_REPORTS: '/drilling-reports',
  DRILLING_REPORT_BY_ID: (id: string) => `/drilling-reports/${id}`,
  DRILLING_REPORT_BY_JOB: (jobId: string) => `/drilling-reports/job/${jobId}`,
  
  // Health
  HEALTH: '/health',
};