function errorHandler(error, req, res, next) {
  console.error(error);
  if (error.name === 'SequelizeUniqueConstraintError' || error.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: error.errors.map((item) => item.message) });
  }
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ error: 'La referencia relacionada no existe' });
  }
  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = errorHandler;