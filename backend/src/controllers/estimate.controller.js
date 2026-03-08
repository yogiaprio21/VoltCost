const { generateEstimatePdf } = require('../utils/pdf');
const service = require('../services/estimate.service');
const { ApiError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const input = { ...req.body, userId: req.user?.id };
  const result = await service.createEstimation(input);
  res.status(201).json(result);
});

const listMyEstimations = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const result = await service.getByUserId(req.user.id, page, limit);
  res.json(result);
});

const pdf = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  const estimation = await service.getById(id);
  if (!estimation) throw new ApiError(404, 'Estimation not found');
  generateEstimatePdf(res, estimation);
});

const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const result = await service.updateEstimation(id, req.body);
  res.json(result);
});

const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  // Verify owner
  const est = await service.getById(id);
  if (!est || est.userId !== req.user.id) {
    throw new ApiError(403, 'Anda tidak memiliki akses untuk menghapus estimasi ini');
  }
  await service.deleteEstimation(id);
  res.json({ message: 'Estimasi berhasil dihapus' });
});

module.exports = { create, update, listMyEstimations, pdf, remove }
