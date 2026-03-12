# Quick Start Guide

Get up and running with POS SaaS in 10 minutes!

## TL;DR (The Absolute Fastest Way)

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local

# 3. Generate auth secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output and paste into NEXTAUTH_SECRET in .env.local

# 4. Update database URL in .env.local
# If using local PostgreSQL:
# DATABASE_URL="postgresql://pos_user:password@localhost:5432/pos_saas"

# 5. Setup database
npm run prisma:generate
npm run prisma:migrate

# 6. Start development
npm run dev

# 7. Open browser
# http://localhost:3000
```

## Step-by-Step Setup

### 1. Prerequisites Check (2 minutes)

Open terminal and verify:

```bash
node --version  # Should be v18+ or v20+
npm --version   # Should be v9+
```

### 2. Install Dependencies (3 minutes)

```bash
npm install
```

### 3. Environment Setup (3 minutes)

**Copy template:**
```bash
cp .env.example .env.local
```

**Generate secret (replace NEXTAUTH_SECRET):**

On macOS/Linux:
```bash
openssl rand -base64 32
```

On Windows (PowerShell):
```powershell
[System.Convert]::ToBase64String($(1..32 | ForEach-Object {[byte]$_}))
```

Or anywhere:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output.

**Edit .env.local** (use any text editor):

```bash
DATABASE_URL="postgresql://pos_user:password@localhost:5432/pos_saas"
NEXTAUTH_SECRET="paste_your_secret_here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup (1 minute)

**For PostgreSQL (local):**

Create database:
```bash
psql -U postgres

# Inside psql:
CREATE USER pos_user WITH PASSWORD 'pos_password_123';
ALTER USER pos_user CREATEDB;
CREATE DATABASE pos_saas OWNER pos_user;
```

Test connection:
```bash
psql -U pos_user -d pos_saas -h localhost
# Type: \q to exit
```

**For Vercel Postgres (cloud):**
1. Get connection string from Vercel
2. Paste into DATABASE_URL in .env.local

### 5. Initialize Database (1 minute)

```bash
# Generate Prisma client
npm run prisma:generate

# Create tables
npm run prisma:migrate

# When prompted, enter a name like: "init"
```

### 6. Start Development Server (1 minute)

```bash
npm run dev
```

Output should show:
```
▲ Next.js 14.2.1
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

### 7. Test the Application

Open browser to: **http://localhost:3000**

#### Test Signup ✅

1. Go to `/signup`
2. Fill form:
   - **Name**: John Doe
   - **Email**: john@test.com
   - **Password**: Test123!@#
3. Click "Create Account"
4. Should redirect to login

#### Test Login ✅

1. On login page, enter:
   - **Email**: john@test.com
   - **Password**: Test123!@#
2. Click "Sign In"
3. Should go to dashboard

#### Test Dashboard ✅

1. Should see:
   - Welcome message with your name
   - Account information
   - Quick action buttons
   - Coming soon features

## Commands Quick Reference

```bash
# Development
npm run dev         # Start dev server
npm run build       # Build for production
npm run start       # Start prod server

# Database
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open DB UI (http://localhost:5555)

# Code quality
npm run lint        # Run linter
npm run type-check  # TypeScript check
```

## Password Requirements

Must have:
- ✅ Minimum 8 characters
- ✅ At least 1 uppercase letter (A-Z)
- ✅ At least 1 lowercase letter (a-z)
- ✅ At least 1 number (0-9)
- ✅ At least 1 special character (!@#$%^&*)

Example valid: `Test123!@#`

## File Structure Overview

```
src/
├── app/          # Pages and API routes
├── components/   # React components (forms, buttons, alerts)
├── lib/          # Config and utilities
├── services/     # Business logic
├── repositories/ # Database access
└── types/        # TypeScript types

public/
├── manifest.json # PWA configuration
└── robots.txt    # SEO

prisma/
└── schema.prisma # Database schema
```

## Troubleshooting

### "Port 3000 already in use"
```bash
npm run dev -- -p 3001
# Open http://localhost:3001
```

### "Database connection refused"
1. Ensure PostgreSQL is running
2. Check DATABASE_URL is correct
3. Verify credentials

### "NEXTAUTH_SECRET not found"
Ensure it's in .env.local (not .env)

### Styles not loading
```bash
npm run build
rm -rf .next
npm run dev
```

### "Invalid email or password" on login
1. Make sure signup completed
2. Try exact email and password
3. Check Prisma Studio: `npm run prisma:studio`

## What's Working? ✅

- ✅ User signup with validation
- ✅ User login with authentication
- ✅ Protected dashboard
- ✅ Session management
- ✅ Password hashing
- ✅ Responsive UI
- ✅ PWA ready
- ✅ TypeScript support
- ✅ Database setup

## What's Coming Next? 🚀

### Phase 2 (POS Core)
- Product & inventory management
- Sales transactions
- Receipt printing
- Stock tracking

### Phase 3 (Multi-Business)
- Multiple business support
- Team management
- Advanced permissions

### Phase 4 (Advanced)
- Cryptocurrency payments
- Loyalty program
- Blockchain integration
- Online store integration

## Need Help?

1. **Check logs**: Look at terminal output
2. **Read docs**: See README.md and SETUP_GUIDE.md
3. **Database UI**: Run `npm run prisma:studio`
4. **Architecture**: See ARCHITECTURE.md

## Next Actions

After successful setup:

1. Explore the codebase
2. Try creating multiple users
3. Test the API with Postman
4. Review the database schema
5. Plan Phase 2 features
6. Deploy to Vercel (optional)

---

**You're all set! 🎉**

Start developing your POS system now!
