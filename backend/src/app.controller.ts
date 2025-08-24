import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: '2.0.1', // Updated with all modules
    };
  }

  @Get()
  @ApiOperation({ summary: 'API root' })
  getRoot() {
    return {
      name: 'Borehole Management API',
      version: '2.0.1',
      phase: 'Phase 1 - Complete',
      docs: '/api/docs',
      modules: [
        'auth', 'users', 'jobs', 'surveys', 'drilling',
        'inventory', 'installations', 'finance', 'calendar'
      ],
    };
  }
}