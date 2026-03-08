const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const materials = [
    { name: 'Kabel Tembaga Berisolasi PVC (NYM 2x1.5)', type: 'cable', unit: 'meter', pricePerUnit: 10000 },
    { name: 'Pipa Conduit PVC', type: 'conduit', unit: 'meter', pricePerUnit: 7000 },
    { name: 'Mini Circuit Breaker', type: 'mcb', unit: 'unit', pricePerUnit: 80000 },
    { name: 'Saklar Modular', type: 'switch', unit: 'unit', pricePerUnit: 20000 },
    { name: 'Stop Kontak', type: 'socket', unit: 'unit', pricePerUnit: 25000 },
    { name: 'Box Panel Listrik', type: 'panel', unit: 'unit', pricePerUnit: 350000 }
  ];
  const bcrypt = require('bcryptjs');
  if (!process.env.SEED_ADMIN_EMAIL || !process.env.SEED_ADMIN_PASSWORD) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env');
  }

  await prisma.user.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL },
    update: {},
    create: {
      email: process.env.SEED_ADMIN_EMAIL,
      password: await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10),
      name: 'Super Admin',
      role: 'ADMIN',
    },
  });

  for (const m of materials) {
    await prisma.material.upsert({
      where: { name_type: { name: m.name, type: m.type } },
      update: { unit: m.unit, pricePerUnit: m.pricePerUnit },
      create: m
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
