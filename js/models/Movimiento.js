// IMPORTAMOS UTILIDADES

// Vamos a generar un id para asignar un identificador unico a cada movimiento
import { generarId } from '../utils/helpers.js';

// CREAMOS NUESTRO MODELO MOVIMIENTO
// Representar una operación realizada en nuestro sistema bancario: tipo operacion, cantidad, descripcion, cuenta

export class Movimiento {
  constructor({
    id = generarId(),
    tipo,
    monto,
    descripcion = '',
    cuentaOrigen = null,
    cuentaDestino = null,
    saldoResultante = null,
    fecha = new Date().toISOString(),
  }) {
    // ASIGNAMOS PROPIEDADES
    this.id = id;
    this.tipo = tipo;
    this.monto = monto;
    this.descripcion = descripcion;
    this.cuentaOrigen = cuentaOrigen;
    this.cuentaDestino = cuentaDestino;
    this.saldoResultante = saldoResultante;
    this.fecha = fecha;
  }
}
