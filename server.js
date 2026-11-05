require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
require('./models');
const usuariosRoutes = require('./routes/usuarios');
const planesRoutes = require('./routes/planes');
const pagosRoutes = require('./routes/pagos');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const port = process.env.PORT || 3000;

async function actualizarEsquemaPlanes() {
  await sequelize.query(`
    ALTER TABLE public.planes
      ADD COLUMN IF NOT EXISTS cuota_inscripcion NUMERIC(10, 2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS duracion_semanas INTEGER
  `);
  await sequelize.query(`
    ALTER TABLE public.planes
      ALTER COLUMN duracion_meses DROP NOT NULL
  `);
  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'planes_duracion_unica_check'
          AND conrelid = 'public.planes'::regclass
      ) THEN
        ALTER TABLE public.planes
          ADD CONSTRAINT planes_duracion_unica_check
          CHECK (
            (duracion_meses IS NOT NULL AND duracion_meses > 0 AND duracion_semanas IS NULL)
            OR
            (duracion_semanas IS NOT NULL AND duracion_semanas > 0 AND duracion_meses IS NULL)
          );
      END IF;
    END
    $$
  `);
}

async function actualizarEsquemaCuentas() {
  await sequelize.query(`
    ALTER TABLE public.gym_users
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'socio'
  `);
  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'gym_users_role_check'
          AND conrelid = 'public.gym_users'::regclass
      ) THEN
        ALTER TABLE public.gym_users
          ADD CONSTRAINT gym_users_role_check
          CHECK (role IN ('socio', 'admin'));
      END IF;
    END
    $$
  `);
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json());
app.get('/api', (req, res) => res.json({ mensaje: 'API de Esmeralda Gym activa' }));
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/planes', planesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use(errorHandler);

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await actualizarEsquemaPlanes();
    await actualizarEsquemaCuentas();
    app.listen(port, () => console.log(`Esmeralda Gym API escuchando en el puerto ${port}`));
  } catch (error) {
    console.error('No se pudo iniciar la API de PostgreSQL:', error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) iniciarServidor();
module.exports = app;