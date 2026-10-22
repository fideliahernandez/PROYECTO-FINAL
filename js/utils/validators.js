// VALIDACIONES GENERALES

export function validarCampoObligatorio(valor) {
  // VALIDAR EXISTENCIA DEL VALOR
  return (
    // El valor no debe ser undefined
    valor !== undefined && valor !== null && String(valor).trim() !== ''
  );
}

// VALIDAR MONTO
export function validarMonto(monto) {
  const montoNumerico = Number(monto);

  return Number.isFinite(montoNumerico) && montoNumerico > 0;
}
