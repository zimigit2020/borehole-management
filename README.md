# Borehole Management System

## 🏗️ Project Overview
A comprehensive borehole drilling and management system designed for field operations, inventory management, installation tracking, and financial operations. Built with NestJS (backend) and React (frontend).

## 🌐 Live Deployment
- **Frontend**: https://borehole-frontend-xfjtz.ondigitalocean.app
- **Backend API**: https://borehole-management-nuyvk.ondigitalocean.app/api/v1
- **Platform**: DigitalOcean App Platform with automatic GitHub deployments

## 📁 Project Structure
```
borehole-phase1/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── auth/           # JWT authentication & authorization
│   │   ├── users/          # User management
│   │   ├── jobs/           # Job scheduling & tracking
│   │   ├── surveys/        # Site surveys & assessments
│   │   ├── drilling/       # Drilling operations & reports
│   │   ├── inventory/      # Stock management & tracking
│   │   ├── installations/  # Pump installations & scheduling
│   │   └── finance/        # Invoicing & payment processing
│   └── package.json
├── web-frontend/            # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── config/         # Configuration files
│   └── package.json
└── DEPLOYMENT_INSTRUCTIONS.md
```

## 🚀 Core Modules

### 1. **Job Management**
- Create and manage borehole drilling jobs
- Track job progress through multiple stages
- Assign teams and resources
- Geographic location tracking with maps
- **NEW: Job Costing Analysis** - Detailed profitability reports per job

### 2. **Survey Management**
- Site assessments and feasibility studies
- Water table measurements
- Geological data collection
- Survey report generation

### 3. **Drilling Operations**
- Real-time drilling progress tracking
- Daily drilling reports
- Depth and diameter tracking
- Equipment and resource allocation
- Drilling status management

### 4. **Inventory Management** *(Enhanced)*
- Stock tracking for drilling materials
- Low stock alerts and notifications
- Stock movement history
- Inventory value reporting
- Category-based organization
- **NEW: Purchase Orders Module**
  - Complete procurement lifecycle
  - Supplier management and tracking
  - Partial/full receiving capability
  - Automatic stock updates on receipt
  - Approval workflow for purchases
- API Endpoints:
  - `/api/v1/inventory/items` - CRUD operations
  - `/api/v1/inventory/reports/value` - Total inventory value
  - `/api/v1/inventory/movements` - Stock movements
  - `/api/v1/purchase-orders` - Purchase order management

### 5. **Installation/Pump Management** *(New)*
- Pump installation scheduling
- Installation team assignments
- Calendar view of scheduled installations
- Installation completion tracking
- Pump specifications and maintenance
- Statistics and performance metrics

### 6. **Finance Module** *(Significantly Enhanced)*
- Invoice generation and management
- Multi-currency support (USD, ZAR, ZWG)
- Exchange rate management
- Payment recording and verification
- Financial reporting and analytics
- Revenue tracking by month
- Overdue invoice alerts
- **NEW: Expense Tracking System**
  - Track expenses by category (fuel, equipment, labor, etc.)
  - Expense approval workflow
  - Reimbursement tracking
  - Job cost allocation
  - Vendor management
  - Multi-currency expense support
- **NEW: Job Costing Reports**
  - Detailed cost breakdown by category
  - Profit margin analysis
  - Cost vs revenue comparison
  - Visual charts and analytics
  - Cost efficiency recommendations

### 7. **User Management**
- Role-based access control (Admin, Manager, Operator, Technician)
- User authentication with JWT
- Team member assignments
- Activity tracking

## 💱 Multi-Currency Support
### Supported Currencies
- **USD** - US Dollar
- **ZAR** - South African Rand  
- **ZWG** - Zimbabwe Gold

### Features
- Exchange rate management with history tracking
- Automatic inverse rate calculations
- Currency conversion for invoices
- Rate effective dates
- Audit trail for rate changes

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS v8
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **Environment**: Node.js v16+

### Frontend
- **Framework**: React v18 with TypeScript
- **UI Library**: Material-UI (MUI) v7
- **State Management**: React Hooks
- **Routing**: React Router v6
- **Charts**: Recharts
- **Maps**: Google Maps API
- **Date Handling**: date-fns
- **HTTP Client**: Axios

## 🔧 Local Development Setup

### Prerequisites
- Node.js v16+
- PostgreSQL 13+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure database in .env
npm run start:dev
```

### Frontend Setup
```bash
cd web-frontend
npm install
cp .env.example .env
# Configure API URL in .env
npm start
```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/borehole_db
JWT_SECRET=your-jwt-secret
PORT=3000
NODE_ENV=development
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3000/api/v1
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

## 🚢 Deployment

### DigitalOcean App Platform
The project uses DigitalOcean App Platform with automatic deployments from GitHub:

1. **Automatic Deployment**: Pushing to `master` branch triggers deployment
2. **Backend App**: `borehole-management` - Auto-builds and deploys NestJS
3. **Frontend App**: `borehole-frontend` - Auto-builds and deploys React
4. **Database**: Managed PostgreSQL database on DigitalOcean

### Manual Deployment (Alternative)
```bash
# Backend
git push origin master
# App Platform auto-deploys

