import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SRGG Marketplace (Standalone)...\n');

  // Create tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'srgg-demo' },
    update: {},
    create: {
      name: 'SRGG Demo',
      slug: 'srgg-demo',
      country: 'GH',
      currency: 'USD',
      status: 'ACTIVE',
    },
  });
  console.log('✓ Created tenant:', tenant.name);

  // Create admin user
  const adminPassword = await hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { id: 'admin-user-1' },
    update: {},
    create: {
      id: 'admin-user-1',
      tenantId: tenant.id,
      email: 'admin@srgg.com',
      password: adminPassword,
      name: 'SRGG Admin',
      role: 'SUPER_ADMIN',
      permissions: JSON.stringify(['*']),
      status: 'ACTIVE',
    },
  });
  console.log('✓ Created admin:', admin.email);

  // Create producer user
  const producerPassword = await hash('Producer123!', 10);
  const producerUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'producer@srgg.com',
      password: producerPassword,
      name: 'John Farmer',
      phone: '+233241234567',
      role: 'PRODUCER',
      status: 'ACTIVE',
    },
  });
  console.log('✓ Created producer user:', producerUser.email);

  // Create producer profile
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
  console.log('✓ Created producer:', producer.name);

  // Create parcel
  await prisma.parcel.create({
    data: {
      producerId: producer.id,
      parcelNumber: 'PARCEL-001',
      area: 5.5,
      unit: 'hectares',
      location: JSON.stringify({ lat: 5.6037, lng: -0.1870, address: 'Accra, Ghana' }),
      ownership: 'OWNED',
    },
  });
  console.log('✓ Created land parcel');

  // Create commodities
  const commodities = [
    { name: 'Cocoa Beans', category: 'AGRICULTURE', unit: 'kg', description: 'Premium cocoa beans from Ghana' },
    { name: 'Gold Ore', category: 'MINERALS', unit: 'oz', description: 'High-grade gold ore' },
    { name: 'Coffee Beans', category: 'AGRICULTURE', unit: 'kg', description: 'Arabica coffee beans' },
    { name: 'Cassava', category: 'AGRICULTURE', unit: 'kg', description: 'Fresh cassava roots' },
  ];

  const createdCommodities = [];
  for (const commodity of commodities) {
    const created = await prisma.commodity.upsert({
      where: { name: commodity.name },
      update: {},
      create: commodity,
    });
    createdCommodities.push(created);
  }
  console.log('✓ Created', createdCommodities.length, 'commodities');

  // Create sample listings
  const listings = [
    {
      title: 'Premium Cocoa Beans - Harvest 2025',
      commodityId: createdCommodities[0].id,
      quantity: 1000,
      pricePerUnit: 2.5,
      description: 'High-quality cocoa beans, sun-dried and ready for export',
      status: 'ACTIVE',
    },
    {
      title: 'Gold Ore - Grade A',
      commodityId: createdCommodities[1].id,
      quantity: 100,
      pricePerUnit: 1850,
      description: 'Certified gold ore with high purity',
      status: 'ACTIVE',
    },
    {
      title: 'Organic Coffee Beans',
      commodityId: createdCommodities[2].id,
      quantity: 500,
      pricePerUnit: 5.75,
      description: 'Certified organic Arabica coffee beans',
      status: 'ACTIVE',
    },
  ];

  for (const listing of listings) {
    await prisma.listing.create({
      data: {
        ...listing,
        tenantId: tenant.id,
        producerId: producer.id,
        unit: createdCommodities.find(c => c.id === listing.commodityId)!.unit,
        totalPrice: listing.quantity * listing.pricePerUnit,
        currency: 'USD',
        location: JSON.stringify({ lat: 5.6037, lng: -0.1870, address: 'Accra, Ghana' }),
        images: JSON.stringify(['/placeholder-commodity.jpg']),
      },
    });
  }
  console.log('✓ Created', listings.length, 'active listings');

  // Create buyer user
  const buyerPassword = await hash('Buyer123!', 10);
  const buyer = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'buyer@srgg.com',
      password: buyerPassword,
      name: 'Sarah Trader',
      phone: '+233241234568',
      role: 'BUYER',
      status: 'ACTIVE',
    },
  });
  console.log('✓ Created buyer:', buyer.email);

  // Create sample certificate
  await prisma.certificate.create({
    data: {
      certificateNumber: 'CERT-GH-2025-000001',
      type: 'QUALITY',
      issuedTo: producer.id,
      issuedBy: 'SRGG Quality Assurance',
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      metadata: JSON.stringify({ qualityScore: 95, grade: 'A' }),
    },
  });
  console.log('✓ Created quality certificate');

  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Test Credentials:');
  console.log('  Admin:    admin@srgg.com / Admin123!');
  console.log('  Producer: producer@srgg.com / Producer123!');
  console.log('  Buyer:    buyer@srgg.com / Buyer123!');
  console.log('\n🌐 Run: npm run dev');
  console.log('   Visit: http://localhost:3000\n');
}

main()
  .catch((e) => {
    console.error('Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
