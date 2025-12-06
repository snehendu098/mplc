#!/usr/bin/env bash

# SRGG Marketplace Platform - Setup Script
# This script will set up the entire platform

set -e

echo "🚀 SRGG Marketplace Platform - Setup Script"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running from correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Found package.json"

# Step 1: Fix permissions (if needed)
echo ""
echo "Step 1: Checking permissions..."
if [ ! -w "." ]; then
    echo -e "${YELLOW}! Fixing permissions...${NC}"
    if [ "$(uname)" == "Darwin" ]; then
        # macOS
        sudo chown -R $(whoami):staff .
    else
        # Linux
        sudo chown -R $(whoami):$(id -gn) .
    fi
    echo -e "${GREEN}✓${NC} Permissions fixed"
else
    echo -e "${GREEN}✓${NC} Permissions OK"
fi

# Step 2: Install dependencies
echo ""
echo "Step 2: Installing dependencies..."
if command -v npm &> /dev/null; then
    npm install
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${RED}Error: npm not found. Please install Node.js 20+ and npm.${NC}"
    exit 1
fi

# Step 3: Set up environment variables
echo ""
echo "Step 3: Setting up environment variables..."
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✓${NC} Created .env.local from .env.example"
    echo -e "${YELLOW}! Please update .env.local with your configuration${NC}"
else
    echo -e "${YELLOW}! .env.local already exists, skipping${NC}"
fi

# Step 4: Start Docker containers
echo ""
echo "Step 4: Starting Docker containers..."
if command -v docker-compose &> /dev/null || command -v docker &> /dev/null; then
    if docker-compose version &> /dev/null; then
        docker-compose up -d
    elif docker compose version &> /dev/null; then
        docker compose up -d
    else
        echo -e "${RED}Error: docker-compose not found${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Docker containers started"
    echo ""
    echo "Waiting for databases to be ready..."
    sleep 10
else
    echo -e "${YELLOW}! Docker not found. You'll need to set up databases manually.${NC}"
fi

# Step 5: Generate Prisma client
echo ""
echo "Step 5: Generating Prisma client..."
npm run prisma:generate
echo -e "${GREEN}✓${NC} Prisma client generated"

# Step 6: Push database schema
echo ""
echo "Step 6: Pushing database schema..."
npm run db:push
echo -e "${GREEN}✓${NC} Database schema pushed"

# Step 7: Seed database (optional)
echo ""
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "prisma/seed.ts" ]; then
        npm run prisma:seed
        echo -e "${GREEN}✓${NC} Database seeded"
    else
        echo -e "${YELLOW}! Seed file not found, skipping${NC}"
    fi
fi

# Step 8: Build project
echo ""
echo "Step 8: Building project..."
npm run build
echo -e "${GREEN}✓${NC} Project built successfully"

# Done
echo ""
echo "=============================================="
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update your .env.local file with your API keys and configuration"
echo "2. Start the development server: npm run dev"
echo "3. Visit http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run start        - Start production server"
echo "  npm run prisma:studio - Open Prisma Studio"
echo "  npm run docker:up    - Start Docker containers"
echo "  npm run docker:down  - Stop Docker containers"
echo ""
echo "Docker services running:"
echo "  PostgreSQL:    localhost:5432"
echo "  TimescaleDB:   localhost:5433"
echo "  MongoDB:       localhost:27017"
echo "  Redis:         localhost:6379"
echo "  MQTT:          localhost:1883"
echo "  Ganache:       localhost:8545"
echo "  IPFS:          localhost:5001"
echo "  MailHog UI:    http://localhost:8025"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
