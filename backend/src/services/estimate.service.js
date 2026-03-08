const prisma = require('../prisma/client');
const { buildBreakdown } = require('../utils/estimation');

async function createEstimation(input) {
  const materials = await prisma.material.findMany();
  const breakdown = buildBreakdown({ input, materials });
  const created = await prisma.estimation.create({
    data: {
      houseArea: input.houseArea,
      lampPoints: input.lampPoints,
      socketPoints: input.socketPoints,
      acCount: input.acCount,
      pumpCount: input.pumpCount,
      powerCapacity: input.powerCapacity,
      installationType: input.installationType,
      breakdown,
      totalCost: breakdown.cost.total,
      userId: input.userId || null
    }
  });
  return { id: created.id, totalCost: Number(created.totalCost), breakdown };
}

async function getByUserId(userId, page = 1, limit = 5) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.estimation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.estimation.count({ where: { userId } })
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function getById(id) {
  return prisma.estimation.findUnique({ where: { id: Number(id) } });
}

async function updateEstimation(id, { lines, installationType }) {
  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  const labor = Math.round(subtotal * 0.15);
  const premium = installationType === 'premium' ? Math.round((subtotal + labor) * 0.2) : 0;
  const total = subtotal + labor + premium;

  const updated = await prisma.estimation.update({
    where: { id: Number(id) },
    data: {
      breakdown: {
        metrics: {}, // Keeping metrics for now, or we could update them if needed
        cost: { lines, subtotal, labor, premium, total }
      },
      totalCost: total
    }
  });

  return { id: updated.id, totalCost: Number(updated.totalCost), breakdown: updated.breakdown };
}

async function deleteEstimation(id) {
  return prisma.estimation.delete({ where: { id: Number(id) } });
}

module.exports = { createEstimation, updateEstimation, getById, getByUserId, deleteEstimation }
