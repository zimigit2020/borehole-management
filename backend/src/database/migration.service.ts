import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../jobs/job.entity';

@Injectable()
export class MigrationService implements OnModuleInit {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
  ) {}

  async onModuleInit() {
    try {
      console.log('Running database migrations...');
      
      // Get the query runner
      const queryRunner = this.jobsRepository.manager.connection.createQueryRunner();
      
      // Connect
      await queryRunner.connect();
      
      try {
        // Add columns to jobs table if they don't exist
        const jobColumns = [
          { name: 'drillingStartedAt', type: 'TIMESTAMP' },
          { name: 'drillingCompletedAt', type: 'TIMESTAMP' },
          { name: 'drillingResults', type: 'json' },
          { name: 'surveyResults', type: 'json' },
        ];

        for (const column of jobColumns) {
          try {
            await queryRunner.query(
              `ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "${column.name}" ${column.type}`
            );
            console.log(`✓ Added column ${column.name} to jobs table`);
          } catch (error) {
            // Column might already exist, that's ok
            console.log(`⚠ Column ${column.name} might already exist`);
          }
        }

        // Create drilling_reports table if it doesn't exist
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS "drilling_reports" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "jobId" uuid NOT NULL,
            "drillerId" uuid NOT NULL,
            "drillingStartDate" DATE,
            "drillingEndDate" DATE,
            "drillingMethod" VARCHAR,
            "totalDepth" DECIMAL(10,2),
            "waterStruckDepth" DECIMAL(10,2),
            "staticWaterLevel" DECIMAL(10,2),
            "yieldRate" DECIMAL(10,2),
            "waterQuality" VARCHAR,
            "casingDepth" DECIMAL(10,2),
            "casingDiameter" VARCHAR,
            "casingMaterial" VARCHAR,
            "geologicalFormations" json,
            "rigType" VARCHAR,
            "compressorCapacity" VARCHAR,
            "mudPumpCapacity" VARCHAR,
            "pumpingTestDuration" DECIMAL(10,2),
            "pumpingTestYield" DECIMAL(10,2),
            "recoveryTime" DECIMAL(10,2),
            "drawdown" DECIMAL(10,2),
            "ph" DECIMAL(5,2),
            "tds" DECIMAL(10,2),
            "turbidity" DECIMAL(10,2),
            "temperature" DECIMAL(10,2),
            "bacteriologicalStatus" VARCHAR,
            "challengesEncountered" TEXT,
            "recommendations" TEXT,
            "isDryHole" BOOLEAN DEFAULT false,
            "dryHoleReason" VARCHAR,
            "pumpInstalled" BOOLEAN DEFAULT false,
            "pumpType" VARCHAR,
            "pumpBrand" VARCHAR,
            "pumpCapacity" VARCHAR,
            "photos" TEXT,
            "documents" TEXT,
            "actualLatitude" DECIMAL(10,8),
            "actualLongitude" DECIMAL(11,8),
            "status" VARCHAR DEFAULT 'draft',
            "approvedById" uuid,
            "approvedAt" TIMESTAMP,
            "approvalNotes" TEXT,
            "additionalNotes" TEXT,
            "clientRepresentativeName" VARCHAR,
            "clientSignature" VARCHAR,
            "clientSignedAt" TIMESTAMP,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;

        try {
          await queryRunner.query(createTableQuery);
          console.log('✓ Created drilling_reports table');
        } catch (error) {
          console.log('⚠ drilling_reports table might already exist');
        }

        console.log('✅ Database migrations completed');
      } finally {
        // Release the query runner
        await queryRunner.release();
      }
    } catch (error) {
      console.error('Migration error:', error);
      // Don't fail the app startup, just log the error
    }
  }
}