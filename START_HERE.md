# 🚀 Borehole Management System - Quick Start Guide

## System Components

### 1. Backend API (Live)
- **URL**: https://borehole-management-nuyvk.ondigitalocean.app/api/v1/
- **Docs**: https://borehole-management-nuyvk.ondigitalocean.app/api/docs
- **Status**: ✅ Deployed and Running

### 2. Web Frontend (Local Development)
```bash
cd web-frontend
npm install  # First time only
npm start
```
- **URL**: http://localhost:3000
- **Features**: Dashboard, Map View, Jobs Management

### 3. Mobile App (Android)
- Located in `android-app/` directory
- Open in Android Studio to build and run

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@borehole.com | admin123 |
| Surveyor | surveyor1@borehole.com | admin123 |
| Driller | driller1@borehole.com | admin123 |

## Quick Test

1. Start the frontend:
```bash
cd web-frontend && npm start
```

2. Open http://localhost:3000

3. Login with admin credentials

4. Navigate to "Map View" to see the Google Maps integration

## Next Steps
- [ ] Build out User Management UI
- [ ] Add job assignment features
- [ ] Implement survey report uploads
- [ ] Add real-time status updates