# StudyShare Deployment Guide

## Overview

This comprehensive guide covers deploying StudyShare to production environments. We'll cover multiple deployment strategies and platforms to suit different needs and budgets.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Frontend Deployment](#frontend-deployment)
   - [Vercel](#vercel)
4. [Backend Deployment](#backend-deployment)
   - [Railway](#railway)
   - [Render](#render)
   - [AWS EC2](#aws-ec2)
5. [Database Setup](#database-setup)
6. [File Storage](#file-storage)
7. [Domain Configuration](#domain-configuration)
8. [SSL/HTTPS Setup](#sslhttps-setup)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Monitoring & Logging](#monitoring--logging)
11. [Backup Strategies](#backup-strategies)
12. [Security Hardening](#security-hardening)
13. [Performance Optimization](#performance-optimization)
14. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to production, ensure you've completed these essential steps:

### Code Preparation

- [ ] All tests are passing (`npm test`)
- [ ] Linting checks pass (`npm run lint`)
- [ ] Code is reviewed and approved
- [ ] No console.log statements in production code
- [ ] Remove development-only dependencies
- [ ] Update package.json versions
- [ ] Create production build successfully

### Security

- [ ] All sensitive data moved to environment variables
- [ ] Strong JWT secrets generated
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] SQL injection protection in place
- [ ] XSS protection enabled
- [ ] CSRF protection implemented (if needed)

### Configuration

- [ ] Production environment variables set
- [ ] Database backup strategy planned
- [ ] Error logging configured
- [ ] Monitoring tools set up
- [ ] Domain name purchased (if needed)
- [ ] SSL certificate ready

### Documentation

- [ ] README.md updated
- [ ] API documentation current
- [ ] Deployment procedures documented
- [ ] Rollback procedures documented

---

## Environment Setup

### Production Environment Variables

Create a comprehensive `.env.production` file:

```env
# ===== APPLICATION =====
NODE_ENV=production
APP_NAME=StudyShare
APP_URL=https://studyshare.com
FRONTEND_URL=https://studyshare.com
API_URL=https://api.studyshare.com

# ===== SERVER =====
PORT=5000

# ===== DATABASE =====
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/studyshare?retryWrites=true&w=majority
MONGODB_OPTIONS=maxPoolSize=10&retryWrites=true

# ===== AUTHENTICATION =====
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_change_this
JWT_EXPIRE=24h
JWT_COOKIE_EXPIRE=1

REFRESH_TOKEN_SECRET=your_refresh_token_secret_key
REFRESH_TOKEN_EXPIRE=7d

# ===== CLOUDINARY =====
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=studyshare-production

# ===== GEMINI AI =====
GEMINI_API_KEY=your_gemini_api_key

# ===== EMAIL =====
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@studyshare.com
SMTP_PASS=your_email_app_password
FROM_EMAIL=StudyShare <noreply@studyshare.com>
FROM_NAME=StudyShare

# ===== FILE UPLOAD =====
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=pdf,docx,pptx,txt,zip

# ===== SECURITY =====
CORS_ORIGIN=https://studyshare.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ===== MONITORING =====
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info

# ===== ANALYTICS =====
GA_TRACKING_ID=your_google_analytics_id
```

### Generating Secure Secrets

```bash
# Generate JWT secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or using OpenSSL
openssl rand -base64 64
```

---

## Frontend Deployment

## Vercel

Vercel is the recommended platform for Next.js applications, offering optimal performance and zero configuration.

### Step 1: Prepare Your Repository

```bash
# Ensure your code is committed
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Option B: Vercel Dashboard**

1. Visit [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend/`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Configure Environment Variables

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all frontend environment variables:

```env
NEXT_PUBLIC_API_URL=https://api.studyshare.com
NEXT_PUBLIC_APP_URL=https://studyshare.com
NEXT_PUBLIC_APP_NAME=StudyShare
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_GA_TRACKING_ID=your_ga_id
```

### Step 4: Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `studyshare.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate to provision

### Vercel Configuration File

Create `vercel.json` in frontend directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## Backend Deployment

## Railway

Railway offers simple deployment with built-in PostgreSQL and Redis if needed.

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli

# Login
railway login
```

### Step 2: Initialize Project

```bash
cd backend

# Initialize Railway project
railway init

# Link to existing project (optional)
railway link [project-id]
```

### Step 3: Configure Environment

```bash
# Add environment variables
railway variables set NODE_ENV=production
railway variables set MONGODB_URI=your_mongodb_uri
railway variables set JWT_SECRET=your_jwt_secret
# ... add all other variables
```

### Step 4: Deploy

```bash
# Deploy to Railway
railway up

# Or connect GitHub for automatic deployments
# 1. Go to Railway dashboard
# 2. Connect GitHub repository
# 3. Select backend directory
# 4. Set build command: npm install && npm run build
# 5. Set start command: npm start
```

### Railway Configuration

Create `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## Render

Free tier available with automatic deployments.

### Deployment Steps

1. **Create Web Service**
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect GitHub repository

2. **Configure Service**
   ```
   Name: studyshare-api
   Environment: Node
   Region: Choose closest to users
   Branch: main
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Environment Variables**
   - Add all production environment variables

4. **Advanced Settings**
   ```
   Auto-Deploy: Yes
   Health Check Path: /api/health
   ```

---

## AWS EC2

For full control and scalability.

### Step 1: Launch EC2 Instance

1. Go to AWS EC2 Console
2. Click "Launch Instance"
3. Choose Ubuntu Server 22.04 LTS
4. Select instance type (t2.medium recommended)
5. Configure security group:
   - SSH (22) - Your IP
   - HTTP (80) - Anywhere
   - HTTPS (443) - Anywhere
   - Custom (5000) - Anywhere (temporarily)

### Step 2: Connect and Setup

```bash
# Connect to instance
ssh -i "your-key.pem" ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### Step 3: Clone and Setup Application

```bash
# Clone repository
git clone https://github.com/satendra03/study-share.git
cd study-share/backend

# Install dependencies
npm install

# Create .env file
nano .env
# Paste production environment variables

# Build application
npm run build
```

### Step 4: Configure PM2

```bash
# Start application with PM2
pm2 start dist/server.js --name studyshare-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it provides

# Monitor
pm2 monit
```

### Step 5: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/studyshare
```

Add configuration:

```nginx
server {
    listen 80;
    server_name api.studyshare.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/studyshare /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.studyshare.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

---

## Database Setup

### MongoDB Atlas (Recommended)

**Step 1: Create Cluster**

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster or paid tier
3. Choose region closest to your backend

**Step 2: Configure Security**

1. **Network Access**:
   - **Recommended**: Add specific IPs of your backend servers only
   - **Not recommended for production**: `0.0.0.0/0` (allow from anywhere) - use only for development/testing
2. **Database Access**:
   - Create database user
   - Set strong password
   - Grant readWrite permissions

**Step 3: Get Connection String**

1. Click "Connect"
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with your password
5. Add to backend environment variables

**Connection String Format**:
```
mongodb+srv://username:password@cluster.mongodb.net/studyshare?retryWrites=true&w=majority
```

**Step 4: Database Configuration**

```typescript
// src/config/database.ts
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(process.env.MONGODB_URI!, options);

    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export default connectDB;
```

---

## File Storage

### Cloudinary Setup

**Step 1: Create Account**

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get credentials from dashboard

**Step 2: Configure**

```typescript
// src/config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

**Step 3: Folder Structure**

Create folders in Cloudinary:
- `studyshare-production/notes`
- `studyshare-production/pyqs`
- `studyshare-production/slides`
- `studyshare-production/other`

**Step 4: Upload Presets**

1. Go to Settings → Upload
2. Create unsigned upload preset
3. Configure:
   - Upload preset name: `studyshare_unsigned`
   - Signing Mode: Unsigned
   - Folder: Auto-detect or specify
   - Access Mode: Public

---

## Domain Configuration

### DNS Setup

**For Vercel (Frontend)**:

Add these DNS records:

```
Type    Name    Value                   TTL
A       @       76.76.21.21            Auto
CNAME   www     cname.vercel-dns.com   Auto
```

**For Railway/Render (Backend)**:

```
Type    Name    Value                      TTL
A       api     [your-backend-ip]         Auto
CNAME   api     [provided-by-platform]    Auto
```

### DNS Providers

Recommended providers:
- Cloudflare (free, fast)
- Google Domains
- Namecheap
- GoDaddy

---

## SSL/HTTPS Setup

### Automatic SSL (Vercel, Netlify, Railway)

These platforms provide automatic SSL. No configuration needed.

### Manual SSL (Nginx on EC2)

Using Let's Encrypt (covered in EC2 section above).

### Force HTTPS

**In Nginx**:

```nginx
server {
    listen 80;
    server_name api.studyshare.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.studyshare.com;

    ssl_certificate /etc/letsencrypt/live/api.studyshare.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.studyshare.com/privkey.pem;

    # ... rest of configuration
}
```

**In Express**:

```typescript
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend
          npm install
      
      - name: Run tests
        run: |
          cd backend
          npm test
      
      - name: Run linter
        run: |
          cd backend
          npm run lint

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up --service backend

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: |
          npm install -g vercel
          cd frontend
          vercel --prod --token=$VERCEL_TOKEN
```

### Environment Secrets

Add these secrets in GitHub repository settings:

- `RAILWAY_TOKEN`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

---

## Monitoring & Logging

### Sentry (Error Tracking)

**Setup**:

```bash
npm install @sentry/node @sentry/tracing
```

**Configuration**:

```typescript
// src/config/sentry.ts
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import express from 'express';

export const initSentry = (app: express.Application) => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
};

export const sentryErrorHandler = Sentry.Handlers.errorHandler();
```

### Winston (Logging)

```bash
npm install winston
```

```typescript
// src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

### PM2 Monitoring

```bash
# PM2 web monitoring
pm2 web

# PM2 monitoring dashboard
pm2 monit

# View logs
pm2 logs studyshare-api
```

---

## Backup Strategies

### Database Backups

**Automated MongoDB Atlas Backups**:

1. Go to Atlas → Backup
2. Enable Continuous Backup
3. Configure backup schedule
4. Set retention period

**Manual Backup Script**:

```bash
#!/bin/bash
# backup-db.sh

set -euo pipefail

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
MONGO_URI="${MONGO_URI:-}"
LOGFILE="${BACKUP_DIR}/backup_${DATE}.log"

mkdir -p "$BACKUP_DIR"

if [ -z "$MONGO_URI" ]; then
  echo "ERROR: MONGO_URI is not set. Aborting backup." >&2
  exit 2
fi

echo "Starting mongodump at $(date -u)" | tee "$LOGFILE"

# Run mongodump and capture output to log; fail fast on error
if ! mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/backup_$DATE" 2>&1 | tee -a "$LOGFILE"; then
  echo "ERROR: mongodump failed. Check $LOGFILE" >&2
  exit 3
fi

# Compress only if mongodump succeeded
if tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C "$BACKUP_DIR" "backup_$DATE" 2>&1 | tee -a "$LOGFILE"; then
  echo "Compressed backup to backup_$DATE.tar.gz" | tee -a "$LOGFILE"
else
  echo "ERROR: tar failed to compress backup. See $LOGFILE" >&2
  exit 4
fi

# Verify archive integrity
if tar -tzf "$BACKUP_DIR/backup_$DATE.tar.gz" > /dev/null 2>&1; then
  # Remove uncompressed only after verification
  rm -rf "$BACKUP_DIR/backup_$DATE"
  echo "Removed uncompressed backup folder" | tee -a "$LOGFILE"
else
  echo "ERROR: Archive verification failed for backup_$DATE.tar.gz" >&2
  exit 5
fi

# Rotate: keep only last 7 backups
ls -1t "$BACKUP_DIR"/*.tar.gz | tail -n +8 | xargs -r rm -f

echo "Backup completed: backup_$DATE.tar.gz" | tee -a "$LOGFILE"
```

**Cron Job** (run daily at 2 AM):

```bash
0 2 * * * /path/to/backup-db.sh >> /var/log/backup.log 2>&1
```

### Cloudinary Backups

Enable auto-backup in Cloudinary settings or use their API to download assets periodically.

---

## Security Hardening

### Security Headers

```typescript
// src/middleware/security.middleware.ts
import helmet from 'helmet';
import express from 'express';

export const securityMiddleware = (app: express.Application) => {
  // Use Helmet
  app.use(helmet());

  // Additional headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
};
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);
```

### Input Sanitization

```bash
npm install express-mongo-sanitize express-validator
```

```typescript
import mongoSanitize from 'express-mongo-sanitize';

app.use(mongoSanitize());
```

### CORS Configuration

```typescript
import cors from 'cors';

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

---

## Performance Optimization

### Backend Optimization

**1. Enable Compression**:

```typescript
import compression from 'compression';

app.use(compression());
```

**2. Implement Caching**:

```bash
npm install node-cache
```

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

// Use in routes
// Namespaced cache keys and invalidation helper
const materialsCacheKey = (req) => `materials_${req.query?.category || 'all'}`;

const invalidateMaterialsCache = () => {
  // Remove any cache entries for materials (e.g., after create/update/delete)
  const keys = cache.keys();
  keys.forEach((k) => {
    if (k.startsWith('materials_')) cache.del(k);
  });
};

const getCachedMaterials = async (req, res) => {
  const cacheKey = materialsCacheKey(req);
  const cached = cache.get(cacheKey);

  if (cached) {
    return res.json(cached);
  }

  // Fetch from database
  // ... fetch `data` based on req.query.category and other filters
  cache.set(cacheKey, data);
  res.json(data);
};

// Example mutation handlers should call invalidateMaterialsCache() after successful DB changes:
const createMaterial = async (req, res) => {
  // ... create material in DB
  // on success:
  invalidateMaterialsCache();
  res.status(201).json({ success: true, data: created });
};

const updateMaterial = async (req, res) => {
  // ... update material in DB
  // on success:
  invalidateMaterialsCache();
  res.json({ success: true, data: updated });
};

const deleteMaterial = async (req, res) => {
  // ... delete material in DB
  // on success:
  invalidateMaterialsCache();
  res.json({ success: true });
};
```

**3. Database Indexing** (covered in Database Schema section)

**4. Connection Pooling**:

```typescript
mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 5,
});
```

### Frontend Optimization

**1. Next.js Optimization**:

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  swcMinify: true,
};
```

**2. Code Splitting**:

```typescript
import dynamic from 'next/dynamic';

const MaterialUpload = dynamic(() => import('@/components/MaterialUpload'), {
  loading: () => <LoadingSpinner />,
});
```

**3. Image Optimization**:

```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="StudyShare"
  width={200}
  height={50}
  priority
/>
```

---

## Troubleshooting

### Common Deployment Issues

**Issue: Build fails on Vercel**

Solution:
```bash
# Check Node version
# Update package.json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Issue: Environment variables not working**

Solution:
- Ensure no extra spaces in .env
- Restart application after changes
- Check variable names match exactly
- Verify deployment platform has variables set

**Issue: MongoDB connection timeout**

Solution:
```typescript
// Increase timeout
mongoose.connect(uri, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
});
```

**Issue: File uploads failing in production**

Solution:
- Check Cloudinary credentials
- Verify file size limits
- Check network configuration
- Review error logs

**Issue: CORS errors**

Solution:
```typescript
// Ensure CORS is properly configured
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

### Debugging Production Issues

```bash
# View application logs
pm2 logs studyshare-api

# Check error logs
tail -f /var/log/nginx/error.log

# Monitor processes
pm2 monit

# Check disk space
df -h

# Check memory
free -m
```

---

## Post-Deployment

### Final Checklist

- [ ] Application accessible via domain
- [ ] HTTPS working correctly
- [ ] All features functional
- [ ] Database connected
- [ ] File uploads working
- [ ] Authentication working
- [ ] Email notifications working (if configured)
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Error tracking setup
- [ ] Performance acceptable

### Announcement

1. Update status page
2. Notify users of new deployment
3. Monitor for issues
4. Be ready for rollback if needed

---

## Rollback Procedure

### Vercel/Netlify Rollback

1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

### Railway/Render Rollback

1. Access deployment history
2. Redeploy previous version

### Manual Rollback (PM2)

```bash
# Snapshot current state and prepare for rollback
pm2 save                       # snapshot process list/state
git log -1                     # record current commit for documentation

# Back up and document current database before changing code
# (run your backup-db.sh or other backup procedure and note the backup id)
./scripts/backup-db.sh || { echo "Database backup failed; aborting rollback" >&2; exit 1; }

# Stop current application
pm2 stop studyshare-api

# Checkout previous version
git checkout <previous-commit-hash>

# Rebuild dependencies and artifacts
npm install
npm run build

# Restore prior environment variables if needed (copy .env.backup -> .env)
# Ensure sensitive env vars like DB_URI and JWT_SECRET match the previous release

# Restart the process
pm2 restart studyshare-api

# Post-restart verification and monitoring
pm2 logs studyshare-api --lines 100
curl -f http://localhost:5000/api/health || { echo "Health check failed" >&2; }

# Document rollback: commit/log why and what was rolled back
git --no-pager log -1 --pretty=oneline
echo "Rollback completed. Document the reason and backup ID in the incident tracker."
```

---

## Maintenance

### Regular Tasks

**Daily**:
- Monitor error logs
- Check application performance
- Review security alerts

**Weekly**:
- Review backup status
- Check disk space
- Update dependencies (if needed)
- Review analytics

**Monthly**:
- Security audit
- Performance optimization
- Database cleanup
- Update documentation

---

## Support & Resources

### Documentation
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)

### Community
- GitHub Issues
- Stack Overflow
- Discord/Slack community

---

## Conclusion

Congratulations on deploying StudyShare! 🎉

Remember to:
- Monitor your application regularly
- Keep dependencies updated
- Maintain regular backups
- Review security practices
- Optimize performance continuously

For issues or questions:
- Email: satendrakumarparteti.work@gmail.com
- GitHub: [Open an issue](https://github.com/satendra03/Study-Share/issues)

---

**Last Updated**: February 2026  
**Version**: 1.0

Happy Deploying! 🚀