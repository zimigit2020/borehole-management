import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MigrationService } from './migration.service';
import { Job } from '../jobs/job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job])],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class DatabaseModule {}