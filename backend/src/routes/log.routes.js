const express = require('express');
const ctrl = require('../controllers/log.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('ADMIN'), ctrl.getLogs);

module.exports = router;
