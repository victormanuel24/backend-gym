const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pago = sequelize.define('Pago', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  monto: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
  metodo_pago: { type: DataTypes.ENUM('Pago Movil', 'Divisa', 'Zelle'), allowNull: false },
  fecha_pago: { type: DataTypes.DATEONLY, allowNull: false },
  referencia: { type: DataTypes.STRING(100), allowNull: true },
}, { tableName: 'pagos' });

module.exports = Pago;