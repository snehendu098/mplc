import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SRGG Marketplace (Production Ready)...\n');

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

  // Create commodities
  const commoditiesData = [
    { name: 'Cocoa', category: 'Agriculture', unit: 'MT', hsCode: '1801.00', description: 'Premium cocoa beans', icon: '🍫' },
    { name: 'Gold', category: 'Minerals', unit: 'oz', hsCode: '7108.12', description: 'High-grade gold', icon: '🥇' },
    { name: 'Coffee', category: 'Agriculture', unit: 'MT', hsCode: '0901.11', description: 'Arabica coffee beans', icon: '☕' },
    { name: 'Cassava', category: 'Agriculture', unit: 'MT', hsCode: '0714.10', description: 'Fresh cassava', icon: '🥔' },
    { name: 'Maize', category: 'Agriculture', unit: 'MT', hsCode: '1005.90', description: 'Yellow maize', icon: '🌽' },
    { name: 'Carbon Credits', category: 'Environmental', unit: 'tCO2', hsCode: 'N/A', description: 'Verified carbon offsets', icon: '🌳' },
    { name: 'Kente Textile', category: 'Cultural', unit: 'piece', hsCode: '5007.20', description: 'Traditional Kente cloth', icon: '🎨' },
    { name: 'Diamonds', category: 'Minerals', unit: 'carat', hsCode: '7102.31', description: 'Rough diamonds', icon: '💎' },
    { name: 'Bauxite', category: 'Minerals', unit: 'MT', hsCode: '2606.00', description: 'Aluminum ore', icon: '⛏️' },
    { name: 'Shea Butter', category: 'Agriculture', unit: 'kg', hsCode: '1515.90', description: 'Organic shea butter', icon: '🧴' },
  ];

  const commodities: Record<string, string> = {};
  for (const c of commoditiesData) {
    const created = await prisma.commodity.upsert({
      where: { name: c.name },
      update: { category: c.category, hsCode: c.hsCode },
      create: c,
    });
    commodities[c.name] = created.id;
  }
  console.log('✓ Created', Object.keys(commodities).length, 'commodities');

  // Create multiple producers
  const producersData = [
    { name: 'Kwame Asante', type: 'FARMER', country: 'GH', region: 'Ashanti', city: 'Kumasi', commodities: ['Cocoa', 'Maize'], volume: 125000 },
    { name: 'Maria Santos', type: 'COOPERATIVE', country: 'DO', region: 'Santo Domingo', city: 'Santo Domingo', commodities: ['Coffee', 'Cassava'], volume: 280000 },
    { name: 'Kofi Mining Ltd', type: 'MINER', country: 'GH', region: 'Western', city: 'Obuasi', commodities: ['Gold', 'Bauxite'], volume: 890000 },
    { name: 'Caribbean Arts Collective', type: 'ARTISAN', country: 'DO', region: 'Puerto Plata', city: 'Puerto Plata', commodities: ['Kente Textile'], volume: 45000 },
    { name: 'Green Forest Initiative', type: 'ENVIRONMENTAL', country: 'GH', region: 'Greater Accra', city: 'Accra', commodities: ['Carbon Credits'], volume: 320000 },
  ];

  const producers: { id: string; userId: string; name: string }[] = [];
  let eidCounter = 1;

  for (const p of producersData) {
    const password = await hash('Producer123!', 10);
    const email = `${p.name.toLowerCase().replace(/\s+/g, '.')}@srgg.com`;

    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email } },
      update: {},
      create: {
        tenantId: tenant.id,
        email,
        password,
        name: p.name,
        phone: `+233${241000000 + eidCounter}`,
        role: 'PRODUCER',
        status: 'ACTIVE',
      },
    });

    const countryCode = p.country === 'GH' ? 'GH' : 'DR';
    const srggEid = `SRGG-${countryCode}-25-${String(eidCounter).padStart(6, '0')}`;

    const producer = await prisma.producer.upsert({
      where: { srggEid },
      update: {},
      create: {
        tenantId: tenant.id,
        userId: user.id,
        srggEid,
        type: p.type,
        name: p.name,
        phone: user.phone || '',
        email: user.email,
        country: p.country,
        region: p.region,
        city: p.city,
        rating: 4.5 + Math.random() * 0.4,
        totalVolume: p.volume,
        verificationStatus: 'VERIFIED',
      },
    });

    producers.push({ id: producer.id, userId: user.id, name: producer.name });
    eidCounter++;
  }
  console.log('✓ Created', producers.length, 'producers');

  // Create listings for each producer
  const listingsData = [
    { producer: 'Kwame Asante', commodity: 'Cocoa', title: 'Premium Cocoa Beans - Grade A', quantity: 50, pricePerUnit: 2500, origin: 'Ghana', verified: true, insured: true },
    { producer: 'Kwame Asante', commodity: 'Maize', title: 'Organic Yellow Maize', quantity: 100, pricePerUnit: 215, origin: 'Ghana', verified: true, insured: false },
    { producer: 'Maria Santos', commodity: 'Coffee', title: 'Arabica Coffee Beans - Premium', quantity: 25, pricePerUnit: 1820, origin: 'DR', verified: true, insured: true },
    { producer: 'Kofi Mining Ltd', commodity: 'Gold', title: 'Gold Reserve Token', quantity: 500, pricePerUnit: 1925, origin: 'Ghana', verified: true, insured: true },
    { producer: 'Green Forest Initiative', commodity: 'Carbon Credits', title: 'Mangrove Carbon Credits', quantity: 1000, pricePerUnit: 32, origin: 'Multi', verified: true, insured: false },
    { producer: 'Caribbean Arts Collective', commodity: 'Kente Textile', title: 'Kente Textile IP License', quantity: 1, pricePerUnit: 15000, origin: 'Ghana', verified: true, insured: true },
  ];

  const listings: { id: string; title: string; producerId: string }[] = [];
  for (const l of listingsData) {
    const producer = producers.find(p => p.name === l.producer);
    if (!producer) continue;

    const listing = await prisma.listing.create({
      data: {
        tenantId: tenant.id,
        producerId: producer.id,
        commodityId: commodities[l.commodity],
        title: l.title,
        description: `High quality ${l.commodity.toLowerCase()} from ${l.origin}`,
        quantity: l.quantity,
        unit: commoditiesData.find(c => c.name === l.commodity)?.unit || 'MT',
        pricePerUnit: l.pricePerUnit,
        totalPrice: l.quantity * l.pricePerUnit,
        currency: 'USD',
        status: 'ACTIVE',
        origin: l.origin,
        isVerified: l.verified,
        isInsured: l.insured,
        location: JSON.stringify({ country: l.origin }),
        images: JSON.stringify(['/placeholder.jpg']),
      },
    });
    listings.push({ id: listing.id, title: listing.title, producerId: producer.id });
  }
  console.log('✓ Created', listings.length, 'listings');

  // Create tokens for some listings
  for (const listing of listings.slice(0, 4)) {
    const tokenId = `TKN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
    await prisma.token.create({
      data: {
        tokenId,
        listingId: listing.id,
        tokenType: 'NFT',
        totalSupply: 1,
        owner: listing.producerId,
        blockchain: 'Polygon',
        contractAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
        status: 'MINTED',
        mintedAt: new Date(),
        metadata: JSON.stringify({ name: listing.title }),
      },
    });
    await prisma.listing.update({
      where: { id: listing.id },
      data: { isTokenized: true },
    });
  }
  console.log('✓ Created tokens for listings');

  // Create buyer user
  const buyerPassword = await hash('Buyer123!', 10);
  const buyer = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'buyer@srgg.com' } },
    update: {},
    create: {
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

  // Create sample orders
  const orderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'];
  for (let i = 0; i < 5; i++) {
    const listing = listings[i % listings.length];
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
    await prisma.order.create({
      data: {
        tenantId: tenant.id,
        orderNumber,
        buyerId: buyer.id,
        listingId: listing.id,
        quantity: Math.floor(Math.random() * 10) + 1,
        pricePerUnit: 2500,
        totalPrice: (Math.floor(Math.random() * 10) + 1) * 2500,
        currency: 'USD',
        status: orderStatuses[i % orderStatuses.length],
        paymentStatus: i < 3 ? 'COMPLETED' : 'PENDING',
        shippingAddress: JSON.stringify({ country: 'Netherlands', city: 'Rotterdam' }),
      },
    });
  }
  console.log('✓ Created sample orders');

  // Create validations
  const validationTypes = ['LAB_TEST', 'PORT_INSPECTION', 'ORIGIN_VERIFICATION', 'CARBON_AUDIT', 'QUALITY_TEST'];
  const validationStatuses = ['QUEUED', 'IN_PROGRESS', 'COMPLETED'];
  for (let i = 0; i < 5; i++) {
    const producer = producers[i % producers.length];
    const validationId = `VAL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 2).toUpperCase()}${i}`;
    await prisma.validation.create({
      data: {
        tenantId: tenant.id,
        validationId,
        type: validationTypes[i],
        producerId: producer.id,
        assetName: `Asset from ${producer.name}`,
        priority: i < 2 ? 'HIGH' : 'MEDIUM',
        status: validationStatuses[i % 3],
        eta: i < 2 ? '2 hours' : '1 day',
        results: i === 2 ? JSON.stringify({ passed: true, score: 95 }) : '{}',
      },
    });
  }
  console.log('✓ Created validations');

  // Create insurance policies
  const policyTypes = ['CROP', 'MARITIME', 'LIVESTOCK', 'CARBON'];
  for (let i = 0; i < 4; i++) {
    const policyNumber = `POL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 2).toUpperCase()}${i}`;
    const coverageAmount = [500000, 2000000, 150000, 300000][i];
    await prisma.insurancePolicy.create({
      data: {
        tenantId: tenant.id,
        policyNumber,
        type: policyTypes[i],
        listingId: listings[i % listings.length].id,
        assetName: listings[i % listings.length].title,
        assetType: 'LISTING',
        coverageAmount,
        premium: coverageAmount * 0.03,
        currency: 'USD',
        provider: "Lloyd's of London",
        coverageStart: new Date(),
        coverageEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: i === 2 ? 'PENDING' : 'ACTIVE',
      },
    });
  }
  console.log('✓ Created insurance policies');

  // Create hedge positions
  const hedgeData = [
    { commodity: 'Cocoa', direction: 'LONG', quantity: 100, strike: 2400, pnl: 15200 },
    { commodity: 'Gold', direction: 'SHORT', quantity: 50, strike: 1900, pnl: -2100 },
    { commodity: 'Maize', direction: 'SHORT', quantity: 200, strike: 220, pnl: 8400 },
    { commodity: 'Coffee', direction: 'LONG', quantity: 50, strike: 1750, pnl: 4500 },
  ];
  for (const h of hedgeData) {
    const positionId = `HDG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 2).toUpperCase()}`;
    await prisma.hedgePosition.create({
      data: {
        tenantId: tenant.id,
        positionId,
        commodityId: commodities[h.commodity],
        commodity: h.commodity,
        type: 'FUTURES',
        direction: h.direction,
        quantity: h.quantity,
        unit: 'MT',
        strikePrice: h.strike,
        currentPrice: h.strike + (h.pnl / h.quantity),
        currency: 'USD',
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        pnl: h.pnl,
        status: 'OPEN',
        exchange: 'CME',
      },
    });
  }
  console.log('✓ Created hedge positions');

  // Create shipments
  const shipmentsData = [
    { cargo: 'Cocoa Beans', origin: 'Ghana', originPort: 'Tema Port', dest: 'Netherlands', destPort: 'Rotterdam', vessel: 'MV Atlantic Star', status: 'IN_TRANSIT', eta: '12 days' },
    { cargo: 'Gold Bars', origin: 'Ghana', originPort: 'Accra Airport', dest: 'UK', destPort: 'London', vessel: 'BA Flight 082', status: 'LOADING', eta: '2 days' },
    { cargo: 'Coffee Beans', origin: 'Dominican Republic', originPort: 'Santo Domingo', dest: 'USA', destPort: 'Miami', vessel: 'MV Caribbean Queen', status: 'IN_TRANSIT', eta: '5 days' },
    { cargo: 'Cassava Flour', origin: 'Ghana', originPort: 'Tema Port', dest: 'Germany', destPort: 'Hamburg', vessel: 'MSC Diana', status: 'CUSTOMS', eta: '3 days' },
  ];
  for (const s of shipmentsData) {
    const shipmentId = `SHP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 2).toUpperCase()}`;
    await prisma.shipment.create({
      data: {
        tenantId: tenant.id,
        shipmentId,
        cargo: s.cargo,
        origin: s.origin,
        originPort: s.originPort,
        destination: s.dest,
        destinationPort: s.destPort,
        vessel: s.vessel,
        vesselType: s.vessel.includes('Flight') ? 'AIRCRAFT' : 'SHIP',
        status: s.status,
        eta: s.eta,
        trackingEvents: JSON.stringify([{ timestamp: new Date().toISOString(), event: 'Created', location: s.originPort }]),
      },
    });
  }
  console.log('✓ Created shipments');

  // Create ports
  const portsData = [
    { name: 'Port of Tema', code: 'GHTEM', country: 'Ghana', city: 'Tema', type: 'SEA', containers: 145, congestion: 'LOW' },
    { name: 'Santo Domingo Port', code: 'DOSDO', country: 'Dominican Republic', city: 'Santo Domingo', type: 'SEA', containers: 89, congestion: 'MEDIUM' },
    { name: 'Takoradi Port', code: 'GHTKD', country: 'Ghana', city: 'Takoradi', type: 'SEA', containers: 62, congestion: 'LOW' },
    { name: 'Kotoka International Airport', code: 'GHACC', country: 'Ghana', city: 'Accra', type: 'AIR', containers: 25, congestion: 'LOW' },
  ];
  for (const p of portsData) {
    await prisma.port.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }
  console.log('✓ Created ports');

  // Create notifications
  await prisma.notification.createMany({
    data: [
      { tenantId: tenant.id, userId: admin.id, type: 'ORDER', title: 'New Order Received', message: 'Order ORD-ABC123 has been placed', isRead: false },
      { tenantId: tenant.id, userId: admin.id, type: 'VALIDATION', title: 'Validation Complete', message: 'Lab test for Cocoa Beans completed successfully', isRead: false },
      { tenantId: tenant.id, userId: admin.id, type: 'SHIPMENT', title: 'Shipment Update', message: 'SHP-001 has arrived at Rotterdam port', isRead: true },
    ],
  });
  console.log('✓ Created notifications');

  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Test Credentials:');
  console.log('  Admin:    admin@srgg.com / Admin123!');
  console.log('  Producer: producer@srgg.com / Producer123!');
  console.log('  Buyer:    buyer@srgg.com / Buyer123!');
  console.log('\n🌐 Run: npm run dev');
  console.log('   Visit: http://localhost:3005\n');
}

main()
  .catch((e) => {
    console.error('Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
