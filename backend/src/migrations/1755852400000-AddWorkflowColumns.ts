import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkflowColumns1755852400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to jobs table
    await queryRunner.query(`
      ALTER TABLE "jobs" 
      ADD COLUMN IF NOT EXISTS "drillingStartedAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "drillingCompletedAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "drillingResults" json,
      ADD COLUMN IF NOT EXISTS "surveyResults" json
    `);

    // Add columns to drilling_reports table if it exists
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'drilling_reports') THEN
          ALTER TABLE "drilling_reports" 
          ADD COLUMN IF NOT EXISTS "jobId" uuid,
          ADD COLUMN IF NOT EXISTS "drillerId" uuid,
          ADD COLUMN IF NOT EXISTS "drillingStartDate" DATE,
          ADD COLUMN IF NOT EXISTS "drillingEndDate" DATE,
          ADD COLUMN IF NOT EXISTS "drillingMethod" VARCHAR,
          ADD COLUMN IF NOT EXISTS "totalDepth" DECIMAL(10,2),
          ADD COLUMN IF NOT EXISTS "waterStruckDepth" DECIMAL(10,2),
          ADD COLUMN IF NOT EXISTS "staticWaterLevel" DECIMAL(10,2),
          ADD COLUMN IF NOT EXISTS "yieldRate" DECIMAL(10,2),
          ADD COLUMN IF NOT EXISTS "waterQuality" VARCHAR,
          ADD COLUMN IF NOT EXISTS "casingDepth" DECIMAL(10,2),
          ADD COLUMN IF NOT EXISTS "casingDiameter" VARCHAR,
          ADD COLUMN IF NOT EXISTS "casingMaterial" VARCHAR,
          ADD COLUMN IF NOT EXISTS "geologicalFormations" json,
          ADD COLUMN IF NOT EXISTS "rigType" VARCHAR,
          ADD COLUMN IF NOT EXISTS "compressorCapacity" VARCHAR,
          ADD COLUMN IF NOT EXISTS "mudPumpCapacity" VARCHAR,
          ADD COLUMN IF NOT EXISTS "pumpingTestDuration" DECIMAL(10,2),
          ADD COLUMN IF NOT EXISTS "pumpingTestYield" DECIMAL(10,2),
          ADD COLUMN IF NOT EXISTS "recoveryTime" DECIMAL(10,2),
          ADD COLUMN IF NOT EXISTS "drawdown" DECIMAL(10,2),
          ADD COLUMN IF NOT EXISTS "ph" DECIMAL(5,2),
          ADD COLUMN IF NOT EXISTS "tds" DECIMAL(10,2),
          ADD COLUMN IF NOT EXISTS "turbidity" DECIMAL(10,2),
          ADD COLUMN IF NOT EXISTS "temperature" DECIMAL(10,2),
          ADD COLUMN IF NOT EXISTS "bacteriologicalStatus" VARCHAR,
          ADD COLUMN IF NOT EXISTS "challengesEncountered" TEXT,
          ADD COLUMN IF NOT EXISTS "recommendations" TEXT,
          ADD COLUMN IF NOT EXISTS "isDryHole" BOOLEAN DEFAULT false,
          ADD COLUMN IF NOT EXISTS "dryHoleReason" VARCHAR,
          ADD COLUMN IF NOT EXISTS "pumpInstalled" BOOLEAN DEFAULT false,
          ADD COLUMN IF NOT EXISTS "pumpType" VARCHAR,
          ADD COLUMN IF NOT EXISTS "pumpBrand" VARCHAR,
          ADD COLUMN IF NOT EXISTS "pumpCapacity" VARCHAR,
          ADD COLUMN IF NOT EXISTS "photos" TEXT,
          ADD COLUMN IF NOT EXISTS "documents" TEXT,
          ADD COLUMN IF NOT EXISTS "actualLatitude" DECIMAL(10,8),
          ADD COLUMN IF NOT EXISTS "actualLongitude" DECIMAL(11,8),
          ADD COLUMN IF NOT EXISTS "status" VARCHAR DEFAULT 'draft',
          ADD COLUMN IF NOT EXISTS "approvedById" uuid,
          ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP,
          ADD COLUMN IF NOT EXISTS "approvalNotes" TEXT,
          ADD COLUMN IF NOT EXISTS "additionalNotes" TEXT,
          ADD COLUMN IF NOT EXISTS "clientRepresentativeName" VARCHAR,
          ADD COLUMN IF NOT EXISTS "clientSignature" VARCHAR,
          ADD COLUMN IF NOT EXISTS "clientSignedAt" TIMESTAMP,
          ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
    `);

    // Create drilling_reports table if it doesn't exist
    await queryRunner.query(`
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
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns from jobs table
    await queryRunner.query(`
      ALTER TABLE "jobs" 
      DROP COLUMN IF EXISTS "drillingStartedAt",
      DROP COLUMN IF EXISTS "drillingCompletedAt",
      DROP COLUMN IF EXISTS "drillingResults",
      DROP COLUMN IF EXISTS "surveyResults"
    `);

    // Drop drilling_reports table
    await queryRunner.query(`DROP TABLE IF EXISTS "drilling_reports"`);
  }
}