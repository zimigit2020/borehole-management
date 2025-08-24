import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { CalendarEvent, CalendarSyncSettings } from './entities/calendar-event.entity';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';
import { Installation } from '../installations/entities/installation.entity';
import { Invoice } from '../finance/entities/invoice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CalendarEvent,
      CalendarSyncSettings,
      User,
      Job,
      Installation,
      Invoice,
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}