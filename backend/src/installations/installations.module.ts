import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallationsController } from './installations.controller';
import { InstallationsService } from './installations.service';
import { Installation } from './entities/installation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Installation]),
  ],
  controllers: [InstallationsController],
  providers: [InstallationsService],
  exports: [InstallationsService],
})
export class InstallationsModule {}