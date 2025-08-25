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
          { name: 'quotedAmount', type: 'DECIMAL(10,2)' },
          { name: 'completedAt', type: 'TIMESTAMP' },
          { name: 'jobNumber', type: 'VARCHAR' },
          { name: 'clientId', type: 'VARCHAR' },
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

        // Update user roles enum to include new roles
        try {
          await queryRunner.query(`
            DO $$ 
            BEGIN
              -- Add new values to the user role enum
              ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'manager';
              ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'finance_manager';
              ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'inventory_manager';
              ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'technician';
            EXCEPTION
              WHEN duplicate_object THEN null;
            END $$;
          `);
          console.log('✓ Updated user roles enum');
        } catch (error) {
          console.log('⚠ User roles enum update might have failed:', error.message);
        }

        // Create calendar tables if they don't exist
        const createCalendarEventsTable = `
          DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'calendar_events_eventtype_enum') THEN
              CREATE TYPE "calendar_events_eventtype_enum" AS ENUM('drilling', 'survey', 'installation', 'maintenance', 'payment_due', 'invoice_follow_up', 'payment_milestone', 'stock_delivery', 'stock_reorder', 'equipment_return', 'inventory_audit', 'meeting', 'review', 'planning', 'reminder', 'deadline', 'other');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'calendar_events_status_enum') THEN
              CREATE TYPE "calendar_events_status_enum" AS ENUM('tentative', 'confirmed', 'cancelled', 'completed', 'in_progress');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'calendar_events_visibility_enum') THEN
              CREATE TYPE "calendar_events_visibility_enum" AS ENUM('public', 'private', 'role_based', 'management');
            END IF;
          END $$;
          
          CREATE TABLE IF NOT EXISTS "calendar_events" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "title" VARCHAR NOT NULL,
            "description" TEXT,
            "eventType" "calendar_events_eventtype_enum" NOT NULL DEFAULT 'other',
            "status" "calendar_events_status_enum" NOT NULL DEFAULT 'confirmed',
            "visibility" "calendar_events_visibility_enum" NOT NULL DEFAULT 'public',
            "startDate" TIMESTAMP NOT NULL,
            "endDate" TIMESTAMP NOT NULL,
            "allDay" BOOLEAN DEFAULT false,
            "location" VARCHAR,
            "gpsCoordinates" jsonb,
            "color" VARCHAR,
            "recurrenceRule" VARCHAR,
            "recurrenceId" VARCHAR,
            "reminders" jsonb,
            "allowedRoles" text[],
            "requiredRoles" text[],
            "metadata" jsonb,
            "conflictsWith" text[],
            "hasConflict" BOOLEAN DEFAULT false,
            "googleEventId" VARCHAR,
            "appleEventId" VARCHAR,
            "outlookEventId" VARCHAR,
            "lastSyncedAt" TIMESTAMP,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "deletedAt" TIMESTAMP,
            "createdById" uuid,
            "jobId" uuid,
            "installationId" uuid,
            "invoiceId" uuid
          )
        `;

        const createCalendarSyncSettingsTable = `
          DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'calendar_sync_settings_syncdirection_enum') THEN
              CREATE TYPE "calendar_sync_settings_syncdirection_enum" AS ENUM('one-way', 'two-way');
            END IF;
          END $$;
          
          CREATE TABLE IF NOT EXISTS "calendar_sync_settings" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "syncEnabled" BOOLEAN DEFAULT false,
            "syncDirection" "calendar_sync_settings_syncdirection_enum" DEFAULT 'one-way',
            "googleCalendar" jsonb,
            "appleCalendar" jsonb,
            "outlookCalendar" jsonb,
            "syncPreferences" jsonb,
            "syncRules" jsonb,
            "caldavToken" VARCHAR,
            "lastSyncedAt" TIMESTAMP,
            "lastSyncError" TEXT,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "userId" uuid UNIQUE
          )
        `;

        try {
          await queryRunner.query(createCalendarEventsTable);
          console.log('✓ Created calendar_events table');
        } catch (error) {
          console.log('⚠ calendar_events table might already exist');
        }

        try {
          await queryRunner.query(createCalendarSyncSettingsTable);
          console.log('✓ Created calendar_sync_settings table');
        } catch (error) {
          console.log('⚠ calendar_sync_settings table might already exist');
        }

        // Create exchange_rates table if it doesn't exist
        const createExchangeRatesTable = `
          CREATE TABLE IF NOT EXISTS "exchange_rates" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "fromCurrency" VARCHAR NOT NULL,
            "toCurrency" VARCHAR NOT NULL,
            "rate" DECIMAL(10,6) NOT NULL,
            "effectiveDate" TIMESTAMP NOT NULL,
            "source" VARCHAR,
            "createdById" uuid,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE("fromCurrency", "toCurrency", "effectiveDate")
          )
        `;

        try {
          await queryRunner.query(createExchangeRatesTable);
          console.log('✓ Created exchange_rates table');
        } catch (error) {
          console.log('⚠ exchange_rates table might already exist');
        }

        // Create expenses table if it doesn't exist
        const createExpensesTable = `
          DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expenses_category_enum') THEN
              CREATE TYPE "expenses_category_enum" AS ENUM('fuel', 'materials', 'labor', 'equipment', 'transport', 'accommodation', 'meals', 'office_supplies', 'utilities', 'maintenance', 'insurance', 'permits', 'professional_fees', 'marketing', 'miscellaneous');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expenses_status_enum') THEN
              CREATE TYPE "expenses_status_enum" AS ENUM('pending', 'approved', 'rejected', 'reimbursed');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expenses_paymentmethod_enum') THEN
              CREATE TYPE "expenses_paymentmethod_enum" AS ENUM('cash', 'credit_card', 'debit_card', 'bank_transfer', 'cheque', 'mobile_money', 'company_card', 'personal_expense');
            END IF;
          END $$;
          
          CREATE TABLE IF NOT EXISTS "expenses" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "description" VARCHAR NOT NULL,
            "category" "expenses_category_enum" NOT NULL,
            "amount" DECIMAL(10,2) NOT NULL,
            "currency" VARCHAR DEFAULT 'USD',
            "exchangeRate" DECIMAL(10,6) DEFAULT 1,
            "amountInBaseCurrency" DECIMAL(10,2) NOT NULL,
            "expenseDate" TIMESTAMP NOT NULL,
            "paymentMethod" "expenses_paymentmethod_enum",
            "vendor" VARCHAR,
            "vendorInvoiceNumber" VARCHAR,
            "receiptNumber" VARCHAR,
            "jobId" uuid,
            "notes" TEXT,
            "tags" text[],
            "status" "expenses_status_enum" NOT NULL DEFAULT 'pending',
            "submittedById" uuid NOT NULL,
            "submittedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "approvedById" uuid,
            "approvedAt" TIMESTAMP,
            "approvalNotes" TEXT,
            "rejectedById" uuid,
            "rejectedAt" TIMESTAMP,
            "rejectionReason" TEXT,
            "isRecurring" BOOLEAN DEFAULT false,
            "recurringFrequency" VARCHAR,
            "requiresReimbursement" BOOLEAN DEFAULT false,
            "reimbursedAt" TIMESTAMP,
            "reimbursementReference" VARCHAR,
            "attachments" TEXT,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;

        try {
          await queryRunner.query(createExpensesTable);
          console.log('✓ Created expenses table');
        } catch (error) {
          console.log('⚠ expenses table might already exist');
        }

        // Create todos table if it doesn't exist
        const createTodosTable = `
          CREATE TABLE IF NOT EXISTS "todos" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "title" VARCHAR NOT NULL,
            "description" TEXT,
            "status" VARCHAR DEFAULT 'pending',
            "priority" VARCHAR DEFAULT 'medium',
            "dueDate" TIMESTAMP,
            "completedAt" TIMESTAMP,
            "assignedToId" uuid,
            "createdById" uuid NOT NULL,
            "jobId" uuid,
            "tags" text[],
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL,
            FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE,
            FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE
          )
        `;

        try {
          await queryRunner.query(createTodosTable);
          console.log('✓ Created todos table');
        } catch (error) {
          console.log('⚠ todos table might already exist');
        }

        // Create purchase order tables if they don't exist
        const createPurchaseOrdersTable = `
          DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'purchase_orders_status_enum') THEN
              CREATE TYPE "purchase_orders_status_enum" AS ENUM('draft', 'pending_approval', 'approved', 'rejected', 'sent', 'partially_received', 'received', 'cancelled', 'closed');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'purchase_orders_priority_enum') THEN
              CREATE TYPE "purchase_orders_priority_enum" AS ENUM('low', 'normal', 'high', 'urgent');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'purchase_orders_paymentterms_enum') THEN
              CREATE TYPE "purchase_orders_paymentterms_enum" AS ENUM('net_30', 'net_60', 'net_90', 'due_on_receipt', 'cash_on_delivery', 'prepaid', 'custom');
            END IF;
          END $$;
          
          CREATE TABLE IF NOT EXISTS "purchase_orders" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "orderNumber" VARCHAR UNIQUE NOT NULL,
            "status" "purchase_orders_status_enum" DEFAULT 'draft',
            "priority" "purchase_orders_priority_enum" DEFAULT 'normal',
            "supplier" VARCHAR NOT NULL,
            "supplierContact" VARCHAR,
            "supplierEmail" VARCHAR,
            "supplierPhone" VARCHAR,
            "supplierAddress" VARCHAR,
            "orderDate" TIMESTAMP NOT NULL,
            "expectedDeliveryDate" TIMESTAMP,
            "actualDeliveryDate" TIMESTAMP,
            "deliveryLocation" VARCHAR,
            "paymentTerms" "purchase_orders_paymentterms_enum" DEFAULT 'net_30',
            "customPaymentTerms" VARCHAR,
            "subtotal" DECIMAL(10,2) DEFAULT 0,
            "taxRate" DECIMAL(5,2) DEFAULT 0,
            "taxAmount" DECIMAL(10,2) DEFAULT 0,
            "shippingCost" DECIMAL(10,2) DEFAULT 0,
            "discountAmount" DECIMAL(10,2) DEFAULT 0,
            "totalAmount" DECIMAL(10,2) DEFAULT 0,
            "currency" VARCHAR DEFAULT 'USD',
            "notes" TEXT,
            "internalNotes" TEXT,
            "termsAndConditions" TEXT,
            "jobId" VARCHAR,
            "projectCode" VARCHAR,
            "costCenter" VARCHAR,
            "createdById" VARCHAR NOT NULL,
            "approvedById" VARCHAR,
            "approvedAt" TIMESTAMP,
            "approvalNotes" TEXT,
            "rejectedById" VARCHAR,
            "rejectedAt" TIMESTAMP,
            "rejectionReason" TEXT,
            "sentAt" TIMESTAMP,
            "receivedById" VARCHAR,
            "receivedAt" TIMESTAMP,
            "receivingNotes" TEXT,
            "invoiceNumber" VARCHAR,
            "invoiceDate" TIMESTAMP,
            "invoiceAmount" DECIMAL(10,2),
            "attachments" VARCHAR,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;

        const createPurchaseOrderItemsTable = `
          CREATE TABLE IF NOT EXISTS "purchase_order_items" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "purchaseOrderId" VARCHAR NOT NULL,
            "inventoryItemId" VARCHAR,
            "sku" VARCHAR NOT NULL,
            "description" VARCHAR NOT NULL,
            "specifications" VARCHAR,
            "quantity" DECIMAL(10,2) NOT NULL,
            "unit" VARCHAR DEFAULT 'piece',
            "unitPrice" DECIMAL(10,2) NOT NULL,
            "totalPrice" DECIMAL(10,2) NOT NULL,
            "discountPercent" DECIMAL(5,2),
            "discountAmount" DECIMAL(10,2),
            "receivedQuantity" DECIMAL(10,2) DEFAULT 0,
            "receivedDate" TIMESTAMP,
            "receivedBy" VARCHAR,
            "notes" TEXT,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE
          )
        `;

        try {
          await queryRunner.query(createPurchaseOrdersTable);
          console.log('✓ Created purchase_orders table');
        } catch (error) {
          console.log('⚠ purchase_orders table might already exist');
        }

        try {
          await queryRunner.query(createPurchaseOrderItemsTable);
          console.log('✓ Created purchase_order_items table');
        } catch (error) {
          console.log('⚠ purchase_order_items table might already exist');
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