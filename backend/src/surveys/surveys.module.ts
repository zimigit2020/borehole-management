import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyReport } from './survey.entity';
import { SurveysService } from './surveys.service';
import { SurveysController } from './surveys.controller';
import { JobsModule } from '../jobs/jobs.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SurveyReport]),
    JobsModule,
    FilesModule,
  ],
  controllers: [SurveysController],
  providers: [SurveysService],
  exports: [SurveysService],
})
export class SurveysModule {}