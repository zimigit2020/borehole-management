const { Client } = require('pg');
require('dotenv').config();

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Adding new columns to jobs table...');
    
    // Add columns one by one to avoid errors if some already exist
    const columns = [
      `ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "drillingStartedAt" TIMESTAMP`,
      `ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "drillingCompletedAt" TIMESTAMP`,
      `ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "drillingResults" json`,
      `ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "surveyResults" json`
    ];

    for (const query of columns) {
      try {
        await client.query(query);
        console.log(`✓ Executed: ${query}`);
      } catch (error) {
        console.log(`⚠ Column might already exist or error: ${error.message}`);
      }
    }

    // Create drilling_reports table
    console.log('\nCreating drilling_reports table...');
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
      await client.query(createTableQuery);
      console.log('✓ Created drilling_reports table');
    } catch (error) {
      console.log(`⚠ Table might already exist or error: ${error.message}`);
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();