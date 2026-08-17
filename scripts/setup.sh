#!/bin/bash

# CivicVoice Setup Script
# Run this script to set up the development environment

set -e

echo "╔═══════════════════════════════════════════════════════╗"
echo "║         CivicVoice Development Setup                  ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

step() {
    echo -e "${GREEN}➤${NC} $1"
}

# Check prerequisites
step "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker Desktop"
    exit 1
fi

node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 20 ]; then
    echo "❌ Node.js version must be 20 or higher. Current: v$node_version"
    exit 1
fi

echo "✅ Node.js: $(node -v)"
echo "✅ npm: $(npm -v)"
echo "✅ Docker: $(docker --version)"
echo ""

# Step 1: Install dependencies
step "Installing dependencies..."
npm install
echo ""

# Step 2: Start Docker containers
step "Starting Docker containers..."
docker compose -f docker/docker-compose.yml up -d
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5
echo ""

# Step 3: Copy env file
step "Setting up environment variables..."
if [ ! -f apps/backend/.env ]; then
    cp apps/backend/.env.example apps/backend/.env
    echo "✅ Created apps/backend/.env"
else
    echo "✅ apps/backend/.env already exists"
fi
echo ""

# Step 4: Generate Prisma client
step "Generating Prisma client..."
cd apps/backend
npx prisma generate
cd ../..
echo ""

# Step 5: Run migrations
step "Running database migrations..."
cd apps/backend
npx prisma migrate dev --name init --skip-generate
cd ../..
echo ""

# Step 6: Seed database
step "Seeding database with sample data..."
cd apps/backend
npx prisma db seed
cd ../..
echo ""

# Step 7: Create uploads directory
step "Creating uploads directory..."
mkdir -p apps/backend/uploads
echo ""

echo "╔═══════════════════════════════════════════════════════╗"
echo "║                    Setup Complete!                    ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "Services:"
echo "  Frontend:   http://localhost:5173"
echo "  Backend:    http://localhost:4000"
echo "  API Docs:   http://localhost:4000/api/docs"
echo "  pgAdmin:    http://localhost:5050"
echo ""
echo "Test Accounts:"
echo "  Admin:     admin@civicvoice.local / admin123"
echo "  Citizen:   citizen@example.com / citizen123"
echo ""
