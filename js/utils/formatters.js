// FORMATEADORES DE INFORMACION

export function formatCurrency(valor) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return `$0.00`;
  }

  // APLICAR FORMATO DE MONEDA
  return numero.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });
}

// FORMATEAR FECHA
export function formatDate(fecha) {
  const fechaObjeto = new Date(fecha);

  if (Number.isNaN(fechaObjeto.getTime())) {
    return '';
  }

  return fechaObjeto.toLocaleDateString('es-MX');
}

// FORMATEAR NUMERO DE CUENTA
export function formatAccountNumber(numeroCuenta) {
  const numero = String(numeroCuenta ?? '');

  return numero.replace(/(\d{4})(?=\d)/g, '$1 ');
}
