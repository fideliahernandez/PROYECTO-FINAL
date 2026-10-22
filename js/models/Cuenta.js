// IMPORTAR IUTILIDADES importamos generar id para generar un id a nuestra cuenta
import { generarId } from '../utils/helpers.js';

// MODELO CUENTA Representa una cuenta bancaria perteneciente a un usuario
export class Cuenta {
  constructor({
    id = generarId(),
    numeroCuenta,
    // Si no se indica otro tipo sera cuenta de ahorro
    tipo = 'Ahorro',
    saldo = 0,
    usuarioId,
    fechaApertura = new Date().toISOString(),
    activa = true,
  }) {
    // AGREGAM0S SUS PROPIEDADES
    this.id = id;
    this.numeroCuenta = numeroCuenta;
    this.tipo = tipo;
    this.saldo = Number(saldo);
    this.usuarioId = usuarioId;
    this.fechaApertura = fechaApertura;
    this.activa = activa;
  }

  // METODOS DE MI CLASE CUENTA

  // DEPOSITAR: Incrementa el saldo actual utilizado en el monto recibido
  depositar(monto) {
    this.saldo += Number(monto);
    return this.saldo;
  }

  // RETIRAR: Disminuye el saldo actual utlizando el monto recibido
  retirar(monto) {
    this.saldo -= Number(monto);

    return this.saldo;
  }
}
