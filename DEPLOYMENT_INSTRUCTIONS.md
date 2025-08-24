# Deployment Instructions for DigitalOcean

## Quick Deployment Commands

SSH into your DigitalOcean server and run these commands:

```bash
# 1. SSH into your server
ssh root@68.183.35.203

# 2. Deploy Backend
cd /var/www/borehole-backend
git pull origin master
npm install
npm run build
pm2 restart borehole-backend || pm2 start dist/main.js --name borehole-backend
pm2 save

# 3. Deploy Frontend
cd /var/www/borehole-frontend
git pull origin master
npm install
npm run build
sudo rm -rf /var/www/html/*
sudo cp -r build/* /var/www/html/
sudo systemctl restart nginx

# 4. Verify deployment
pm2 status
```

## What's Being Deployed

### New Features (Not yet on production):
1. **Inventory Management Module**
   - Stock tracking and movements
   - Low stock alerts
   - Inventory value reports
   - Fixed endpoint: `/api/v1/inventory/reports/value`

2. **Installation/Pump Management Module**
   - Installation scheduling
   - Pump tracking
   - Calendar view
   - Installation statistics

3. **Finance/Invoice Module**
   - Invoice creation and management
   - Payment tracking
   - Financial reports
   - Revenue analytics

4. **Multi-Currency Support**
   - USD, ZAR, ZWG currencies
   - Exchange rate management
   - Currency conversion
   - Rate history tracking

## Testing After Deployment

1. **Test Inventory Module**
   - Navigate to Inventory section
   - Check if inventory value loads correctly
   - Test adding items and stock movements

2. **Test Installation Module**
   - Navigate to Installations section
   - Check calendar view
   - Test scheduling new installations

3. **Test Finance Module**
   - Navigate to Finance section
   - Create a test invoice with different currencies (USD, ZAR, ZWG)
   - Click "Exchange Rates" button to manage rates
   - Test payment recording

4. **Test Multi-Currency**
   - In Finance, click "Exchange Rates"
   - Add exchange rates for USD->ZAR and USD->ZWG
   - Create invoices in different currencies
   - Verify currency symbols display correctly

## Database Changes
The backend will automatically run migrations on startup to create:
- `exchange_rates` table for currency management

## Rollback (if needed)
```bash
# Backend rollback
cd /var/www/borehole-backend
git log --oneline -5  # Find the commit to rollback to
git reset --hard <commit-hash>
npm install
npm run build
pm2 restart borehole-backend

# Frontend rollback
cd /var/www/borehole-frontend
git reset --hard <commit-hash>
npm install
npm run build
sudo rm -rf /var/www/html/*
sudo cp -r build/* /var/www/html/
sudo systemctl restart nginx
```

## Commits Being Deployed
- d09bd41 Add multi-currency support to frontend
- 38abf9c Add multi-currency support with exchange rates
- 27fcf70 Add Finance/Invoice frontend module
- 8a7b188 Add Installation/Pump Management frontend UI
- 2c36f43 Add complete Inventory Management frontend UI