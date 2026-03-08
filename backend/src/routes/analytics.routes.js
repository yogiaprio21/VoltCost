const express = require('express');
const ctrl = require('../controllers/analytics.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(ctrl.getDashboard));

module.exports = router;
