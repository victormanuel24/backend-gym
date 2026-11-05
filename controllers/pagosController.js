const { Pago, Usuario } = require('../models');
const { sumarMeses, fechaActual } = require('./helpers');

const incluir = [{ model: Usuario, as: 'usuario' }];
async function listar(req, res, next) { try { res.json(await Pago.findAll({ include: incluir, order: [['fecha_pago', 'DESC']] })); } catch (error) { next(error); } }
async function historial(req, res, next) { try { const usuario = await Usuario.findByPk(req.params.usuario_id); if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' }); res.json(await Pago.findAll({ where: { usuario_id: usuario.id }, order: [['fecha_pago', 'DESC']] })); } catch (error) { next(error); } }
async function crear(req, res, next) {
  const transaction = await Pago.sequelize.transaction();
  try {
    const usuario = await Usuario.findByPk(req.body.usuario_id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!usuario) { await transaction.rollback(); return res.status(404).json({ error: 'Usuario no encontrado' }); }
    const fechaPago = req.body.fecha_pago || fechaActual();
    const pago = await Pago.create({ ...req.body, fecha_pago: fechaPago }, { transaction });
    await usuario.update({ fecha_proximo_pago: sumarMeses(fechaPago) }, { transaction });
    await transaction.commit();
    res.status(201).json(await Pago.findByPk(pago.id, { include: incluir }));
  } catch (error) { await transaction.rollback(); next(error); }
}
async function eliminar(req, res, next) { try { const pago = await Pago.findByPk(req.params.id); if (!pago) return res.status(404).json({ error: 'Pago no encontrado' }); await pago.destroy(); res.status(200).json({ mensaje: 'Pago eliminado' }); } catch (error) { next(error); } }

module.exports = { listar, historial, crear, eliminar };