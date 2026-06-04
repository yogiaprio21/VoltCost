const materialsService = require('../services/materials.service');
const logService = require('../services/log.service');
const asyncHandler = require('../utils/asyncHandler');

const getAll = asyncHandler(async (req, res) => {
  const items = await materialsService.listMaterials();
  res.json(items);
});

const getCatalog = asyncHandler(async (req, res) => {
  const items = await materialsService.listPublicCatalog();
  res.json({
    data: items,
    meta: {
      source: 'Katalog harga material VoltCost',
      disclaimer: 'Harga bersifat estimasi pasar/admin dan dapat berbeda menurut merek, wilayah, vendor, dan waktu survei.',
      standardNote: 'Rujukan teknis keselamatan mengacu pada prinsip PUIL 2011 dan ketentuan SLO ESDM; PUIL/ESDM bukan sumber harga material.'
    }
  });
});

const create = asyncHandler(async (req, res) => {
  const item = await materialsService.createMaterial(req.body);

  await logService.createLog({
    action: 'CREATE',
    entity: 'Material',
    entityId: item.id.toString(),
    details: { name: item.name, price: item.pricePerUnit },
    userId: req.user.id
  });

  res.status(201).json(item);
});

const update = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const item = await materialsService.updateMaterial(Number(id), req.body);

  await logService.createLog({
    action: 'UPDATE',
    entity: 'Material',
    entityId: id,
    details: { name: item.name, price: item.pricePerUnit },
    userId: req.user.id
  });

  res.json(item);
});

const remove = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await materialsService.deleteMaterial(Number(id));

  await logService.createLog({
    action: 'DELETE',
    entity: 'Material',
    entityId: id,
    userId: req.user.id
  });

  res.status(204).send();
});

module.exports = { getAll, getCatalog, create, update, remove }
