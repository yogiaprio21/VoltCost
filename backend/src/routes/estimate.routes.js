const express = require('express');
const { estimateInputSchema, idParamSchema } = require('../utils/schemas');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/estimate.controller');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Optional authentication for guest/logged-in users
const tryAuthenticate = (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) return next();
    try {
        const jwt = require('jsonwebtoken');
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        next();
    }
};

router.post('/', tryAuthenticate, validate(estimateInputSchema), asyncHandler(ctrl.create));
router.get('/my', authenticate, asyncHandler(ctrl.listMyEstimations));
router.put('/:id', authenticate, asyncHandler(ctrl.update));
router.delete('/:id', authenticate, asyncHandler(ctrl.remove));
router.get('/:id/pdf', validate(idParamSchema, 'params'), asyncHandler(ctrl.pdf));

module.exports = router;
