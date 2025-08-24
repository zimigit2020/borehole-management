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

        // Create inventory tables if they don't exist
        const createInventoryItemsTable = `
          CREATE TABLE IF NOT EXISTS "inventory_items" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "sku" VARCHAR UNIQUE NOT NULL,
            "name" VARCHAR NOT NULL,
            "description" VARCHAR,
            "category" VARCHAR NOT NULL,
            "unit" VARCHAR DEFAULT 'piece',
            "quantityInStock" DECIMAL(10,2) DEFAULT 0,
            "reservedQuantity" DECIMAL(10,2) DEFAULT 0,
            "availableQuantity" DECIMAL(10,2) DEFAULT 0,
            "minimumStock" DECIMAL(10,2) DEFAULT 0,
            "reorderPoint" DECIMAL(10,2) DEFAULT 0,
            "reorderQuantity" DECIMAL(10,2) DEFAULT 0,
            "unitCost" DECIMAL(10,2) DEFAULT 0,
            "totalValue" DECIMAL(10,2) DEFAULT 0,
            "supplier" VARCHAR,
            "supplierContact" VARCHAR,
            "manufacturer" VARCHAR,
            "model" VARCHAR,
            "serialNumber" VARCHAR,
            "location" VARCHAR,
            "shelfNumber" VARCHAR,
            "lastRestockDate" TIMESTAMP,
            "expiryDate" TIMESTAMP,
            "isActive" BOOLEAN DEFAULT true,
            "images" TEXT,
            "specifications" json,
            "notes" VARCHAR,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;

        const createInventoryMovementsTable = `
          CREATE TABLE IF NOT EXISTS "inventory_movements" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "itemId" uuid NOT NULL,
            "type" VARCHAR NOT NULL,
            "quantity" DECIMAL(10,2) NOT NULL,
            "unitCost" DECIMAL(10,2),
            "totalCost" DECIMAL(10,2),
            "userId" uuid,
            "jobId" uuid,
            "fromLocation" VARCHAR,
            "toLocation" VARCHAR,
            "reference" VARCHAR,
            "supplier" VARCHAR,
            "reason" VARCHAR,
            "notes" VARCHAR,
            "previousStock" DECIMAL(10,2),
            "newStock" DECIMAL(10,2),
            "isReversed" BOOLEAN DEFAULT false,
            "reversedBy" VARCHAR,
            "reversedAt" TIMESTAMP,
            "reversalReason" VARCHAR,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;

        try {
          await queryRunner.query(createInventoryItemsTable);
          console.log('✓ Created inventory_items table');
        } catch (error) {
          console.log('⚠ inventory_items table might already exist');
        }

        try {
          await queryRunner.query(createInventoryMovementsTable);
          console.log('✓ Created inventory_movements table');
        } catch (error) {
          console.log('⚠ inventory_movements table might already exist');
        }

        // Create installations table if it doesn't exist
        const createInstallationsTable = `
          CREATE TABLE IF NOT EXISTS "installations" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "jobId" uuid NOT NULL,
            "type" VARCHAR NOT NULL,
            "status" VARCHAR DEFAULT 'scheduled',
            "technicianId" uuid,
            "scheduledDate" TIMESTAMP,
            "startedAt" TIMESTAMP,
            "completedAt" TIMESTAMP,
            "pumpType" VARCHAR,
            "pumpBrand" VARCHAR,
            "pumpModel" VARCHAR,
            "pumpSerialNumber" VARCHAR,
            "pumpCapacity" DECIMAL(10,2),
            "pumpPower" DECIMAL(10,2),
            "pumpHead" DECIMAL(10,2),
            "pumpWarrantyPeriod" VARCHAR,
            "controlPanelType" VARCHAR,
            "cableType" VARCHAR,
            "cableLength" DECIMAL(10,2),
            "starterType" VARCHAR,
            "protectionDevices" VARCHAR,
            "pipeType" VARCHAR,
            "pipeDiameter" VARCHAR,
            "pipeLength" DECIMAL(10,2),
            "fittingsUsed" VARCHAR,
            "tankCapacity" DECIMAL(10,2),
            "tankMaterial" VARCHAR,
            "tankLocation" VARCHAR,
            "tankElevation" DECIMAL(10,2),
            "flowRate" DECIMAL(10,2),
            "pressure" DECIMAL(10,2),
            "powerConsumption" DECIMAL(10,2),
            "testSuccessful" BOOLEAN DEFAULT false,
            "testNotes" VARCHAR,
            "electricalTestPassed" BOOLEAN DEFAULT false,
            "pressureTestPassed" BOOLEAN DEFAULT false,
            "leakTestPassed" BOOLEAN DEFAULT false,
            "functionalTestPassed" BOOLEAN DEFAULT false,
            "photos" TEXT,
            "documents" TEXT,
            "warrantyDocument" VARCHAR,
            "userManual" VARCHAR,
            "clientRepresentativeName" VARCHAR,
            "clientSignature" VARCHAR,
            "clientSignedAt" TIMESTAMP,
            "clientFeedback" VARCHAR,
            "clientAccepted" BOOLEAN DEFAULT false,
            "nextMaintenanceDate" TIMESTAMP,
            "maintenanceInstructions" VARCHAR,
            "issuesEncountered" VARCHAR,
            "recommendations" VARCHAR,
            "notes" VARCHAR,
            "additionalDetails" json,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;

        try {
          await queryRunner.query(createInstallationsTable);
          console.log('✓ Created installations table');
        } catch (error) {
          console.log('⚠ installations table might already exist');
        }

        // Create finance tables if they don't exist
        const createInvoicesTable = `
          CREATE TABLE IF NOT EXISTS "invoices" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "invoiceNumber" VARCHAR UNIQUE NOT NULL,
            "jobId" uuid NOT NULL,
            "clientName" VARCHAR NOT NULL,
            "clientAddress" VARCHAR NOT NULL,
            "clientEmail" VARCHAR,
            "clientPhone" VARCHAR,
            "clientTaxId" VARCHAR,
            "status" VARCHAR DEFAULT 'draft',
            "issueDate" TIMESTAMP NOT NULL,
            "dueDate" TIMESTAMP NOT NULL,
            "subtotal" DECIMAL(10,2) DEFAULT 0,
            "taxRate" DECIMAL(5,2) DEFAULT 0,
            "taxAmount" DECIMAL(10,2) DEFAULT 0,
            "discountAmount" DECIMAL(10,2) DEFAULT 0,
            "totalAmount" DECIMAL(10,2) DEFAULT 0,
            "paidAmount" DECIMAL(10,2) DEFAULT 0,
            "balanceDue" DECIMAL(10,2) DEFAULT 0,
            "currency" VARCHAR,
            "paymentTerms" VARCHAR,
            "notes" VARCHAR,
            "termsAndConditions" VARCHAR,
            "createdById" uuid NOT NULL,
            "sentAt" TIMESTAMP,
            "paidAt" TIMESTAMP,
            "cancelledAt" TIMESTAMP,
            "cancellationReason" VARCHAR,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;

        const createInvoiceItemsTable = `
          CREATE TABLE IF NOT EXISTS "invoice_items" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "invoiceId" uuid NOT NULL REFERENCES "invoices"(id) ON DELETE CASCADE,
            "description" VARCHAR NOT NULL,
            "quantity" DECIMAL(10,2) NOT NULL,
            "unit" VARCHAR NOT NULL,
            "unitPrice" DECIMAL(10,2) NOT NULL,
            "totalPrice" DECIMAL(10,2) NOT NULL,
            "category" VARCHAR,
            "referenceId" VARCHAR,
            "notes" VARCHAR,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;

        const createPaymentsTable = `
          CREATE TABLE IF NOT EXISTS "payments" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "invoiceId" uuid NOT NULL,
            "paymentNumber" VARCHAR NOT NULL,
            "amount" DECIMAL(10,2) NOT NULL,
            "method" VARCHAR NOT NULL,
            "paymentDate" TIMESTAMP NOT NULL,
            "referenceNumber" VARCHAR,
            "bankName" VARCHAR,
            "accountNumber" VARCHAR,
            "notes" VARCHAR,
            "recordedById" uuid NOT NULL,
            "isVerified" BOOLEAN DEFAULT false,
            "verifiedAt" TIMESTAMP,
            "verifiedById" uuid,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;

        try {
          await queryRunner.query(createInvoicesTable);
          console.log('✓ Created invoices table');
        } catch (error) {
          console.log('⚠ invoices table might already exist');
        }

        try {
          await queryRunner.query(createInvoiceItemsTable);
          console.log('✓ Created invoice_items table');
        } catch (error) {
          console.log('⚠ invoice_items table might already exist');
        }

        try {
          await queryRunner.query(createPaymentsTable);
          console.log('✓ Created payments table');
        } catch (error) {
          console.log('⚠ payments table might already exist');
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