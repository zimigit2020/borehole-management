# Deployment Guide - Borehole Management System Phase 1

## Quick Deploy to DigitalOcean

### Step 1: Create DigitalOcean Resources

#### 1.1 Create Managed PostgreSQL Database
```bash
# Create database cluster
doctl databases create borehole-db \
  --engine pg \
  --region nyc3 \
  --size db-s-1vcpu-1gb \
  --version 15

# Get connection string (save this!)
doctl databases connection borehole-db --format URI
```

#### 1.2 Create Spaces Bucket
```bash
# Create Spaces for file storage
doctl spaces create borehole-files --region nyc3
```

#### 1.3 Generate Spaces Access Keys
1. Go to: https://cloud.digitalocean.com/account/api/spaces
2. Click "Generate New Key"
3. Save the Access Key and Secret Key

### Step 2: Configure Backend

#### 2.1 Update Environment Variables
Create `.env` file in `/backend`:
```env
NODE_ENV=production
PORT=8080
API_PREFIX=api/v1

# From Step 1.1
DATABASE_URL=postgresql://doadmin:password@db-cluster.ondigitalocean.com:25060/borehole?sslmode=require

# Generate secure secret
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_EXPIRES_IN=24h

# From Step 1.3
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_KEY=your-spaces-access-key
DO_SPACES_SECRET=your-spaces-secret-key
DO_SPACES_BUCKET=borehole-files
DO_SPACES_REGION=nyc3

CORS_ORIGIN=https://your-app.ondigitalocean.app
```

### Step 3: Deploy to App Platform

#### Option A: Using GitHub
1. Push code to GitHub repository
2. Go to https://cloud.digitalocean.com/apps
3. Click "Create App"
4. Connect GitHub repo
5. Select branch: `main`
6. Source Directory: `/backend`
7. Add environment variables from `.env`
8. Deploy

#### Option B: Using doctl CLI
```bash
# Deploy using app spec
doctl apps create --spec deployment/app.yaml

# Get app ID
doctl apps list

# Update environment variables
doctl apps update <app-id> --env-file backend/.env
```

### Step 4: Initialize Database

```bash
# Connect to database
psql $DATABASE_URL

# Run initialization script
\i database/init.sql

# Verify tables created
\dt
```

### Step 5: Test Deployment

```bash
# Get app URL
doctl apps get <app-id> --format URL

# Test health endpoint
curl https://your-app.ondigitalocean.app/api/v1/health

# Access API docs
open https://your-app.ondigitalocean.app/api/docs
```

## Mobile App Deployment

### Android App
1. Update `BASE_URL` in `build.gradle.kts`:
   ```kotlin
   buildConfigField("String", "BASE_URL", "\"https://your-app.ondigitalocean.app/api/v1/\"")
   ```

2. Build release APK:
   ```bash
   cd android-app
   ./gradlew assembleRelease
   ```

3. Sign APK and distribute

### iOS App (Future)
- Will be added in Phase 2

## Monitoring & Maintenance

### View Logs
```bash
doctl apps logs <app-id> --tail
```

### Database Backup
```bash
doctl databases backups list <database-id>
```

### Scaling
```bash
# Scale app to 2 instances
doctl apps update <app-id> --spec deployment/app.yaml
```

## Cost Breakdown

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| App Platform | Basic (1 instance) | $5 |
| Database | Dev (1GB RAM) | $15 |
| Spaces | 250GB storage | $5 |
| Bandwidth | ~10GB | ~$1 |
| **Total** | | **~$26/month** |

## Production Checklist

- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Enable database backups
- [ ] Configure domain name
- [ ] Set up SSL certificate
- [ ] Enable monitoring alerts
- [ ] Configure CORS properly
- [ ] Test offline sync thoroughly
- [ ] Document API endpoints
- [ ] Create user guides
- [ ] Plan for scaling

## Support & Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify SSL mode is set
   - Check firewall rules

2. **File Upload Not Working**
   - Verify Spaces credentials
   - Check bucket permissions
   - Ensure CORS configured

3. **Mobile App Can't Connect**
   - Check BASE_URL in app
   - Verify CORS settings
   - Test with HTTP client first

### Getting Help
- DigitalOcean Support: https://www.digitalocean.com/support/
- API Docs: https://your-app.ondigitalocean.app/api/docs
- Logs: `doctl apps logs <app-id>`