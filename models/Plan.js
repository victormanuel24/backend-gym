const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Plan = sequelize.define('Plan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  monto: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
  cuota_inscripcion: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0, validate: { min: 0 } },
  duracion_meses: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1 } },
  duracion_semanas: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1 } },
}, {
  tableName: 'planes',
  validate: {
    duracionValida() {
      const tieneMeses = this.duracion_meses !== null && this.duracion_meses !== undefined;
      const tieneSemanas = this.duracion_semanas !== null && this.duracion_semanas !== undefined;
      if (tieneMeses === tieneSemanas) {
        throw new Error('Indique una sola duración: meses o semanas');
      }
    },
  },
});

module.exports = Plan;