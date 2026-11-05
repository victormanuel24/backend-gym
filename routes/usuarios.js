const express = require('express');
const controller = require('../controllers/usuariosController');
const { validarUsuario } = require('../middlewares/validation');
const requireAdmin = require('../middlewares/requireAdmin');
const router = express.Router();

router.use(requireAdmin);
router.get('/', controller.listar);
router.get('/estado-pagos', controller.estadoPagos);
router.get('/:id', controller.obtener);
router.post('/', validarUsuario, controller.crear);
router.put('/:id', validarUsuario, controller.actualizar);
router.delete('/:id', controller.eliminar);
module.exports = router;