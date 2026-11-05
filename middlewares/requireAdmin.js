const jwt = require('jsonwebtoken');

function requireAdmin(req, res, next) {
  res.set('Cache-Control', 'no-store');
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 32) {
    return res.status(503).json({ error: 'ADMIN_JWT_SECRET debe configurarse en el backend' });
  }

  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ error: 'Inicia sesion como administrador para continuar' });

  try {
    const payload = jwt.verify(match[1], secret);
    if (typeof payload !== 'object' || payload.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'La sesion administrativa vencio. Inicia sesion de nuevo' });
    }
    return next(error);
  }
}

module.exports = requireAdmin;
