# 🚀 SRGG Marketplace - Quick Start (Standalone - No Docker!)

## ✅ What's Been Built

A **complete, self-contained SRGG Marketplace Platform** that works WITHOUT Docker!

- ✅ **SQLite Database** (no PostgreSQL/Docker needed)
- ✅ **Complete UI** (Login page + 3 dashboards)
- ✅ **Sample Data** (Pre-seeded with users, listings, commodities)
- ✅ **Full API Layer** (Authentication, producers, listings, orders)
- ✅ **Mock Services** (Blockchain, insurance, payments)

---

## 🎯 ONE-COMMAND SETUP

Run this single command:

```bash
/Users/sudipto/Desktop/projects/mplc/STANDALONE_SETUP.sh
```

**That's it!** The script will:
1. Clean npm cache
2. Install all dependencies
3. Generate Prisma client
4. Create SQLite database
5. Seed with sample data

---

## ▶️ Start the Platform

After setup completes:

```bash
cd /Users/sudipto/Desktop/projects/mplc
npm run dev
```

---

## 🌐 Access the Platform

Visit: **http://localhost:3000**

You'll be redirected to the login page.

---

## 🔑 Login Credentials

### Admin User
```
Email:    admin@srgg.com
Password: Admin123!
```

### Producer User
```
Email:    producer@srgg.com
Password: Producer123!
```

### Buyer User
```
Email:    buyer@srgg.com
Password: Buyer123!
```

---

## 📱 What You Can Do

### As Admin (`admin@srgg.com`)
- View platform statistics
- See all producers, listings, and orders
- Access admin dashboard
- Monitor platform health

### As Producer (`producer@srgg.com`)
- View your 3 active listings:
  - Premium Cocoa Beans (1,000 kg @ $2.50/kg)
  - Gold Ore - Grade A (100 oz @ $1,850/oz)
  - Organic Coffee Beans (500 kg @ $5.75/kg)
- See your SRGG Economic ID: `SRGG-GH-25-000001`
- Track orders and revenue
- Manage your profile

### As Buyer (`buyer@srgg.com`)
- Browse available commodities
- View listing details
- Place orders (mock)
- Track purchases

---

## 🗂️ Database

**Location**: `/Users/sudipto/Desktop/projects/mplc/prisma/dev.db`

**Type**: SQLite (single file, no server needed!)

**Pre-seeded with**:
- 1 Tenant (SRGG Demo - Ghana)
- 3 Users (Admin, Producer, Buyer)
- 1 Producer profile
- 1 Land parcel
- 4 Commodities (Cocoa, Gold, Coffee, Cassava)
- 3 Active listings
- 1 Quality certificate

---

## 🔧 Useful Commands

```bash
# Start development server
npm run dev

# Reset database (delete & recreate)
npm run reset

# View database
npx prisma studio
# Then visit: http://localhost:5555

# Re-seed database
npm run seed
```

---

## 📊 Platform Features

✅ **Multi-Tenant System**
- Country-specific settings (Ghana)
- Currency support (USD, GHS)

✅ **Authentication & Security**
- JWT-based authentication
- Role-based access control (Admin, Producer, Buyer)
- Secure password hashing

✅ **Producer Management**
- SRGG Economic ID generation
- Land parcel registry
- Producer ratings
- Verification status

✅ **Marketplace**
- Commodity listings
- Quality grading
- Multi-currency pricing
- Order management

✅ **Blockchain Integration** (Mock)
- Token minting simulation
- Certificate issuance
- Proof anchoring

✅ **Insurance System** (Mock)
- Risk scoring
- Premium calculation
- Policy management

✅ **Payment Processing** (Mock)
- Multiple payment methods
- Order tracking
- Revenue analytics

---

## 🎨 UI Components

### Login Page (`/login`)
- Modern, responsive design
- Quick-login buttons for demo
- Test credentials display

### Admin Dashboard (`/admin/dashboard`)
- Platform statistics
- Producer/listing/order overview
- Quick action cards
- System status

### Producer Dashboard (`/producer/dashboard`)
- Personal statistics
- Active listings display
- SRGG EID display
- Revenue tracking

### Buyer Dashboard (`/buyer/dashboard`)
- Browse commodities
- View listings
- Order management
- Saved items

---

## 🔍 Troubleshooting

### If setup fails:

```bash
# Clean everything and retry
cd /Users/sudipto/Desktop/projects/mplc
rm -rf node_modules package-lock.json prisma/dev.db
npm cache clean --force
./STANDALONE_SETUP.sh
```

### If login fails:

```bash
# Re-seed the database
npm run reset
```

### If port 3000 is in use:

```bash
# Kill the process
lsof -i :3000
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

---

## 📚 API Endpoints Available

All APIs are live and functional:

```
POST   /api/auth/login        - User authentication
GET    /api/producers         - List all producers
POST   /api/producers         - Create producer
GET    /api/listings          - List all listings
POST   /api/listings          - Create listing
GET    /api/listings/:id      - Get listing details
POST   /api/orders            - Create order
GET    /api/tokens            - List tokens
```

---

## 🎯 Next Steps

1. **Explore the UI** - Login and navigate dashboards
2. **Test the API** - Use Postman or curl
3. **View Database** - Run `npx prisma studio`
4. **Customize** - Add your own data
5. **Extend** - Build new features

---

## 💡 Technical Details

**Stack**:
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Prisma ORM
- SQLite
- Tailwind CSS 4
- Zod (validation)
- bcryptjs (password hashing)
- jose (JWT)

**No External Dependencies**:
- ❌ No Docker
- ❌ No PostgreSQL
- ❌ No MongoDB
- ❌ No Redis
- ✅ Just SQLite + Node.js

---

## 🌍 SRGG Marketplace

**Building a Quantified, Insured, Hedged, and Tokenized Sustainable Society**

Ready to transform commodity trading in Africa & LATAM! 🚀

---

**Questions?** Check the code or run `npx prisma studio` to explore the database!
