const { Plan } = require('../models');

async function listar(req, res, next) { try { res.json(await Plan.findAll()); } catch (error) { next(error); } }
async function obtener(req, res, next) {
  try { const plan = await Plan.findByPk(req.params.id); if (!plan) return res.status(404).json({ error: 'Plan no encontrado' }); res.json(plan); } catch (error) { next(error); }
}
async function crear(req, res, next) { try { res.status(201).json(await Plan.create(req.body)); } catch (error) { next(error); } }
async function actualizar(req, res, next) {
  try { const plan = await Plan.findByPk(req.params.id); if (!plan) return res.status(404).json({ error: 'Plan no encontrado' }); await plan.update(req.body); res.json(plan); } catch (error) { next(error); }
}
async function eliminar(req, res, next) {
  try { const plan = await Plan.findByPk(req.params.id); if (!plan) return res.status(404).json({ error: 'Plan no encontrado' }); await plan.destroy(); res.status(200).json({ mensaje: 'Plan eliminado' }); } catch (error) { next(error); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };