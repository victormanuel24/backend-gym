const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cuenta = sequelize.define('Cuenta', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(40), allowNull: false, unique: true },
  email: { type: DataTypes.STRING(254), allowNull: true, unique: true },
  password_hash: { type: DataTypes.TEXT, allowNull: false },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'socio',
    validate: { isIn: [['socio', 'admin']] },
  },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'gym_users',
  timestamps: false,
});

module.exports = Cuenta;
