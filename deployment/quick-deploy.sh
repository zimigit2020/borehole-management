#!/bin/bash

echo "🚰 Quick Deploy to DigitalOcean"
echo "================================"

# Configuration
DROPLET_IP="165.232.124.133"
DB_URL="YOUR_DATABASE_URL_HERE"

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n')

echo "This script will create a deployment command for you to run."
echo ""
echo "Enter your Spaces credentials:"
read -p "Spaces Access Key: " SPACES_KEY
read -s -p "Spaces Secret Key: " SPACES_SECRET
echo
echo ""

# Create a deployment command
cat > run-on-droplet.txt << EOF
# Run these commands on your droplet (via DigitalOcean console):

# 1. Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 2. Clone the backend
mkdir -p /app
cd /app

# 3. Create the backend files
cat > package.json << 'EOFILE'
$(cat backend/package.json)
EOFILE

# 4. Create environment file
cat > .env << 'EOENV'
NODE_ENV=production
PORT=8080
API_PREFIX=api/v1
DATABASE_URL=$DB_URL
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
DO_SPACES_ENDPOINT=https://fra1.digitaloceanspaces.com
DO_SPACES_KEY=$SPACES_KEY
DO_SPACES_SECRET=$SPACES_SECRET
DO_SPACES_BUCKET=borehole-files
DO_SPACES_REGION=fra1
CORS_ORIGIN=*
EOENV

# 5. Copy source files (you'll need to transfer these)
# For now, let's use Docker instead...

EOF

echo "Creating Docker deployment instead..."

# Create docker-compose file
cat > docker-compose.production.yml << EOF
version: '3.8'

services:
  backend:
    image: node:18-alpine
    working_dir: /app
    ports:
      - "80:8080"
    environment:
      NODE_ENV: production
      PORT: 8080
      API_PREFIX: api/v1
      DATABASE_URL: $DB_URL
      JWT_SECRET: $JWT_SECRET
      JWT_EXPIRES_IN: 24h
      DO_SPACES_ENDPOINT: https://fra1.digitaloceanspaces.com
      DO_SPACES_KEY: $SPACES_KEY
      DO_SPACES_SECRET: $SPACES_SECRET
      DO_SPACES_BUCKET: borehole-files
      DO_SPACES_REGION: fra1
      CORS_ORIGIN: "*"
    volumes:
      - ./backend:/app
    command: sh -c "npm install && npm run build && npm run start:prod"
    restart: always
EOF

echo "✅ Docker Compose file created!"
echo ""
echo "📋 Next Steps:"
echo "1. Access your droplet console at: https://cloud.digitalocean.com/droplets/$DROPLET_IP"
echo "2. Click 'Console' to open terminal"
echo "3. Upload your backend folder to the droplet"
echo "4. Run: docker-compose -f docker-compose.production.yml up -d"
echo ""
echo "Your API will be available at:"
echo "  http://$DROPLET_IP/api/v1"
echo "  http://$DROPLET_IP/api/docs"