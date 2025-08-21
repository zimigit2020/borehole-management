#!/bin/bash

# Build the production version
echo "Building production version..."
npm run build

# Create a tarball of the build
echo "Creating deployment package..."
tar -czf ums-frontend.tar.gz build/

echo "Build complete! Upload ums-frontend.tar.gz to your hosting service."
echo ""
echo "For DigitalOcean App Platform:"
echo "1. Go to https://cloud.digitalocean.com/apps"
echo "2. Create a new app"
echo "3. Choose 'Static Site'"
echo "4. Upload the build folder"
echo ""
echo "For DigitalOcean Droplet with Nginx:"
echo "1. Upload to server: scp ums-frontend.tar.gz root@your-server-ip:/tmp/"
echo "2. Extract: tar -xzf /tmp/ums-frontend.tar.gz -C /var/www/html/"
echo "3. Restart nginx: systemctl restart nginx"