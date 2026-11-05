const express = require('express');
const controller = require('../controllers/pagosController');
const { validarPago } = require('../middlewares/validation');
const requireAdmin = require('../middlewares/requireAdmin');
const router = express.Router();

router.use(requireAdmin);
router.get('/', controller.listar);
router.get('/usuario/:usuario_id', controller.historial);
router.post('/', validarPago, controller.crear);
router.delete('/:id', controller.eliminar);
module.exports = router;