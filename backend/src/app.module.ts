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
import { DrillingReportsModule } from './drilling-reports/drilling-reports.module';

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
        
        // Use DATABASE_URL directly - TLS is handled at process level
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: false,
            logging: !isProduction,
            ssl: isProduction, // Simple boolean for production
          };
        }
        
        // Fallback configuration
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get('DB_PORT', 5432),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', 'postgres'),
          database: configService.get('DB_NAME', 'borehole'),
          autoLoadEntities: true,
          synchronize: false,
          logging: !isProduction,
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
    DrillingReportsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}