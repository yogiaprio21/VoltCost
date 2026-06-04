const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sourceDefaults = {
    brand: 'Umum',
    sourceName: 'Katalog estimasi VoltCost',
    sourceType: 'seed',
    sourceUrl: null,
    priceUpdatedAt: new Date('2026-06-04T00:00:00.000Z'),
    standardRef: 'PUIL 2011 dan ketentuan Sertifikat Laik Operasi (SLO) ESDM sebagai rujukan teknis keselamatan instalasi.',
    notes: 'Harga adalah estimasi material awal dan perlu diverifikasi ulang berdasarkan vendor, merek, wilayah, dan waktu survei.'
  };
  const materials = [
    {
      ...sourceDefaults,
      name: 'Kabel Tembaga Berisolasi PVC (NYM 2x1.5)',
      type: 'cable',
      unit: 'meter',
      pricePerUnit: 10000,
      specification: 'Kabel tembaga NYM 2x1.5 mm2 untuk jalur penerangan dan beban ringan.'
    },
    {
      ...sourceDefaults,
      name: 'Pipa Conduit PVC',
      type: 'conduit',
      unit: 'meter',
      pricePerUnit: 7000,
      specification: 'Pipa pelindung kabel PVC untuk instalasi permukaan atau tanam sesuai kebutuhan lapangan.'
    },
    {
      ...sourceDefaults,
      name: 'Mini Circuit Breaker',
      type: 'mcb',
      unit: 'unit',
      pricePerUnit: 80000,
      specification: 'MCB 1 phase untuk proteksi utama dan cabang sesuai pembagian sirkuit.'
    },
    {
      ...sourceDefaults,
      name: 'Saklar Modular',
      type: 'switch',
      unit: 'unit',
      pricePerUnit: 20000,
      specification: 'Saklar modular standar untuk titik lampu.'
    },
    {
      ...sourceDefaults,
      name: 'Stop Kontak',
      type: 'socket',
      unit: 'unit',
      pricePerUnit: 25000,
      specification: 'Stop kontak modular standar untuk titik daya.'
    },
    {
      ...sourceDefaults,
      name: 'Box Panel Listrik',
      type: 'panel',
      unit: 'unit',
      pricePerUnit: 350000,
      specification: 'Box panel distribusi kecil untuk penempatan proteksi utama dan cabang.'
    }
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
      update: {
        unit: m.unit,
        pricePerUnit: m.pricePerUnit,
        specification: m.specification,
        brand: m.brand,
        sourceName: m.sourceName,
        sourceUrl: m.sourceUrl,
        sourceType: m.sourceType,
        priceUpdatedAt: m.priceUpdatedAt,
        standardRef: m.standardRef,
        notes: m.notes
      },
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
