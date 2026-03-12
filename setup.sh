#!/bin/bash

echo "🚀 POS PWA Auth Quick Setup Script"

# -----------------------------
# 1. Check Node & npm
# -----------------------------
echo "🔹 Checking Node.js and npm versions..."
node_version=$(node -v | sed 's/v//')
npm_version=$(npm -v)

node_major=$(echo $node_version | cut -d. -f1)
npm_major=$(echo $npm_version | cut -d. -f1)

echo "Node.js version: $node_version"
echo "npm version: $npm_version"

if [[ $node_major -lt 18 ]]; then
    echo "❌ Node.js v18+ is required. Please update Node.js."
    exit 1
fi

if [[ $npm_major -lt 9 ]]; then
    echo "❌ npm v9+ is required. Please update npm."
    exit 1
fi

# -----------------------------
# 2. Prompt for DATABASE_URL
# -----------------------------
read -p "Enter your DATABASE_URL (PostgreSQL, Vercel, Neon, etc.): " DB_URL

# -----------------------------
# 3. Install dependencies
# -----------------------------
echo "🔹 Installing dependencies..."
npm cache clean --force
npm install --legacy-peer-deps || { echo "❌ npm install failed"; exit 1; }

# -----------------------------
# 4. Copy .env.example → .env.local
# -----------------------------
echo "🔹 Setting up environment file..."
cp .env.example .env.local

# -----------------------------
# 5. Generate NEXTAUTH_SECRET
# -----------------------------
echo "🔹 Generating NEXTAUTH_SECRET..."
NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Update .env.local
sed -i '' "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|" .env.local 2>/dev/null || \
sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|" .env.local

sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=$DB_URL|" .env.local 2>/dev/null || \
sed -i "s|DATABASE_URL=.*|DATABASE_URL=$DB_URL|" .env.local

echo "✅ Environment setup complete."

# -----------------------------
# 6. Install NextAuth stable v4
# -----------------------------
echo "🔹 Installing stable NextAuth v4..."
npm install next-auth@^4.27.1 --legacy-peer-deps || { echo "❌ NextAuth install failed"; exit 1; }

# -----------------------------
# 7. Prisma generate & migrate
# -----------------------------
echo "🔹 Generating Prisma client..."
npm run prisma:generate || { echo "❌ Prisma generate failed"; exit 1; }

echo "🔹 Running database migrations..."
npm run prisma:migrate || { echo "❌ Prisma migrate failed"; exit 1; }

# -----------------------------
# 8. Start development server
# -----------------------------
echo "🔹 Starting development server..."
npm run dev