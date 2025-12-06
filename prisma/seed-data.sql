-- Seed data for SRGG Marketplace

-- Tenant
INSERT INTO "Tenant" (id, name, slug, country, currency, status) 
VALUES ('tenant1', 'SRGG Demo', 'srgg-demo', 'GH', 'USD', 'ACTIVE');

-- Users (passwords are bcrypt hashed)
-- Admin: Admin123!
INSERT INTO "User" (id, tenantId, email, password, name, role, permissions, status)
VALUES ('admin1', 'tenant1', 'admin@srgg.com', '$2a$10$rOEWq8qCJY0Z0KL2zq3p9ePXm5Q5kQ5qK5qK5qK5qK5qK5qK5qK5q', 'SRGG Admin', 'SUPER_ADMIN', '["*"]', 'ACTIVE');

-- Producer User: Producer123!
INSERT INTO "User" (id, tenantId, email, password, name, phone, role, status)
VALUES ('producer1', 'tenant1', 'producer@srgg.com', '$2a$10$rOEWq8qCJY0Z0KL2zq3p9ePXm5Q5kQ5qK5qK5qK5qK5qK5qK5qK5q', 'John Farmer', '+233241234567', 'PRODUCER', 'ACTIVE');

-- Buyer User: Buyer123!
INSERT INTO "User" (id, tenantId, email, password, name, phone, role, status)
VALUES ('buyer1', 'tenant1', 'buyer@srgg.com', '$2a$10$rOEWq8qCJY0Z0KL2zq3p9ePXm5Q5kQ5qK5qK5qK5qK5qK5qK5qK5q', 'Sarah Trader', '+233241234568', 'BUYER', 'ACTIVE');

-- Producer Profile
INSERT INTO "Producer" (id, tenantId, userId, srggEid, type, name, phone, email, rating, verificationStatus)
VALUES ('prod1', 'tenant1', 'producer1', 'SRGG-GH-25-000001', 'FARMER', 'John Farmer', '+233241234567', 'producer@srgg.com', 4.5, 'VERIFIED');

-- Commodities
INSERT INTO "Commodity" (id, name, category, unit, description)
VALUES 
  ('comm1', 'Cocoa Beans', 'AGRICULTURE', 'kg', 'Premium cocoa beans from Ghana'),
  ('comm2', 'Gold Ore', 'MINERALS', 'oz', 'High-grade gold ore'),
  ('comm3', 'Coffee Beans', 'AGRICULTURE', 'kg', 'Arabica coffee beans');

-- Listings
INSERT INTO "Listing" (id, tenantId, producerId, commodityId, title, description, quantity, unit, pricePerUnit, totalPrice, currency, status, location, images)
VALUES 
  ('list1', 'tenant1', 'prod1', 'comm1', 'Premium Cocoa Beans - Harvest 2025', 'High-quality cocoa beans, sun-dried and ready for export', 1000, 'kg', 2.5, 2500, 'USD', 'ACTIVE', '{"lat":5.6037,"lng":-0.1870,"address":"Accra, Ghana"}', '[]'),
  ('list2', 'tenant1', 'prod1', 'comm2', 'Gold Ore - Grade A', 'Certified gold ore with high purity', 100, 'oz', 1850, 185000, 'USD', 'ACTIVE', '{"lat":5.6037,"lng":-0.1870}', '[]'),
  ('list3', 'tenant1', 'prod1', 'comm3', 'Organic Coffee Beans', 'Certified organic Arabica coffee beans', 500, 'kg', 5.75, 2875, 'USD', 'ACTIVE', '{}', '[]');