# Check deployment status
doctl apps list-deployments 7b85c627-ac3e-416c-b5c9-059657f203d4

# Frontend  
git push origin master
# App Platform auto-deploys

# Check deployment status
doctl apps list-deployments 149d723b-4b8d-4f2d-9d94-e4a9f3106b59
```

## 📊 Database Schema

### Key Tables
- `users` - System users and authentication
- `jobs` - Borehole drilling jobs (enhanced with costing fields)
- `surveys` - Site surveys
- `drilling_reports` - Daily drilling progress
- `inventory_items` - Stock items
- `inventory_movements` - Inventory transactions (enhanced)
- `purchase_orders` - Purchase order management
- `purchase_order_items` - PO line items
- `expenses` - Expense tracking with approval workflow
- `installations` - Pump installations
- `invoices` - Financial invoices
- `invoice_items` - Invoice line items
- `payments` - Payment records
- `exchange_rates` - Currency exchange rates
- `calendar_events` - Scheduling and events
- `todos` - Task management (in development)

### Automatic Migrations
The backend automatically runs TypeORM migrations on startup when `synchronize: true` is set in the database configuration.

## 🔑 API Authentication
The API uses JWT bearer token authentication:

```javascript
// Login
POST /api/v1/auth/login
{
  "username": "user@example.com",
  "password": "password"
}

// Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}

// Use token in requests
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 📝 API Documentation
Swagger documentation available at: https://borehole-management-nuyvk.ondigitalocean.app/api

## 🧪 Testing

### Run Tests
```bash
# Backend unit tests
cd backend
npm run test

# Backend e2e tests
npm run test:e2e

# Frontend tests
cd web-frontend
npm test
```

## 🐛 Common Issues & Solutions

### 1. Inventory Value Endpoint Error
**Issue**: `Cannot GET /api/v1/inventory/reports/value`
**Solution**: Backend needs restart after deployment to register new routes

### 2. Database Connection Issues
**Issue**: TypeORM connection errors
**Solution**: Check DATABASE_URL format and PostgreSQL service status

### 3. CORS Errors
**Issue**: Cross-origin requests blocked
**Solution**: Ensure backend CORS configuration includes frontend URL

## 📈 Performance Monitoring
- Backend health check: `/api/v1/health`
- PM2 monitoring (if using PM2): `pm2 status`
- DigitalOcean App Platform metrics in dashboard

## 🔄 Recent Updates (August 2024)

### Version 2.1.0 - Financial Enhancement Release (August 25, 2024)
1. **Expense Tracking System**
   - Complete expense management with 15+ categories
   - Manager approval workflow
   - Reimbursement tracking
   - Job cost allocation
   - Vendor invoice tracking

2. **Purchase Order Management**
   - Full procurement lifecycle
   - Supplier performance tracking
   - Partial/full receiving
   - Automatic inventory updates
   - Approval workflow

3. **Job Costing Analytics**
   - Comprehensive profitability analysis
   - Cost breakdown by category
   - Visual charts and reports
   - Profit margin tracking
   - Cost efficiency recommendations
   - Integration with expenses and inventory

4. **System Improvements**
   - Fixed timezone to Africa/Harare
   - Enhanced UI with tabs for all modules
   - Improved error handling
   - Better TypeScript type safety

### Version 2.0.0 - Major Feature Release (August 24, 2024)
1. **Inventory Management Module**
   - Complete stock tracking system
   - Low stock alerts
   - Movement history
   - Value reporting

2. **Installation/Pump Module**
   - Installation scheduling
   - Pump management
   - Calendar integration
   - Team assignments

3. **Finance/Invoice Module**
   - Invoice generation
   - Payment tracking
   - Financial reports
   - Revenue analytics

4. **Multi-Currency Support**
   - USD, ZAR, ZWG currencies
   - Exchange rate management
   - Currency conversion
   - Rate history tracking

## 👥 Team & Support
- **Repository**: https://github.com/zimigit2020/borehole-management
- **Issues**: Report bugs via GitHub Issues
- **Documentation**: This README and inline code documentation

## 📄 License
Proprietary - All rights reserved

## 🔒 Security Notes
- JWT tokens expire after 24 hours
- Passwords are hashed using bcrypt
- Role-based access control enforced
- API rate limiting implemented
- Input validation on all endpoints

## 🚦 System Status
- **Production**: https://borehole-frontend-xfjtz.ondigitalocean.app
- **API Health**: https://borehole-management-nuyvk.ondigitalocean.app/api/v1/health
- **Last Deployment**: August 25, 2024 (commit 350adf4)

## 📱 Mobile Responsiveness
The frontend is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices
- Field devices with limited connectivity

## 🌍 Geographic Coverage
System designed for operations in:
- Zimbabwe
- South Africa
- Regional expansion ready

---
*Last Updated: August 25, 2024*