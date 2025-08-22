import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrillingReport } from './drilling-report.entity';
import { DrillingReportsService } from './drilling-reports.service';
import { DrillingReportsController } from './drilling-reports.controller';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DrillingReport]),
    JobsModule,
  ],
  controllers: [DrillingReportsController],
  providers: [DrillingReportsService],
  exports: [DrillingReportsService],
})
export class DrillingReportsModule {}