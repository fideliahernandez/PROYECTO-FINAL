// IMPORTAR MOVIMIENTO
// Banco necesitara crear movimientos automaticamente cuando se realicen operaciones

import { Movimiento } from "./Movimiento.js";

// MODELO BANCO: Sera encargado de coordinar usuarios, cuentas y movimientos
export class Banco {
  constructor({ usuarios = [], cuentas = [], movimientos = [] } = {}) {
    this.usuarios = usuarios;
    this.cuentas = cuentas;
    this.movimientos = movimientos;
  }

  // AGREGAR USUARIO
  agregarUsuario(usuario) {
    // some nos ayuda a comprobari si  hay almenos un usuario
    const existe = this.usuarios.some((u) => u.id === usuario.id);

    // Detenemos la operación si encontramos nuestro usuario con el mismo id
    if (existe) {
      throw new Error("El usuario ya existe");
    }

    // Si no existe Agregamos el usuario al array
    this.usuarios.push(usuario);
  }

  // BUSCAR USUARIO POR ID
  buscarUsusarioPorId(usuarioId) {
    return this.usuarios.find((usuario) => usuario.id === usuarioId) || null;
  }

  // AGREGAR CUENTA: Registra una cuenta bancaria despues de comprobar que el usuario existe
  agregarCuenta(cuenta) {
    // Buscamos el propietario
    const usuario = this.buscarUsusarioPorId(cuenta.usuarioId);

    // Hacemos una validacion negativa termina el metodo
    if (!usuario) {
      throw new Error("El usuario propietario de la cuenta no existe");
    }

    // Validación de cuenta duplicada
    const existe = this.cuentas.some(
      (c) => c.id === cuenta.id || c.numeroCuenta === cuenta.numeroCuenta,
    );

    // Si existe la cuenta duplicada terina el metodo y mandame un mensaje
    if (existe) {
      throw new Error("La cuenta ya existe.");
    }

    // Si no existe
    this.cuentas.push(cuenta);

    return cuenta;
  }

  // BUSCAR CUENTA POR ID: Localiza una cuenta mediante su localizador
  buscarCuentaPorId(cuentaId) {
    return this.cuentas.find((cuenta) => cuenta.id === cuentaId) || null;
  }

  // BUSCAR CUENTA POR NUMERO: Localiza una cuenta utilizando su numero bancario
  buscarCuentaPorNumero(numeroCuenta) {
    return (
      this.cuentas.find((cuenta) => cuenta.numeroCuenta === numeroCuenta) ||
      null
    );
  }

  // OBTENER CUENTAS DE USUARIO: Recuperar todas las cuentas que pertenezcan al usuario
  obtenerCuentasDeUsuario(usuarioId) {
    return this.cuentas.filter((cuenta) => cuenta.usuarioId === usuarioId);
  }

  // REGISTRAR MOVIMIENTO
  registrarMovimiento(movimiento) {
    this.movimientos.push(movimiento);

    return movimiento;
  }

  // REALIZAR DEPOSITO: validar monto, buscar cuenta, actualizar saldo, crear movimiento, registrar movimiento
  realizarDeposito({ cuentaId, monto, descripcion = "" }) {
    // CONVERTIR MONTO
    const montoNumerico = Number(monto);

    // El monto debe ser unnumero valido
    if (!Number.isFinite(montoNumerico) || montoNumerico <= 0) {
      throw new Error("Monto invalido, el monto debe ser mayor a cero. ");
    }

    // BUSCAR CUENTA Y VALIDAMOS
    const cuenta = this.buscarCuentaPorId(cuentaId);

    // Validacion
    if (!cuenta) {
      throw new Error("La cuenta no existe. ");
    }

    // ACTUALIZAR SALDO
    cuenta.depositar(montoNumerico);

    // Despues del deposito creamos automaticamente un registro de la operacion
    const movimiento = new Movimiento({
      tipo: "DEPOSITO",
      monto: montoNumerico,
      descripcion,
      cuentaOrigen: cuenta.id,
      saldoResultante: cuenta.saldo,
    });

    // REGISTRAR MOVIMIENTO
    this.registrarMovimiento(movimiento);

    return movimiento;
  }

  // OBTENER MOVIMIENTOS DE UNA CUENTA
  obtenerMovimientosDeCuenta(cuentaId) {
    return this.movimientos.filter(
      (movimiento) =>
        movimiento.cuentaOrigen === cuentaId ||
        movimiento.cuentaDestino === cuentaId,
    );
  }
}
