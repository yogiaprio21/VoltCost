const materialsService = require('../services/materials.service');
const asyncHandler = require('../utils/asyncHandler');

const getAll = asyncHandler(async (req, res) => {
  const items = await materialsService.listMaterials();
  res.json(items);
});

const create = asyncHandler(async (req, res) => {
  const item = await materialsService.createMaterial(req.body);
  res.status(201).json(item);
});

const update = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const item = await materialsService.updateMaterial(Number(id), req.body);
  res.json(item);
});

const remove = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await materialsService.deleteMaterial(Number(id));
  res.status(204).send();
});

module.exports = { getAll, create, update, remove }
