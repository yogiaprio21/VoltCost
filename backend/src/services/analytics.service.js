const prisma = require('../prisma/client');

async function dashboard() {
  const totalEstimations = await prisma.estimation.count();
  const avg = await prisma.estimation.aggregate({ _avg: { totalCost: true } });
  const averageCost = avg._avg.totalCost ? Number(avg._avg.totalCost) : 0;
  const mostCommon = await prisma.$queryRaw`
    SELECT "powerCapacity", COUNT(*) AS cnt
    FROM "Estimation"
    GROUP BY "powerCapacity"
    ORDER BY cnt DESC
    LIMIT 1
  `;
  const mostCommonPowerCapacity = Array.isArray(mostCommon) && mostCommon[0] ? Number(mostCommon[0].powerCapacity ?? mostCommon[0].powercapacity) : null;
  const monthlyTrends = await prisma.$queryRaw`
    SELECT to_char("createdAt", 'YYYY-MM') AS month, COUNT(*)::int AS count, AVG("totalCost")::numeric AS averageCost
    FROM "Estimation"
    GROUP BY 1
    ORDER BY 1
  `;
  return {
    totalEstimations,
    averageCost,
    mostCommonPowerCapacity,
    monthlyTrends: (monthlyTrends || []).map((r) => ({
      month: r.month,
      count: Number(r.count),
      averageCost: Number(r.averagecost || r.averageCost)
    }))
  };
}

module.exports = { dashboard };
