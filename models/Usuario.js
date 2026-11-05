const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const bcryptHashPattern = /^\$2[aby]\$\d{2}\$/;

const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  cedula: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  telefono: { type: DataTypes.STRING(30), allowNull: false },
  correo: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING(255), allowNull: false },
  fecha_inscripcion: { type: DataTypes.DATEONLY, allowNull: false },
  plan_id: { type: DataTypes.INTEGER, allowNull: false },
  fecha_proximo_pago: { type: DataTypes.DATEONLY, allowNull: false },
  estado: { type: DataTypes.ENUM('activo', 'inactivo'), allowNull: false, defaultValue: 'activo' },
}, {
  tableName: 'usuarios',
  defaultScope: { attributes: { exclude: ['password'] } },
  hooks: {
    beforeCreate: async (usuario) => {
      if (!bcryptHashPattern.test(usuario.password)) {
        usuario.password = await bcrypt.hash(usuario.password, 12);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password') && !bcryptHashPattern.test(usuario.password)) {
        usuario.password = await bcrypt.hash(usuario.password, 12);
      }
    },
  },
});

module.exports = Usuario;