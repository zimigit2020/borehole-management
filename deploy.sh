#!/bin/bash

echo "🚰 Deploying Borehole Management System to DigitalOcean"
echo "========================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DB_ID="26f582ae-7dc3-4bcf-afd2-2bb0e7ff6ba3"
DB_NAME="borehole_prod"
REGION="fra1"

echo -e "${YELLOW}Step 1: Database Setup${NC}"
echo "Database ID: $DB_ID"
echo "Database Name: $DB_NAME"

# Get database connection string
DB_URL=$(doctl databases connection $DB_ID --format URI -o text | sed "s/defaultdb/$DB_NAME/")
echo "Database URL: ${DB_URL:0:50}..."

echo -e "\n${YELLOW}Step 2: You need to create Spaces manually${NC}"
echo "1. Go to: https://cloud.digitalocean.com/spaces"
echo "2. Create Space named 'borehole-files' in Frankfurt (fra1)"
echo "3. Go to: https://cloud.digitalocean.com/account/api/spaces"
echo "4. Generate access keys"
echo ""
read -p "Have you created Spaces and have the access keys? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Please create Spaces first, then run this script again.${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 3: Enter Spaces Credentials${NC}"
read -p "Enter Spaces Access Key: " SPACES_KEY
read -s -p "Enter Spaces Secret Key: " SPACES_SECRET
echo

echo -e "\n${YELLOW}Step 4: Generate JWT Secret${NC}"
JWT_SECRET=$(openssl rand -base64 32)
echo "Generated JWT Secret: ${JWT_SECRET:0:10}..."

echo -e "\n${YELLOW}Step 5: Deploy Options${NC}"
echo "Since App Platform requires GitHub, you have two options:"
echo ""
echo -e "${GREEN}Option A: Manual Deployment (Recommended for testing)${NC}"
echo "1. Create a Droplet with Docker"
echo "2. Deploy using Docker Compose"
echo ""
echo -e "${GREEN}Option B: Push to GitHub then deploy${NC}"
echo "1. Create GitHub repository"
echo "2. Push code to GitHub"
echo "3. Use App Platform"
echo ""
echo "Which option would you like? (A/B)"
read -p "Choice: " DEPLOY_CHOICE

if [[ $DEPLOY_CHOICE == "A" || $DEPLOY_CHOICE == "a" ]]; then
    echo -e "\n${YELLOW}Creating Docker deployment...${NC}"
    
    # Create docker-compose for production
    cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  backend:
    build: ./backend
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
    restart: always
EOF
    
    echo -e "${GREEN}Docker Compose file created!${NC}"
    echo ""
    echo "To deploy on a Droplet:"
    echo "1. Create a Droplet: doctl compute droplet create borehole-backend --size s-1vcpu-1gb --image docker-20-04 --region fra1"
    echo "2. SSH into droplet and copy this project"
    echo "3. Run: docker-compose -f docker-compose.prod.yml up -d"
    
else
    echo -e "\n${YELLOW}Creating App Platform spec...${NC}"
    
    # Update app-spec.yaml with actual values
    cat > deployment/app-spec-deploy.yaml << EOF
name: borehole-management
region: fra
services:
- name: backend
  build_command: npm run build
  environment_slug: node-js
  github:
    branch: main
    deploy_on_push: true
    repo: YOUR_GITHUB_USERNAME/borehole-phase1
  http_port: 8080
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
  run_command: node dist/main
  source_dir: /backend
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: $DB_URL
  - key: JWT_SECRET
    value: $JWT_SECRET
  - key: DO_SPACES_KEY
    value: $SPACES_KEY
  - key: DO_SPACES_SECRET
    value: $SPACES_SECRET
  - key: DO_SPACES_ENDPOINT
    value: https://fra1.digitaloceanspaces.com
  - key: DO_SPACES_BUCKET
    value: borehole-files
  - key: CORS_ORIGIN
    value: "*"
EOF
    
    echo -e "${GREEN}App spec created!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Create GitHub repo"
    echo "2. Push code: git push origin main"
    echo "3. Update YOUR_GITHUB_USERNAME in deployment/app-spec-deploy.yaml"
    echo "4. Deploy: doctl apps create --spec deployment/app-spec-deploy.yaml"
fi

echo -e "\n${GREEN}✅ Deployment preparation complete!${NC}"