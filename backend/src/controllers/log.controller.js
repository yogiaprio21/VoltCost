const service = require('../services/log.service');
const asyncHandler = require('../utils/asyncHandler');

const getLogs = asyncHandler(async (req, res) => {
    const logs = await service.listLogs();
    res.json(logs);
});

module.exports = { getLogs };
