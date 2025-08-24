#!/bin/bash

# Deployment script for Borehole Management System
# This script deploys both backend and frontend to DigitalOcean

set -e  # Exit on error

echo "🚀 Starting deployment to DigitalOcean..."

# Configuration
DO_HOST="68.183.35.203"
DO_USER="root"

echo "📦 Deploying Backend and Frontend..."
ssh $DO_USER@$DO_HOST << 'ENDSSH'
    set -e
    
    # Backend Deployment
    echo "================== BACKEND DEPLOYMENT =================="
    echo "📂 Navigating to backend directory..."
    cd /var/www/borehole-backend
    
    echo "🔄 Pulling latest code from GitHub..."
    git pull origin master
    
    echo "📦 Installing backend dependencies..."
    npm install
    
    echo "🏗️ Building backend..."
    npm run build
    
    echo "🔄 Restarting backend service with PM2..."
    pm2 restart borehole-backend || pm2 start dist/main.js --name borehole-backend
    pm2 save
    
    echo "✅ Backend deployment complete!"
    
    # Frontend Deployment
    echo "================== FRONTEND DEPLOYMENT =================="
    echo "📂 Navigating to frontend directory..."
    cd /var/www/borehole-frontend
    
    echo "🔄 Pulling latest code from GitHub..."
    git pull origin master
    
    echo "📦 Installing frontend dependencies..."
    npm install
    
    echo "🏗️ Building frontend..."
    npm run build
    
    echo "🌐 Deploying to Nginx..."
    sudo rm -rf /var/www/html/*
    sudo cp -r build/* /var/www/html/
    
    echo "🔄 Restarting Nginx..."
    sudo systemctl restart nginx
    
    echo "✅ Frontend deployment complete!"
    
    # Show status
    echo "================== DEPLOYMENT STATUS =================="
    echo "PM2 Status:"
    pm2 status
    
    echo ""
    echo "Latest commits deployed:"
    cd /var/www/borehole-backend && git log --oneline -3
ENDSSH

echo "🎉 Deployment complete!"
echo "📱 Application is now live at: http://68.183.35.203"
echo ""
echo "🔍 Please test the following NEW features:"
echo "  1. Inventory Management module"
echo "  2. Installation/Pump Management module"  
echo "  3. Finance/Invoice module"
echo "  4. Multi-currency support (USD, ZAR, ZWG)"
echo "  5. Exchange rate management in Finance module"
