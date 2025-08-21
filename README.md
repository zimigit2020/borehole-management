# Borehole Management System - Phase 1

## Overview
Phase 1 implementation focusing on core functionality:
- Backend API with user management and job assignment
- Excel job import functionality  
- Android survey app with offline-first design
- Sync mechanism for field data

## Tech Stack
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with PostGIS (DigitalOcean Managed Database)
- **File Storage**: DigitalOcean Spaces
- **Hosting**: DigitalOcean App Platform
- **Mobile**: Flutter (Android)

## Project Structure
```
borehole-phase1/
├── backend/           # NestJS API
├── mobile/           # Flutter Android App
├── database/         # Database schemas and migrations
└── deployment/       # DigitalOcean deployment configs
```

## Phase 1 Features

### Backend API
- [x] User authentication (JWT)
- [x] Role-based access control
- [x] Excel job import
- [x] Job assignment to surveyors
- [x] Survey report handling
- [x] File upload for photos/graphs
- [x] Offline sync endpoints

### Android App
- [x] User login
- [x] View assigned jobs
- [x] GPS location capture
- [x] Survey form completion
- [x] Photo capture
- [x] Offline storage
- [x] Automatic sync

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Flutter 3.13+
- DigitalOcean account

### Setup
1. Clone the repository
2. Set up backend: `cd backend && npm install`
3. Configure environment variables
4. Run database migrations
5. Start development server: `npm run dev`

### Deployment to DigitalOcean
See `deployment/README.md` for DigitalOcean App Platform deployment instructions.

## Timeline
Phase 1: 8-10 weeks
- Weeks 1-2: Backend foundation
- Weeks 3-4: Job management system
- Weeks 5-6: Survey reports backend
- Weeks 7-8: Android app foundation
- Weeks 9-10: Offline sync & polish