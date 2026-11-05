const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const metodosPago = ['Pago Movil', 'Divisa', 'Zelle'];

function validarUsuario(req, res, next) {
  const obligatorios = ['nombre', 'cedula', 'telefono', 'correo', 'password', 'plan_id'];
  const faltantes = obligatorios.filter((campo) => req.body[campo] === undefined || req.body[campo] === '');
  if (faltantes.length || !correoValido.test(req.body.correo)) {
    return res.status(400).json({ error: 'Datos de usuario invalidos', faltantes, correo: 'Debe tener un formato valido' });
  }
  next();
}

function validarPlan(req, res, next) {
  const {
    nombre,
    monto,
    cuota_inscripcion: cuotaInscripcion,
    duracion_meses: duracionMeses,
    duracion_semanas: duracionSemanas,
  } = req.body;
  const tieneMeses = duracionMeses !== undefined && duracionMeses !== null && duracionMeses !== '';
  const tieneSemanas = duracionSemanas !== undefined && duracionSemanas !== null && duracionSemanas !== '';
  const mesesValidos = Number.isInteger(Number(duracionMeses)) && Number(duracionMeses) >= 1;
  const semanasValidas = Number.isInteger(Number(duracionSemanas)) && Number(duracionSemanas) >= 1;
  const cuotaValida = cuotaInscripcion === undefined
    || (cuotaInscripcion !== null && Number.isFinite(Number(cuotaInscripcion)) && Number(cuotaInscripcion) >= 0);

  if (
    typeof nombre !== 'string'
    || !nombre.trim()
    || !Number.isFinite(Number(monto))
    || Number(monto) < 0
    || !cuotaValida
    || tieneMeses === tieneSemanas
    || (tieneMeses && !mesesValidos)
    || (tieneSemanas && !semanasValidas)
  ) {
    return res.status(400).json({
      error: 'nombre, monto, cuota_inscripcion (si se indica) y una duración válida en meses o semanas son obligatorios',
    });
  }
  next();
}

function validarPago(req, res, next) {
  const { usuario_id: usuarioId, monto, metodo_pago: metodoPago } = req.body;
  if (!usuarioId || monto === undefined || Number(monto) < 0 || !metodosPago.includes(metodoPago)) {
    return res.status(400).json({ error: 'usuario_id, monto y un metodo_pago valido son obligatorios', metodos_validos: metodosPago });
  }
  next();
}

module.exports = { validarUsuario, validarPlan, validarPago };