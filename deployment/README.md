# DigitalOcean Deployment Guide

## Prerequisites
- DigitalOcean account
- doctl CLI installed and configured
- GitHub repository for the project

## Step 1: Create DigitalOcean Managed Database

```bash
# Create a PostgreSQL database
doctl databases create borehole-db \
  --engine pg \
  --region nyc3 \
  --size db-s-1vcpu-1gb \
  --version 15

# Get connection details
doctl databases connection borehole-db
```

## Step 2: Create DigitalOcean Spaces Bucket

```bash
# Create a Spaces bucket for file storage
doctl spaces create borehole-files --region nyc3

# Create Spaces access keys
# Go to: https://cloud.digitalocean.com/account/api/spaces
# Generate new Spaces access keys and save them
```

## Step 3: Set up App Platform

### Option A: Using doctl CLI

```bash
# Deploy using app.yaml
doctl apps create --spec deployment/app.yaml

# Update environment variables
doctl apps update <app-id> --env-file .env.production
```

### Option B: Using DigitalOcean Console

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Connect your GitHub repository
4. Choose the branch (main)
5. Set the source directory to `/backend`
6. Configure environment variables:
   - DATABASE_URL (from managed database)
   - JWT_SECRET (generate a secure key)
   - DO_SPACES_KEY (from Spaces access keys)
   - DO_SPACES_SECRET (from Spaces access keys)

## Step 4: Configure Database

```bash
# Connect to database
psql $DATABASE_URL

# Enable PostGIS extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
```

## Step 5: Run Database Migrations

```bash
# SSH into your app (if needed)
doctl apps console <app-id>

# Run migrations
npm run migration:run
```

## Environment Variables

Create `.env.production` with:

```env
NODE_ENV=production
PORT=8080
API_PREFIX=api/v1

# Get from DigitalOcean Managed Database
DATABASE_URL=postgresql://doadmin:password@db-cluster.ondigitalocean.com:25060/borehole?sslmode=require

# Generate a secure JWT secret
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=24h

# Get from DigitalOcean Spaces
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_KEY=your-spaces-key
DO_SPACES_SECRET=your-spaces-secret
DO_SPACES_BUCKET=borehole-files
DO_SPACES_REGION=nyc3

CORS_ORIGIN=https://your-frontend-domain.com
```

## Monitoring

```bash
# View app logs
doctl apps logs <app-id> --tail

# View app metrics
doctl apps metrics <app-id>
```

## Useful Commands

```bash
# List all apps
doctl apps list

# Get app details
doctl apps get <app-id>

# Update app
doctl apps update <app-id> --spec app.yaml

# Delete app
doctl apps delete <app-id>
```

## Cost Estimation (Phase 1)

- **App Platform Basic**: $5/month
- **Managed Database (Dev)**: $15/month
- **Spaces (250GB)**: $5/month
- **Bandwidth**: ~$0.01/GB

**Total**: ~$25-30/month for development/testing

## Production Scaling

When ready for production:
- Upgrade to App Platform Professional: $12+/month
- Database cluster with standby: $60+/month
- Add CDN for static assets
- Configure monitoring and alerts
- Set up automated backups