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
    };
  }

  @Get()
  @ApiOperation({ summary: 'API root' })
  getRoot() {
    return {
      name: 'Borehole Management API',
      version: '1.0.0',
      phase: 'Phase 1',
      docs: '/api/docs',
    };
  }
}