const express = require('express');
const authRoutes = require('./auth.routes');
const materialsRoutes = require('./materials.routes');
const estimateRoutes = require('./estimate.routes');
const analyticsRoutes = require('./analytics.routes');
const swagger = require('../utils/swagger');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/materials', authenticate, authorize('ADMIN'), materialsRoutes);
router.use('/estimate', estimateRoutes);
router.use('/analytics', authenticate, authorize('ADMIN'), analyticsRoutes);
router.use('/docs', swagger.ui, swagger.handler);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;
