import api from './api.service';
import { API_ENDPOINTS } from '../config/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'project_manager' | 'surveyor' | 'driller';
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'project_manager' | 'surveyor' | 'driller';
  phone?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'project_manager' | 'surveyor' | 'driller';
  phone?: string;
  isActive?: boolean;
}

class UsersService {
  async getAllUsers(): Promise<User[]> {
    try {
      return await api.get<User[]>(API_ENDPOINTS.USERS);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      return await api.get<User>(API_ENDPOINTS.USER_BY_ID(id));
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      return await api.post<User>(API_ENDPOINTS.USERS, userData);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    try {
      return await api.patch<User>(API_ENDPOINTS.USER_BY_ID(id), userData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.USER_BY_ID(id));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.filter(user => user.role === role);
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }
}

export default new UsersService();