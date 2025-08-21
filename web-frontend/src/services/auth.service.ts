import api from './api.service';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'project_manager' | 'surveyor' | 'driller';
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('Auth service login called with:', credentials);
    console.log('Login endpoint:', API_ENDPOINTS.LOGIN);
    console.log('API base URL:', API_BASE_URL);
    
    const response = await api.post<AuthResponse>(API_ENDPOINTS.LOGIN, credentials);
    console.log('Login response:', response);
    
    // Store token and user in localStorage
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  hasRole(requiredRole: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Admin has access to everything
    if (user.role === 'admin') return true;
    
    return user.role === requiredRole;
  }
}

export default new AuthService();