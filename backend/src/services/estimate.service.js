const prisma = require('../prisma/client');
const { buildBreakdown, computeCostFromLines } = require('../utils/estimation');
const { ApiError } = require('../middleware/errorHandler');

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

function canAccessEstimation(estimation, user) {
  if (!estimation) return false;
  if (!estimation.userId) return true;
  return user?.role === 'ADMIN' || estimation.userId === user?.id;
}

async function updateEstimation(id, { lines, installationType }, user) {
  const existing = await getById(id);
  if (!canAccessEstimation(existing, user)) {
    throw new ApiError(403, 'Anda tidak memiliki akses untuk mengubah estimasi ini');
  }

  const cost = computeCostFromLines(lines, installationType);
  const breakdown = {
    ...(existing.breakdown || {}),
    metrics: existing.breakdown?.metrics || {},
    cost,
    meta: {
      ...(existing.breakdown?.meta || {}),
      formulaVersion: '2026.06',
      adjustedAt: new Date().toISOString(),
      adjustedBy: user?.id || null
    }
  };

  const updated = await prisma.estimation.update({
    where: { id: Number(id) },
    data: {
      installationType,
      breakdown,
      totalCost: cost.total
    }
  });

  return { id: updated.id, totalCost: Number(updated.totalCost), breakdown: updated.breakdown };
}

async function deleteEstimation(id) {
  return prisma.estimation.delete({ where: { id: Number(id) } });
}

module.exports = { createEstimation, updateEstimation, getById, getByUserId, deleteEstimation, canAccessEstimation }
