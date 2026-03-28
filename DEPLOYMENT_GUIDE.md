# Deployment Guide - From Local to Production

This guide covers deploying your POS SaaS to production on Vercel, the recommended platform for Next.js apps.

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All features tested locally
- [ ] `npm run build` succeeds
- [ ] `npm run type-check` passes
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Secrets secured
- [ ] Git repository initialized
- [ ] Code pushed to GitHub/GitLab

## 🚀 Deployment on Vercel (Recommended)

Vercel is the official Next.js platform and simplest to deploy.

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub, GitLab, or email
3. Authorize access to your repositories

### Step 2: Push to GitHub

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial POS SaaS release"

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/pwa-point-of-sale.git

# Push
git branch -M main
git push -u origin main
```

### Step 3: Import on Vercel

1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Search for `pwa-point-of-sale`
4. Click "Import"

### Step 4: Configure Environment Variables

In Vercel dashboard:

1. Go to "Settings" → "Environment Variables"
2. Add the following variables:

```
DATABASE_URL          = <PostgreSQL connection string>
NEXTAUTH_SECRET       = <your generated secret>
NEXTAUTH_URL          = https://your-domain.com
SITE_URL              = https://your-domain.com
NODE_ENV              = production
```

### Step 5: Connect Database

#### Option A: Vercel Postgres (Easiest)

1. Go to https://vercel.com/storage/postgres
2. Create new database
3. Copy the connection string
4. Paste into DATABASE_URL in Vercel environment variables
5. Download `.env.local` file for reference

#### Option B: External PostgreSQL

If using external database (AWS RDS, Railway, etc.):

1. Get full connection string
2. Add to DATABASE_URL environment variable

### Step 6: Deploy

1. Click "Deploy"
2. Wait for build (usually 2-3 minutes)
3. Once complete, your app is live

### Step 7: Run Migrations on Production

After first deployment:

```bash
# Pull production environment variables locally
vercel env pull .env.production.local

# Export them for the current shell
set -a
source .env.production.local
set +a

# Apply committed Prisma migrations to production
npm run prisma:deploy
```

Important:

- Your Prisma schema in this repo uses PostgreSQL, so `DATABASE_URL` must be a PostgreSQL connection string.
- If you see `the URL must start with the protocol file:`, the deployment is still using an older SQLite-based Prisma schema or an outdated environment setup.
- Redeploy with build cache cleared after confirming the deployed commit contains `provider = "postgresql"` in `prisma/schema.prisma`.

## 🛠️ Alternative Deployment Options

### Option 2: Railway.app

Railway supports PostgreSQL and Next.js.

1. Go to https://railway.app
2. Sign up
3. Create new project
4. Add PostgreSQL plugin
5. Add GitHub repo
6. Configure environment variables
7. Deploy

### Option 3: Render.com

1. Go to https://render.com
2. Sign up
3. Create new "Web Service"
4. Connect GitHub
5. Set `npm run build` as build command
6. Set `npm start` as start command
7. Add environment variables
8. Deploy

### Option 4: Self-Hosted (AWS, Azure, DigitalOcean)

For full control or specific requirements:

**Deploy to EC2/Droplet:**

```bash
# SSH into server
ssh ubuntu@your-server.com

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/YOUR_USERNAME/pwa-point-of-sale.git
cd pwa-point-of-sale

# Install dependencies
npm install

# Create .env file
cat > .env.local << EOF
DATABASE_URL="your-database-url"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://your-domain.com"
EOF

# Build
npm run build

# Run with PM2
sudo npm install -g pm2
pm2 start "npm start" --name "pos-saas"

