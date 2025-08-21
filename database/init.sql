-- Borehole Management System - Phase 1 Database Schema
-- For DigitalOcean Managed PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create ENUM types
CREATE TYPE user_role AS ENUM (
    'admin',
    'project_manager',
    'surveyor',
    'driller'
);

CREATE TYPE job_status AS ENUM (
    'created',
    'assigned',
    'surveyed',
    'drilling',
    'completed'
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'surveyor',
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    "isActive" BOOLEAN DEFAULT true,
    "lastLogin" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    "clientName" VARCHAR(255) NOT NULL,
    "siteName" VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status job_status DEFAULT 'created',
    "contactPerson" VARCHAR(255),
    "contactPhone" VARCHAR(20),
    "accessNotes" TEXT,
    priority VARCHAR(20),
    "budgetUsd" DECIMAL(10, 2),
    "assignedSurveyorId" UUID REFERENCES users(id),
    "assignedDrillerId" UUID REFERENCES users(id),
    "assignedAt" TIMESTAMP WITH TIME ZONE,
    "surveyCompletedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Survey Reports table
CREATE TABLE IF NOT EXISTS survey_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "jobId" UUID REFERENCES jobs(id) ON DELETE CASCADE,
    "surveyorId" UUID REFERENCES users(id),
    
    -- GPS Data
    "gpsLat" DECIMAL(10, 8) NOT NULL,
    "gpsLng" DECIMAL(11, 8) NOT NULL,
    "gpsAccuracy" DECIMAL(5, 2),
    "gpsCapturedAt" TIMESTAMP WITH TIME ZONE,
    
    -- Survey Data
    "recommendedMinDepth" DECIMAL(6, 2) NOT NULL,
    "recommendedMaxDepth" DECIMAL(6, 2) NOT NULL,
    "expectedBreaks" TEXT, -- Will store as comma-separated values
    "soilType" VARCHAR(100),
    "groundConditions" TEXT,
    "surveyMethod" VARCHAR(100),
    
    -- Files
    "graphFileId" VARCHAR(255),
    
    -- Quality assurance
    "disclaimerAck" BOOLEAN DEFAULT false,
    "surveyorNotes" TEXT,
    
    -- Offline sync fields
    "deviceId" VARCHAR(255),
    "offlineCreatedAt" TIMESTAMP WITH TIME ZONE,
    synced BOOLEAN DEFAULT false,
    
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_surveyor ON jobs("assignedSurveyorId");
CREATE INDEX idx_jobs_location ON jobs(latitude, longitude);
CREATE INDEX idx_survey_reports_job ON survey_reports("jobId");
CREATE INDEX idx_survey_reports_surveyor ON survey_reports("surveyorId");
CREATE INDEX idx_survey_reports_sync ON survey_reports(synced, "deviceId");

-- Initial admin user (password: admin123 - change immediately!)
-- Password is bcrypt hashed
INSERT INTO users (email, password, role, "firstName", "lastName", phone)
VALUES (
    'admin@borehole.com',
    '$2b$10$YKtH5OA5JXQZ5SzQGQhJaOXKgP9P5kxXH9Tx1kHvNs3cCKqEKIgDa',
    'admin',
    'System',
    'Admin',
    '+263000000000'
) ON CONFLICT (email) DO NOTHING;

-- Sample data for testing
INSERT INTO users (email, password, role, "firstName", "lastName", phone)
VALUES 
    ('surveyor1@borehole.com', '$2b$10$YKtH5OA5JXQZ5SzQGQhJaOXKgP9P5kxXH9Tx1kHvNs3cCKqEKIgDa', 'surveyor', 'John', 'Surveyor', '+263771234567'),
    ('driller1@borehole.com', '$2b$10$YKtH5OA5JXQZ5SzQGQhJaOXKgP9P5kxXH9Tx1kHvNs3cCKqEKIgDa', 'driller', 'Peter', 'Driller', '+263772345678')
ON CONFLICT (email) DO NOTHING;