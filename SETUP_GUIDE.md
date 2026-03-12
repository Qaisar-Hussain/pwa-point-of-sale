# Complete Setup & Installation Guide

This guide provides step-by-step instructions to get the POS SaaS application running locally.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Verifying the Installation](#verifying-the-installation)
7. [Next Steps](#next-steps)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have the following installed:

### Required
- **Node.js** v18.x or v20.x (Download from https://nodejs.org/)
- **npm** v9+ (comes with Node.js)
- **PostgreSQL** v12+ (Download from https://www.postgresql.org/download/)

### Optional (for development)
- **Git** (for version control)
- **Postman** or **Thunder Client** (for API testing)
- **DBeaver** or **pgAdmin** (for database management)

### Verify Installation

Open a terminal/command prompt and verify:

```bash
# Check Node.js version
node --version
# Expected: v18.x.x or v20.x.x

# Check npm version
npm --version
# Expected: v9+

# Check PostgreSQL (if installed)
psql --version
# Expected: psql (PostgreSQL) 12+
```

## Installation Steps

### Step 1: Navigate to Project Directory

```bash
cd /home/qaisarhussain/pwa-point-of-sale
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`:
- Next.js 14+
- React 18
- TypeScript
- Prisma ORM
- Next-Auth
- Tailwind CSS
- And other dependencies

**Expected output**: "added XXX packages"

### Step 3: Verify Installation

```bash
# Check if all packages installed correctly
npm list --depth=0
```

You should see all major packages listed without errors.

## Database Setup

### Option A: PostgreSQL Local Installation

#### 1. Start PostgreSQL Service

**On macOS (using Homebrew):**
```bash
brew services start postgresql
```

**On Linux (Ubuntu/Debian):**
```bash
sudo systemctl start postgresql
```

**On Windows:**
```
Use PostgreSQL installer's service or run pgAdmin
```

#### 2. Create Database User and Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql shell, execute:
CREATE USER pos_user WITH PASSWORD 'secure_password_123';
ALTER USER pos_user CREATEDB;
CREATE DATABASE pos_saas OWNER pos_user;
```

#### 3. Verify Connection

```bash
psql -U pos_user -d pos_saas -h localhost
```

Type `\q` to exit.

### Option B: Vercel Postgres (Cloud)

1. Go to https://vercel.com/storage/postgres
2. Create a new Postgres database
3. Copy the connection string
4. Save for later in Environment Configuration

### Option C: Local Development (Docker)

If you prefer Docker:

```bash
# Create and run PostgreSQL container
docker run --name pos-postgres \
  -e POSTGRES_USER=pos_user \
  -e POSTGRES_PASSWORD=secure_password_123 \
  -e POSTGRES_DB=pos_saas \
  -p 5432:5432 \
  -d postgres:15
```

## Environment Configuration

### Step 1: Copy Environment Template

```bash
cp .env.example .env.local
```

### Step 2: Edit .env.local

Open `.env.local` and update the following:

```bash
# DATABASE_URL Configuration

# For Local PostgreSQL:
DATABASE_URL="postgresql://pos_user:secure_password_123@localhost:5432/pos_saas"

# For Vercel Postgres (if using):
# Copy the entire connection string from Vercel dashboard
# DATABASE_URL="postgresql://..."

# For Docker:
# DATABASE_URL="postgresql://pos_user:secure_password_123@localhost:5432/pos_saas"
```

### Step 3: Generate Auth Secret

Run one of these commands:

**Option 1: Using OpenSSL (macOS/Linux)**
```bash
openssl rand -base64 32
```

**Option 2: Using Node.js (All platforms)**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 3: Using Node.js alternative**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and add to `.env.local`:

```bash
NEXTAUTH_SECRET="paste_the_output_here"
```

### Step 4: Set Other Variables

```bash
NEXTAUTH_URL="http://localhost:3000"
SITE_URL="http://localhost:3000"
```

### Final .env.local Example

```bash
# Database
DATABASE_URL="postgresql://pos_user:secure_password_123@localhost:5432/pos_saas"

# Auth
NEXTAUTH_SECRET="abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
NEXTAUTH_URL="http://localhost:3000"

# Site
SITE_URL="http://localhost:3000"
```

## Running the Application

### Step 1: Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the Prisma client based on your schema.

### Step 2: Run Database Migrations

```bash
npm run prisma:migrate
```

This will:
1. Create all database tables
2. Set up relationships
3. Create indexes

You'll be prompted to name the migration (e.g., "init"):
```
Enter a name for this migration › init
```

### Step 3: (Optional) Open Prisma Studio

To visually inspect your database:

```bash
npm run prisma:studio
```

This opens Prisma Studio at http://localhost:5555

### Step 4: Start Development Server

```bash
npm run dev
```

Expected output:
```
> next dev

  ▲ Next.js 14.2.1
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.5s
```

### Step 5: Open in Browser

Navigate to http://localhost:3000

You should see:
- Redirect to login page
- Clean, modern login interface

## Verifying the Installation

### Test Signup Flow

1. Navigate to http://localhost:3000/signup
2. Enter:
   - **Name**: John Doe
   - **Email**: john@example.com
   - **Password**: SecurePass123!
3. Click "Create Account"
4. Should see success message and redirect to login

### Test Login Flow

1. Navigate to http://localhost:3000/login
2. Enter:
   - **Email**: john@example.com
   - **Password**: SecurePass123!
3. Click "Sign In"
4. Should redirect to dashboard

### Verify Dashboard

1. You should see:
   - User information displayed
   - Welcome message
   - Quick action buttons
   - Coming soon features

### Check Database

```bash
# Open Prisma Studio
npm run prisma:studio

# Navigate to Users table
# Should see your new user entry
```

### Run Type Checking

```bash
npm run type-check
```

Expected output: "Type checking completed successfully"

## Next Steps

### 1. Testing with Created Users

Create multiple test users with different scenarios:

```bash
# Test user 1
Name: Alice Smith
Email: alice@example.com
Password: AlicePassword123!

# Test user 2
Name: Bob Johnson
Email: bob@example.com
Password: BobPassword456!
```

### 2. API Testing with Postman

**Test Signup Endpoint:**

1. Method: POST
2. URL: `http://localhost:3000/api/auth/signup`
3. Headers: `Content-Type: application/json`
4. Body:
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "TestPass123!@#"
}
```

**Test Profile Endpoint:**

1. Method: GET
2. URL: `http://localhost:3000/api/auth/profile`
3. Note: Requires authentication (will be in browser session)

### 3. PWA Installation

1. In Chrome: Click menu → "Install POS SaaS" (or similar)
2. App will install to home screen/applications
3. Can run offline with cached assets

### 4. Code Exploration

Review the codebase structure:

```bash
# Start VS Code
code .

# Or open in your editor
# Explore these key files:
# - src/lib/auth.ts (Auth.js config)
# - src/services/authService.ts (Business logic)
# - src/app/(auth)/login/page.tsx (Login UI)
# - prisma/schema.prisma (Database design)
```

## Troubleshooting

### Issue: "Cannot find module 'next'"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Database connection refused"

**Solution:**
1. Verify PostgreSQL is running
2. Check DATABASE_URL in `.env.local`
3. Test connection:
```bash
psql -U pos_user -d pos_saas -h localhost
```

### Issue: "NEXTAUTH_SECRET is missing"

**Solution:**
Generate and add to `.env.local`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Issue: "Port 3000 already in use"

**Solution:**
Use different port:
```bash
npm run dev -- -p 3001
```

Then navigate to http://localhost:3001

### Issue: Prisma migration fails

**Solution:**
1. Check DATABASE_URL is correct
2. Ensure PostgreSQL is running
3. Try resetting database:
```bash
npm run prisma:migrate reset
# Type 'y' to confirm
```

### Issue: "Invalid email or password" on login

**Solution:**
1. Ensure signup completed successfully
2. Verify email and password case-sensitive
3. Check database in Prisma Studio:
```bash
npm run prisma:studio
```

### Issue: Session/Authentication not persisting

**Solution:**
1. Clear browser cookies
2. Clear browser cache
3. Check NEXTAUTH_SECRET is set
4. Restart development server

### Issue: Styling not loading (no Tailwind styles)

**Solution:**
```bash
npm run build
```

If rebuild doesn't help:
```bash
# Remove build cache
rm -rf .next
npm run dev
```

## Common Commands Reference

```bash
# Development
npm run dev                  # Start dev server
npm run build               # Build for production
npm run start               # Start production server
npm run lint                # Run ESLint
npm run type-check          # Check TypeScript

# Database
npm run prisma:generate     # Generate Prisma client
npm run prisma:migrate      # Run migrations
npm run prisma:studio       # Open Prisma Studio

# Database reset (CAUTION: deletes all data)
npm run prisma:migrate reset
```

## Development Settings

### Recommended Extensions (VS Code)

```json
{
  "recommendations": [
    "ms-dotnettools.csharp",
    "Prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "eamodio.gitlens"
  ]
}
```

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## Production Deployment Checklist

Before deploying to production:

- [ ] Generate strong NEXTAUTH_SECRET
- [ ] Set proper environment variables
- [ ] Use a managed PostgreSQL service (Vercel Postgres, AWS RDS, etc.)
- [ ] Enable HTTPS
- [ ] Set NEXTAUTH_URL to production domain
- [ ] Run `npm run build` successfully
- [ ] Test authentication flow in production
- [ ] Set up monitoring and logging
- [ ] Enable database backups
- [ ] Configure CDN for static assets

## Getting Help

If you encounter issues:

1. **Check the logs**: Look at your terminal output
2. **Read error messages carefully**: They usually indicate the problem
3. **Check .env.local**: Most issues are environment-related
4. **Verify database connection**: Use Prisma Studio
5. **Clear cache**: Sometimes `rm -rf .next node_modules` helps
6. **Check documentation**:
   - Next.js: https://nextjs.org/docs
   - Prisma: https://www.prisma.io/docs
   - Auth.js: https://authjs.dev/guides

## What's Next?

After successful setup:

1. ✅ Explore the codebase
2. ✅ Understand the architecture
3. ✅ Test all authentication flows
4. ✅ Modify database schema for your needs
5. ✅ Build POS features (Phase 2)
6. ✅ Add multi-business support (Phase 3)
7. ✅ Deploy to production

---

**Congratulations! Your POS SaaS is ready for development.** 🎉

For questions or issues, refer to the README.md or check the documentation in each module.
