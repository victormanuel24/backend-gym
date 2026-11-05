const Plan = require('./Plan');
const Usuario = require('./Usuario');
const Pago = require('./Pago');
const Cuenta = require('./Cuenta');

Plan.hasMany(Usuario, { foreignKey: 'plan_id', as: 'usuarios' });
Usuario.belongsTo(Plan, { foreignKey: 'plan_id', as: 'plan' });
Usuario.hasMany(Pago, { foreignKey: 'usuario_id', as: 'pagos' });
Pago.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

module.exports = { Plan, Usuario, Pago, Cuenta };