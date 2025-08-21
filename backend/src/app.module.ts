import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { SurveysModule } from './surveys/surveys.module';
import { FilesModule } from './files/files.module';
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = process.env.NODE_ENV === 'production';
        const databaseUrl = configService.get('DATABASE_URL');
        
        // For DigitalOcean, we need to append SSL params to the URL
        const finalUrl = isProduction && databaseUrl && !databaseUrl.includes('sslmode=') 
          ? `${databaseUrl}?sslmode=require`
          : databaseUrl;
        
        return {
          type: 'postgres',
          url: finalUrl,
          autoLoadEntities: true,
          synchronize: false, // Never auto-sync in production
          logging: !isProduction,
          ssl: isProduction ? { rejectUnauthorized: false } : false,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    JobsModule,
    SurveysModule,
    FilesModule,
    SyncModule,
  ],
  controllers: [AppController],
})
export class AppModule {}