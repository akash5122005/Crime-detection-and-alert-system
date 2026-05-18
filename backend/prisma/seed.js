const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const bcrypt = require('bcrypt');
const prisma = require('../src/db');

async function main() {
  console.log('Start seeding...');

  // 1. Create Admin User
  const password_hash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'akash8975015@gmail.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'akash8975015@gmail.com',
      password_hash,
      role: 'Admin'
    }
  });
  console.log('Created Admin user:', admin.email);

  // 2. Create Zones
  const zoneA = await prisma.zone.create({
    data: {
      name: 'Downtown',
      boundary_geojson: '{"type":"Polygon","coordinates":[[[-73.98,40.75],[-73.97,40.75],[-73.97,40.74],[-73.98,40.74],[-73.98,40.75]]]}',
      population: 50000
    }
  });

  const zoneB = await prisma.zone.create({
    data: {
      name: 'Uptown',
      boundary_geojson: '{"type":"Polygon","coordinates":[[[-73.96,40.78],[-73.95,40.78],[-73.95,40.77],[-73.96,40.77],[-73.96,40.78]]]}',
      population: 35000
    }
  });
  console.log('Created Zones:', zoneA.name, zoneB.name);

  // 3. Create synthetic incidents
  const incidentTypes = ['Theft', 'Assault', 'Burglary', 'Vandalism'];
  for (let i = 0; i < 20; i++) {
    await prisma.incident.create({
      data: {
        type: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
        severity: Math.floor(Math.random() * 5) + 1,
        lat: 40.74 + (Math.random() * 0.04),
        lng: -73.98 + (Math.random() * 0.03),
        zone_id: i % 2 === 0 ? zoneA.id : zoneB.id,
        status: 'open',
        description: 'Synthetic test data',
        reported_by: admin.id
      }
    });
  }
  console.log('Created 20 synthetic incidents.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
