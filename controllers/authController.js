const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { Cuenta, Usuario } = require('../models');

const bcryptHashPattern = /^\$2[aby]\$\d{2}\$/;
const tokenExpiration = process.env.JWT_EXPIRES_IN || '1h';

function verifyLegacyPassword(password, storedPassword) {
  if (bcryptHashPattern.test(storedPassword)) return bcrypt.compare(password, storedPassword);
  const suppliedHash = crypto.createHash('sha256').update(password).digest();
  const storedHash = crypto.createHash('sha256').update(storedPassword).digest();
  return crypto.timingSafeEqual(suppliedHash, storedHash);
}

function requireUser(req, res, next) {
  res.set('Cache-Control', 'no-store');
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!process.env.JWT_SECRET) {
    return res.status(503).json({ error: 'JWT_SECRET no esta configurado en el servidor' });
  }
  if (!match) return res.status(401).json({ error: 'Inicia sesion como socio para continuar' });

  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET);
    if (typeof payload !== 'object' || typeof payload.sub !== 'string' || !/^\d+$/.test(payload.sub)) {
      return res.status(401).json({ error: 'La sesion de socio no es valida' });
    }
    if (payload.role && payload.role !== 'socio') {
      return res.status(403).json({ error: 'No tienes permisos para esta operacion' });
    }
    req.auth = {
      userId: payload.sub,
      accountType: payload.account_type || (payload.username ? 'account' : 'member'),
    };
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'La sesion de socio vencio. Inicia sesion de nuevo' });
    }
    return next(error);
  }
}

async function login(req, res, next) {
  const body = req.body || {};
  const identifier = typeof body.identifier === 'string'
    ? body.identifier.trim()
    : typeof body.correo === 'string' ? body.correo.trim() : '';
  const password = body.password;
  if (!identifier || typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'correo/usuario y password son obligatorios' });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET no esta configurado en el servidor' });
  }

  try {
    const cuenta = await Cuenta.findOne({
      where: {
        [Op.or]: [
          { username: identifier },
          { email: identifier.toLowerCase() },
        ],
      },
    });

    if (cuenta) {
      const passwordValido = await bcrypt.compare(password, cuenta.password_hash);
      if (!passwordValido || cuenta.role !== 'socio') {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
      }
      const token = jwt.sign(
        { username: cuenta.username, role: 'socio', account_type: 'account' },
        process.env.JWT_SECRET,
        { subject: String(cuenta.id), expiresIn: tokenExpiration },
      );
      return res.json({ token, username: cuenta.username, role: 'socio' });
    }

    const usuario = await Usuario.unscoped().findOne({ where: { correo: identifier } });
    if (!usuario || !(await verifyLegacyPassword(password, usuario.password)) || usuario.estado !== 'activo') {
      return res.status(401).json({ error: 'Credenciales invalidas o usuario inactivo' });
    }
    if (!bcryptHashPattern.test(usuario.password)) {
      usuario.password = await bcrypt.hash(usuario.password, 12);
      await usuario.save();
    }

    const token = jwt.sign(
      { correo: usuario.correo, role: 'socio', account_type: 'member' },
      process.env.JWT_SECRET,
      { subject: String(usuario.id), expiresIn: tokenExpiration },
    );

    return res.json({
      token,
      token_type: 'Bearer',
      expires_in: tokenExpiration,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        estado: usuario.estado,
      },
      role: 'socio',
    });
  } catch (error) {
    return next(error);
  }
}

async function cambiarPassword(req, res, next) {
  const { currentPassword, newPassword, confirmPassword } = req.body || {};
  if (
    typeof currentPassword !== 'string'
    || !currentPassword
    || Buffer.byteLength(currentPassword, 'utf8') > 72
    || typeof newPassword !== 'string'
    || Buffer.byteLength(newPassword, 'utf8') < 8
    || Buffer.byteLength(newPassword, 'utf8') > 72
    || newPassword !== confirmPassword
  ) {
    return res.status(400).json({
      error: 'Escribe tu contraseña actual y confirma una contraseña nueva de 8 a 72 bytes',
    });
  }
  if (currentPassword === newPassword) {
    return res.status(400).json({ error: 'La contraseña nueva debe ser diferente de la actual' });
  }

  try {
    if (req.auth.accountType === 'account') {
      const cuenta = await Cuenta.findByPk(req.auth.userId);
      if (!cuenta || !(await bcrypt.compare(currentPassword, cuenta.password_hash))) {
        return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
      }
      cuenta.password_hash = await bcrypt.hash(newPassword, 12);
      await cuenta.save();
    } else {
      const usuario = await Usuario.unscoped().findByPk(req.auth.userId);
      if (!usuario || !(await verifyLegacyPassword(currentPassword, usuario.password))) {
        return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
      }
      usuario.password = await bcrypt.hash(newPassword, 12);
      await usuario.save();
    }
    return res.json({ message: 'Tu contraseña se actualizó correctamente.' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { login, cambiarPassword, requireUser };