# Setup auto-start
pm2 startup
pm2 save
```

## 🔐 Production Security Checklist

### Environment Variables
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] No secrets in code
- [ ] All sensitive vars in environment
- [ ] .env.local is in .gitignore
- [ ] Production and dev secrets differ

### Database
- [ ] Database has strong password
- [ ] Connection uses SSL
- [ ] Regular backups enabled
- [ ] Only allow app server IP to connect
- [ ] Read replicas for scaling

### API Security
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting in place (add later)
- [ ] CORS properly configured
- [ ] Input validation on all endpoints

### Application
- [ ] Error messages don't leak info
- [ ] No console.log with sensitive data
- [ ] Build is production optimized
- [ ] Source maps disabled in production

## 📊 Monitoring & Logs

### Vercel Monitoring

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# View logs
vercel logs

# View deployments
vercel ls
```

### Database Monitoring

For Vercel Postgres:
1. Go to Vercel dashboard
2. Select project
3. Go to "Storage" → "Postgres"
4. View metrics and queries

## 🔄 Continuous Deployment (CI/CD)

### GitHub Actions (Auto-Deploy on Push)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm run type-check
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 🔄 Database Migrations in Production

### Using Prisma Migrate

```bash
# Before deploy, test locally:
npm run prisma:migrate

# After deploy to production:
# Option 1: Via Vercel CLI
vercel env pull
npm run prisma:migrate

# Option 2: Create migration endpoint (optional)
# This allows migrations without SSH access
```

## 🆘 Troubleshooting Deployment

### Build Fails

```bash
# Check build locally first
npm run build

# If builds locally but not on Vercel:
# 1. Check Node.js version (should match Vercel)
# 2. Check environment variables
# 3. Check dependencies in package.json
```

### Database Connection Fails

```
Error: connect ECONNREFUSED
```

### Solutions:
1. Verify DATABASE_URL is correct
2. Ensure database allows remote connections
3. Check network rules/firewall
4. Test connection locally first

### Stuck Deployments

In Vercel dashboard:
1. Go to deployments
2. Find stuck deployment
3. Click three dots → "Cancel"
4. Trigger new deployment

## 📈 Scaling Considerations

### Read-Only Replicas

If queries are slow:
```prisma
# For read operations, configure read replicas
# Documentation: https://www.prisma.io/docs/guides/performance/optimizing-databas-queries-with-connection-pooling
```

### Caching

Add Redis for caching:
```bash
# Use Vercel KV (Redis)
# Or self-hosted Redis
```

### CDN

Vercel automatically uses Vercel Edge Network. For custom CDN:
- Configure CloudFlare
- Set origin to Vercel
- Cache static assets

## 🔄 Updates & Deployments

### Push Production Updates

```bash
# Make changes locally
# Test thoroughly

# Commit
git add .
git commit -m "Feature: Add new capability"

# Push (triggers auto-deploy if CI/CD enabled)
git push origin main

# Monitor deployment in Vercel dashboard
```

### Rollback

If something breaks:

In Vercel dashboard:
1. Go to "Deployments"
2. Find working deployment
3. Click three dots → "Promote to Production"

## 📊 Production Analytics

### Setup Error Tracking

Use Sentry for error monitoring:

1. Create Sentry account
2. Create Next.js project
3. Install Sentry:
```bash
npm install @sentry/nextjs
```

4. Initialize in `next.config.js`:
```javascript
const withSentry = require("@sentry/nextjs").withSentry;

module.exports = withSentry(nextConfig);
```

### Access Logs

Vercel logs available at:
```bash
vercel logs --follow
```

## 🎯 Production Launch Checklist

- [ ] All features tested
- [ ] Database backed up
- [ ] Monitoring configured
- [ ] Error tracking set up
- [ ] Security headers enabled
- [ ] HTTPS working
- [ ] Email notifications working (when added)
- [ ] Team can access production
- [ ] Incident response plan ready
- [ ] Status page created (optional)

## 📞 Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment
- **PostgreSQL Best Practices**: https://wiki.postgresql.org/wiki/Performance_Optimization

## 🚀 Next Steps

After deployment:

1. Monitor error rates
2. Track performance metrics
3. Plan Phase 2 features
4. Set up user feedback
5. Plan scaling improvements

---

**Your POS SaaS is now live in production!** 🎉

For monitoring and maintenance, check the administrator guide in the team documentation.
