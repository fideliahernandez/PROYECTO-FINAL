// FUNCIONES AUXILIARES

export function generarId() {
  return `${Date.now()} - ${Math.random().toString(36).substring(2, 9)}`;
}

export function generarNumeroCuenta() {
  let numeroCuenta = '';

  // Generamos 12 digitos aleatorios
  for (let i = 0; i < 12; i += 1) {
    numeroCuenta += Math.floor(Math.random() * 10);
  }

  return numeroCuenta;
}
