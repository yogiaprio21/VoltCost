const prisma = require('../prisma/client');

async function listMaterials() {
  const rows = await prisma.material.findMany({ orderBy: { id: 'asc' } });
  return rows.map(mapMaterial);
}

async function listPublicCatalog() {
  const rows = await prisma.material.findMany({ orderBy: [{ type: 'asc' }, { name: 'asc' }] });
  return rows.map(mapMaterial);
}

function mapMaterial(item) {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    unit: item.unit,
    pricePerUnit: Number(item.pricePerUnit),
    specification: item.specification,
    brand: item.brand,
    sourceName: item.sourceName || 'Data seed/admin VoltCost',
    sourceUrl: item.sourceUrl,
    sourceType: item.sourceType,
    priceUpdatedAt: item.priceUpdatedAt || item.updatedAt,
    standardRef: item.standardRef,
    notes: item.notes
  };
}

async function createMaterial(data) {
  const item = await prisma.material.create({ data });
  return mapMaterial(item);
}

async function updateMaterial(id, data) {
  const item = await prisma.material.update({ where: { id }, data });
  return mapMaterial(item);
}

async function deleteMaterial(id) {
  await prisma.material.delete({ where: { id } });
}

module.exports = { listMaterials, listPublicCatalog, createMaterial, updateMaterial, deleteMaterial };
