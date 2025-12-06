#!/usr/bin/env bash

# SRGG Marketplace - Standalone Setup (No Docker!)
# Run this ONE command to set up everything

set -e

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║   🌍 SRGG MARKETPLACE - STANDALONE SETUP (No Docker!) 🚀         ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

cd /Users/sudipto/Desktop/projects/mplc

# Step 1: Clean npm cache (fix permission issues)
echo "Step 1/5: Cleaning npm cache..."
rm -rf node_modules package-lock.json
npm cache clean --force 2>/dev/null || true
echo "✓ Cache cleaned"
echo ""

# Step 2: Install dependencies
echo "Step 2/5: Installing dependencies..."
npm install --legacy-peer-deps
echo "✓ Dependencies installed"
echo ""

# Step 3: Generate Prisma client
echo "Step 3/5: Generating Prisma client..."
npx prisma generate
echo "✓ Prisma client generated"
echo ""

# Step 4: Create database & push schema
echo "Step 4/5: Creating database..."
npx prisma db push --skip-generate
echo "✓ Database created"
echo ""

# Step 5: Seed database with sample data
echo "Step 5/5: Seeding database..."
npm run seed
echo ""

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║                    ✅ SETUP COMPLETE! 🎉                          ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Start the platform:"
echo "   npm run dev"
echo ""
echo "🌐 Then visit:"
echo "   http://localhost:3000"
echo ""
echo "🔑 Login Credentials:"
echo "   Admin:    admin@srgg.com / Admin123!"
echo "   Producer: producer@srgg.com / Producer123!"
echo "   Buyer:    buyer@srgg.com / Buyer123!"
echo ""
echo "📚 Features:"
echo "   • Multi-tenant system"
echo "   • Producer dashboard with 3 active listings"
echo "   • Buyer marketplace"
echo "   • Admin panel"
echo "   • SQLite database (no Docker needed!)"
echo "   • Complete API layer"
echo ""
echo "Happy coding! 🎉"
echo ""
