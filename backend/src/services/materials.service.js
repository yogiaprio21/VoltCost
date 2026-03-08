const prisma = require('../prisma/client');

async function listMaterials() {
  return prisma.material.findMany({ orderBy: { id: 'asc' } });
}

async function createMaterial(data) {
  return prisma.material.create({ data });
}

async function updateMaterial(id, data) {
  return prisma.material.update({ where: { id }, data });
}

async function deleteMaterial(id) {
  await prisma.material.delete({ where: { id } });
}

module.exports = { listMaterials, createMaterial, updateMaterial, deleteMaterial };
