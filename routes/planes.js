const express = require('express');
const controller = require('../controllers/planesController');
const { validarPlan } = require('../middlewares/validation');
const requireAdmin = require('../middlewares/requireAdmin');
const router = express.Router();

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', requireAdmin, validarPlan, controller.crear);
router.put('/:id', requireAdmin, validarPlan, controller.actualizar);
router.delete('/:id', requireAdmin, controller.eliminar);
module.exports = router;