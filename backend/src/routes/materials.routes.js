const express = require('express');
const { materialSchema, idParamSchema } = require('../utils/schemas');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/materials.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(ctrl.getAll));
router.post('/', validate(materialSchema), asyncHandler(ctrl.create));
router.put('/:id', validate(idParamSchema, 'params'), validate(materialSchema), asyncHandler(ctrl.update));
router.delete('/:id', validate(idParamSchema, 'params'), asyncHandler(ctrl.remove));

module.exports = router;
