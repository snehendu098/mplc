const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...\n');

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'SRGG Demo',
      slug: 'srgg-demo',
      country: 'GH',
      currency: 'USD',
      status: 'ACTIVE',
    },
  });
  console.log('✓ Created tenant');

  // Create admin
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@srgg.com',
      password: await bcrypt.hash('Admin123!', 10),
      name: 'SRGG Admin',
      role: 'SUPER_ADMIN',
      permissions: '["*"]',
      status: 'ACTIVE',
    },
  });
  console.log('✓ Created admin user');

  // Create producer user
  const producerUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'producer@srgg.com',
      password: await bcrypt.hash('Producer123!', 10),
      name: 'John Farmer',
      phone: '+233241234567',
      role: 'PRODUCER',
      status: 'ACTIVE',
    },
  });
  console.log('✓ Created producer user');

  // Create producer
  const producer = await prisma.producer.create({
    data: {
      tenantId: tenant.id,
      userId: producerUser.id,
      srggEid: 'SRGG-GH-25-000001',
      type: 'FARMER',
      name: 'John Farmer',
      phone: '+233241234567',
      email: 'producer@srgg.com',
      rating: 4.5,
      verificationStatus: 'VERIFIED',
    },
  });
  console.log('✓ Created producer profile');

  // Create buyer
  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'buyer@srgg.com',
      password: await bcrypt.hash('Buyer123!', 10),
      name: 'Sarah Trader',
      phone: '+233241234568',
      role: 'BUYER',
      status: 'ACTIVE',
    },
  });
  console.log('✓ Created buyer user');

  // Create commodities
  const cocoa = await prisma.commodity.create({
    data: { name: 'Cocoa Beans', category: 'AGRICULTURE', unit: 'kg', description: 'Premium cocoa' },
  });
  const gold = await prisma.commodity.create({
    data: { name: 'Gold Ore', category: 'MINERALS', unit: 'oz', description: 'High-grade gold' },
  });
  const coffee = await prisma.commodity.create({
    data: { name: 'Coffee Beans', category: 'AGRICULTURE', unit: 'kg', description: 'Arabica coffee' },
  });
  console.log('✓ Created 3 commodities');

  // Create listings
  await prisma.listing.create({
    data: {
      tenantId: tenant.id,
      producerId: producer.id,
      commodityId: cocoa.id,
      title: 'Premium Cocoa Beans - Harvest 2025',
      description: 'High-quality cocoa beans',
      quantity: 1000,
      unit: 'kg',
      pricePerUnit: 2.5,
      totalPrice: 2500,
      currency: 'USD',
      status: 'ACTIVE',
      location: '{"lat":5.6037,"lng":-0.1870,"address":"Accra, Ghana"}',
      images: '["/cocoa.jpg"]',
    },
  });
  await prisma.listing.create({
    data: {
      tenantId: tenant.id,
      producerId: producer.id,
      commodityId: gold.id,
      title: 'Gold Ore - Grade A',
      description: 'Certified gold ore',
      quantity: 100,
      unit: 'oz',
      pricePerUnit: 1850,
      totalPrice: 185000,
      currency: 'USD',
      status: 'ACTIVE',
      location: '{"lat":5.6037,"lng":-0.1870}',
      images: '[]',
    },
  });
  await prisma.listing.create({
    data: {
      tenantId: tenant.id,
      producerId: producer.id,
      commodityId: coffee.id,
      title: 'Organic Coffee Beans',
      description: 'Organic Arabica coffee',
      quantity: 500,
      unit: 'kg',
      pricePerUnit: 5.75,
      totalPrice: 2875,
      currency: 'USD',
      status: 'ACTIVE',
      location: '{}',
      images: '[]',
    },
  });
  console.log('✓ Created 3 listings\n');
  console.log('🎉 Seeding complete!\n');
  console.log('Credentials:');
  console.log('  Admin:    admin@srgg.com / Admin123!');
  console.log('  Producer: producer@srgg.com / Producer123!');
  console.log('  Buyer:    buyer@srgg.com / Buyer123!\n');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
