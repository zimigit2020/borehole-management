#!/bin/bash

echo "🚰 Borehole Management System - Phase 1 Setup"
echo "============================================="

# Check if .env exists
if [ ! -f backend/.env ]; then
    echo "Creating .env file from template..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env - Please update with your credentials"
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Create a docker-compose for local development
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: borehole_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:
EOF

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your DigitalOcean credentials"
echo "2. Start local database: docker-compose up -d"
echo "3. Run backend: cd backend && npm run start:dev"
echo "4. Access API docs at: http://localhost:8080/api/docs"
echo ""
echo "For DigitalOcean deployment, see deployment/README.md"