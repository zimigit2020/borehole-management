import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCalendarEntities1706000000005 implements MigrationInterface {
    name = 'AddCalendarEntities1706000000005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create calendar_events table
        await queryRunner.query(`
            CREATE TYPE "public"."calendar_events_eventtype_enum" AS ENUM('drilling', 'survey', 'installation', 'maintenance', 'payment_due', 'invoice_follow_up', 'payment_milestone', 'stock_delivery', 'stock_reorder', 'equipment_return', 'inventory_audit', 'meeting', 'review', 'planning', 'reminder', 'deadline', 'other')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."calendar_events_status_enum" AS ENUM('tentative', 'confirmed', 'cancelled', 'completed', 'in_progress')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."calendar_events_visibility_enum" AS ENUM('public', 'private', 'role_based', 'management')
        `);
        
        await queryRunner.query(`
            CREATE TABLE "calendar_events" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text,
                "eventType" "public"."calendar_events_eventtype_enum" NOT NULL DEFAULT 'other',
                "status" "public"."calendar_events_status_enum" NOT NULL DEFAULT 'confirmed',
                "visibility" "public"."calendar_events_visibility_enum" NOT NULL DEFAULT 'public',
                "startDate" TIMESTAMP NOT NULL,
                "endDate" TIMESTAMP NOT NULL,
                "allDay" boolean NOT NULL DEFAULT false,
                "location" character varying,
                "gpsCoordinates" jsonb,
                "color" character varying,
                "recurrenceRule" character varying,
                "recurrenceId" character varying,
                "reminders" jsonb,
                "allowedRoles" text array,
                "requiredRoles" text array,
                "metadata" jsonb,
                "conflictsWith" text array,
                "hasConflict" boolean NOT NULL DEFAULT false,
                "googleEventId" character varying,
                "appleEventId" character varying,
                "outlookEventId" character varying,
                "lastSyncedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "createdById" uuid,
                "jobId" uuid,
                "installationId" uuid,
                "invoiceId" uuid,
                CONSTRAINT "PK_calendar_events" PRIMARY KEY ("id")
            )
        `);

        // Create calendar_sync_settings table
        await queryRunner.query(`
            CREATE TYPE "public"."calendar_sync_settings_syncdirection_enum" AS ENUM('one-way', 'two-way')
        `);
        
        await queryRunner.query(`
            CREATE TABLE "calendar_sync_settings" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "syncEnabled" boolean NOT NULL DEFAULT false,
                "syncDirection" "public"."calendar_sync_settings_syncdirection_enum" NOT NULL DEFAULT 'one-way',
                "googleCalendar" jsonb,
                "appleCalendar" jsonb,
                "outlookCalendar" jsonb,
                "syncPreferences" jsonb,
                "syncRules" jsonb,
                "caldavToken" character varying,
                "lastSyncedAt" TIMESTAMP,
                "lastSyncError" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                CONSTRAINT "PK_calendar_sync_settings" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_calendar_sync_settings_userId" UNIQUE ("userId")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "calendar_events" 
            ADD CONSTRAINT "FK_calendar_events_createdBy" 
            FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "calendar_events" 
            ADD CONSTRAINT "FK_calendar_events_job" 
            FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "calendar_events" 
            ADD CONSTRAINT "FK_calendar_events_installation" 
            FOREIGN KEY ("installationId") REFERENCES "installations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "calendar_events" 
            ADD CONSTRAINT "FK_calendar_events_invoice" 
            FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "calendar_sync_settings" 
            ADD CONSTRAINT "FK_calendar_sync_settings_user" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_calendar_events_startDate" ON "calendar_events" ("startDate")`);
        await queryRunner.query(`CREATE INDEX "IDX_calendar_events_endDate" ON "calendar_events" ("endDate")`);
        await queryRunner.query(`CREATE INDEX "IDX_calendar_events_eventType" ON "calendar_events" ("eventType")`);
        await queryRunner.query(`CREATE INDEX "IDX_calendar_events_status" ON "calendar_events" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_calendar_events_createdById" ON "calendar_events" ("createdById")`);
        await queryRunner.query(`CREATE INDEX "IDX_calendar_events_jobId" ON "calendar_events" ("jobId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_calendar_events_jobId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_calendar_events_createdById"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_calendar_events_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_calendar_events_eventType"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_calendar_events_endDate"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_calendar_events_startDate"`);

        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "calendar_sync_settings" DROP CONSTRAINT "FK_calendar_sync_settings_user"`);
        await queryRunner.query(`ALTER TABLE "calendar_events" DROP CONSTRAINT "FK_calendar_events_invoice"`);
        await queryRunner.query(`ALTER TABLE "calendar_events" DROP CONSTRAINT "FK_calendar_events_installation"`);
        await queryRunner.query(`ALTER TABLE "calendar_events" DROP CONSTRAINT "FK_calendar_events_job"`);
        await queryRunner.query(`ALTER TABLE "calendar_events" DROP CONSTRAINT "FK_calendar_events_createdBy"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "calendar_sync_settings"`);
        await queryRunner.query(`DROP TABLE "calendar_events"`);

        // Drop enums
        await queryRunner.query(`DROP TYPE "public"."calendar_sync_settings_syncdirection_enum"`);
        await queryRunner.query(`DROP TYPE "public"."calendar_events_visibility_enum"`);
        await queryRunner.query(`DROP TYPE "public"."calendar_events_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."calendar_events_eventtype_enum"`);
    }
}