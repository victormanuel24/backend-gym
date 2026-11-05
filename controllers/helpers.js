function sumarMeses(fecha, meses = 1) {
  const resultado = new Date(`${fecha}T00:00:00.000Z`);
  resultado.setUTCMonth(resultado.getUTCMonth() + meses);
  return resultado.toISOString().slice(0, 10);
}

function fechaActual() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = { sumarMeses, fechaActual };