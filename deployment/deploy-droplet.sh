#!/bin/bash

echo "🚰 Deploying to DigitalOcean Droplet"
echo "====================================="

# Droplet IP
DROPLET_IP="165.232.124.133"

# Database connection (already configured)
DB_URL="YOUR_DATABASE_URL_HERE"

# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

echo "Enter your Spaces credentials (they won't be shown):"
read -p "Spaces Access Key: " DO_SPACES_KEY
read -s -p "Spaces Secret Key: " DO_SPACES_SECRET
echo

# Create production env file
cat > backend/.env.production << EOF
NODE_ENV=production
PORT=8080
API_PREFIX=api/v1
DATABASE_URL=$DB_URL
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
DO_SPACES_ENDPOINT=https://fra1.digitaloceanspaces.com
DO_SPACES_KEY=$DO_SPACES_KEY
DO_SPACES_SECRET=$DO_SPACES_SECRET
DO_SPACES_BUCKET=borehole-files
DO_SPACES_REGION=fra1
CORS_ORIGIN=*
EOF

echo "✅ Environment file created"

# Create deployment package
echo "Creating deployment package..."
tar -czf deploy.tar.gz backend/ database/

echo "Copying to droplet..."
scp deploy.tar.gz root@$DROPLET_IP:/root/

echo "Setting up on droplet..."
ssh root@$DROPLET_IP << 'ENDSSH'
  # Extract files
  tar -xzf deploy.tar.gz
  cd backend
  
  # Build Docker image
  docker build -t borehole-backend .
  
  # Stop any existing container
  docker stop borehole-backend 2>/dev/null || true
  docker rm borehole-backend 2>/dev/null || true
  
  # Run new container
  docker run -d \
    --name borehole-backend \
    --restart always \
    -p 80:8080 \
    --env-file .env.production \
    borehole-backend
  
  echo "✅ Backend deployed!"
  docker ps
ENDSSH

echo ""
echo "🎉 Deployment complete!"
echo "API URL: http://$DROPLET_IP/api/v1"
echo "API Docs: http://$DROPLET_IP/api/docs"
echo ""
echo "Test with: curl http://$DROPLET_IP/api/v1/health"