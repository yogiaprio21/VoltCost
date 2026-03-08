const service = require('../services/analytics.service');
const asyncHandler = require('../utils/asyncHandler');

const getDashboard = asyncHandler(async (req, res) => {
  const data = await service.dashboard();
  res.json(data);
});

module.exports = { getDashboard }
