const { Usuario, Plan, Pago } = require('../models');
const { sumarMeses, fechaActual } = require('./helpers');

const incluir = [{ model: Plan, as: 'plan' }];
async function listar(req, res, next) { try { res.json(await Usuario.findAll({ include: incluir })); } catch (error) { next(error); } }
async function obtener(req, res, next) { try { const usuario = await Usuario.findByPk(req.params.id, { include: incluir }); if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' }); res.json(usuario); } catch (error) { next(error); } }
async function crear(req, res, next) {
  try {
    const plan = await Plan.findByPk(req.body.plan_id);
    if (!plan) return res.status(400).json({ error: 'El plan indicado no existe' });
    const fechaInscripcion = req.body.fecha_inscripcion || fechaActual();
    const usuario = await Usuario.create({ ...req.body, fecha_inscripcion: fechaInscripcion, fecha_proximo_pago: sumarMeses(fechaInscripcion) });
    res.status(201).json(await Usuario.findByPk(usuario.id, { include: incluir }));
  } catch (error) { next(error); }
}
async function actualizar(req, res, next) {
  try { const usuario = await Usuario.findByPk(req.params.id); if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' }); await usuario.update(req.body); res.json(usuario); } catch (error) { next(error); }
}
async function eliminar(req, res, next) {
  try { const usuario = await Usuario.findByPk(req.params.id); if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' }); await usuario.destroy(); res.status(200).json({ mensaje: 'Usuario eliminado' }); } catch (error) { next(error); }
}
async function estadoPagos(req, res, next) {
  try {
    const hoy = new Date(`${fechaActual()}T00:00:00.000Z`);
    const usuarios = await Usuario.findAll({ include: incluir });
    res.json(usuarios.map((usuario) => {
      const diferencia = Math.ceil((new Date(`${usuario.fecha_proximo_pago}T00:00:00.000Z`) - hoy) / 86400000);
      const estadoPago = diferencia < 0 ? 'vencido' : diferencia <= 3 ? 'próximo a vencer' : 'al día';
      return { ...usuario.toJSON(), estado_pago: estadoPago };
    }));
  } catch (error) { next(error); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar, estadoPagos };