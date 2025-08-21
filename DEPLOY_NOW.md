# 🚀 Deploy Instructions - Your Droplet is Ready!

Your droplet is running at: **165.232.124.133**

## Option 1: Via DigitalOcean Console (Easiest)

1. **Open Droplet Console**
   - Go to: https://cloud.digitalocean.com/droplets
   - Click on "borehole-backend" droplet
   - Click "Console" button to open terminal

2. **Run these commands in the console:**

```bash
# Clone from GitHub (if you have a repo) OR create files manually
git clone https://github.com/YOUR_USERNAME/borehole-phase1.git
cd borehole-phase1

# OR download directly
wget https://your-file-location/backend.tar.gz
tar -xzf backend.tar.gz
cd backend

# Create environment file
cat > .env << 'EOF'
NODE_ENV=production
PORT=8080
API_PREFIX=api/v1
DATABASE_URL=YOUR_DATABASE_URL_HERE
JWT_SECRET=your-super-secure-jwt-secret-here-min-32-chars
JWT_EXPIRES_IN=24h
DO_SPACES_ENDPOINT=https://fra1.digitaloceanspaces.com
DO_SPACES_KEY=YOUR_SPACES_ACCESS_KEY
DO_SPACES_SECRET=YOUR_SPACES_SECRET_KEY
DO_SPACES_BUCKET=borehole-files
DO_SPACES_REGION=fra1
CORS_ORIGIN=*
EOF

# Build and run with Docker
docker build -t borehole-backend .
docker run -d --name borehole-backend -p 80:8080 --env-file .env --restart always borehole-backend
```

3. **Replace in the .env file above:**
   - `YOUR_SPACES_ACCESS_KEY` with your actual Spaces key
   - `YOUR_SPACES_SECRET_KEY` with your actual Spaces secret
   - Generate a secure JWT_SECRET (use a password generator)

## Option 2: Upload via SFTP

Since the droplet has Docker pre-installed, you can:

1. **Zip your backend folder locally:**
```bash
cd /Users/rory/Downloads/borehole-phase1
tar -czf backend.tar.gz backend/
```

2. **Upload using DigitalOcean's web console:**
   - Use the console's file upload feature
   - Or use an SFTP client

3. **Then run the Docker commands above**

## Test Your Deployment

Once deployed, test it:

```bash
# From anywhere:
curl http://165.232.124.133/api/v1/health

# View API docs in browser:
http://165.232.124.133/api/docs
```

## Your Endpoints

- **API Base**: http://165.232.124.133/api/v1
- **API Docs**: http://165.232.124.133/api/docs
- **Health Check**: http://165.232.124.133/api/v1/health

## Database Already Set Up

- Database: `borehole_prod` 
- Host: `borehole-db-do-user-3317609-0.k.db.ondigitalocean.com`
- Region: Frankfurt (low latency to Zimbabwe)

## Spaces Configuration

- Bucket: `borehole-files`
- Region: Frankfurt (fra1)
- Endpoint: `https://fra1.digitaloceanspaces.com`

## Next Steps After Deployment

1. Initialize database schema (if needed)
2. Create first admin user
3. Test file upload to Spaces
4. Update Android app with production URL
5. Set up domain name (optional)