// IMPORTAMOS MODELOS DEL DOMINIO Y LOCALSTORAGE
import { Banco } from '../models/Banco.js';
import { Usuario } from '../models/Usuario.js';
import { Cuenta } from '../models/Cuenta.js';
import { Movimiento } from '../models/Movimiento.js';
import { STORAGE_KEYS, storageService } from './StorageService.js';

// SERVICIO BANCARIO
class BancoService {
  constructor() {
    this._banco = null;
  }

  // CARGAMOS EL BANCO
  cargarBanco() {
    // Recuperar los usuarios almacenados
    const usuariosGuardados = storageService.obtener(STORAGE_KEYS.USUARIOS, []);

    // Recuperamos las cuentas
    const cuentasGuardadas = storageService.obtener(STORAGE_KEYS.CUENTAS, []);

    // Recuperamos los movimientos almacenados
    const movimientosGuardados = storageService.obtener(
      STORAGE_KEYS.MOVIMIENTOS,
      [],
    );

    // Convertir cada objeto plano e una instancia Usuario
    const usuarios = usuariosGuardados.map((usuario) => new Usuario(usuario));

    // Recontruir cada cuenta para recuperar sus metodos
    const cuentas = cuentasGuardadas.map((cuenta) => new Cuenta(cuenta));

    //Reconstruir los movimientos utiliando Movimiento
    const movimientos = movimientosGuardados.map(
      (movimiento) => new Movimiento(movimiento),
    );

    this._banco = new Banco({
      usuarios,
      cuentas,
      movimientos,
    });

    return this._banco;
  }

  // OBTENER INSTANCIA DEL BANCO
  obtenerInstanciaBanco() {
    // Comprobar si _banco es null. Reconstruir desde LoscalStorage
    if (!this._banco) {
      return this.cargarBanco();
    }

    // Si ya existe, reutiliza la instancia
    return this._banco;
  }

  // RECARGAR BANCO: Obliga al servicio a reconstruir el banco utilizando la información guardada
  recargarBanco() {
    // Elimina la referencia a la instancia actual
    this._banco = null;

    return this.cargarBanco();
  }

  // GUARDAR BANCO EN LOCAL STORAGE
  guardarBanco() {
    // Obtenemos la instancia actual
    const banco = this.obtenerInstanciaBanco();

    // Guardamos los usuarios
    storageService.guardar(STORAGE_KEYS.USUARIOS, banco.usuarios);

    // Guardamos las curntas
    storageService.guardar(STORAGE_KEYS.CUENTAS, banco.cuentas);

    // Guardamos los movimientos
    storageService.guardar(STORAGE_KEYS.MOVIMIENTOS, banco.movimientos);

    return true;
  }

  // OBTENER EL USUARIO: Obtenemos la infomacion del usuario determinado
  obtenerDatosUsuario(usuarioId) {
    // Obtener la instancia actual del banco
    const banco = this.obtenerInstanciaBanco();

    //Buscar usuario utilizando una regla que ya existe
    const usuario = banco.buscarUsuarioPorId(usuarioId);

    //Validación si el usuario no existe
    if (!usuario) {
      throw new Error('El usuario no existe');
    }

    // Obtenemos unicamente las cuentas del usuario
    const cuentas = banco.obtenerCuentasDeUsuario(usuarioId);

    // Recorrer todsas las cuentas del usuario y obteneos sus movimientos
    const cuentasIds = cuentas.map((cuenta) => cuenta.id);

    // Eliminar movimientos duplicados utilizando filter
    const movimientos = banco.movimientos.filter((movimiento) => {
      // Un deposito pertenece al usuario cuandop fue realizado sobre sus cuentas
      if (movimiento.tipo === 'DEPOSITO') {
        return cuentasIds.includes(movimiento.cuentaOrigen);
      }

      // Una transferencia pertenece al usuario cuando una de sus cuewntas aparece como origen
      if (movimiento.tipo === 'TRANSFERENCIA_ENVIADA') {
        return cuentasIds.includes(movimiento.cuentaOrigen);
      }

      // Una transferencia petenece al usuario cuando alguna de sus cuentas aparece como destino
      if (movimiento.tipo === 'TRANSFERENCIA_RECIBIDA') {
        return cuentasIds.includes(movimiento.cuentaDestino);
      }

      return false;
    });

    // Agrupamos la información
    return {
      usuario,
      cuentas,
      movimientos,
    };
  }

  // Obtener resumen del usuario
  obtenerResumenUsuario(usuarioId) {
    // Destructurin: extraemos directamente las propiedades necesarias
    const { usuario, cuentas, movimientos } =
      this.obtenerDatosUsuario(usuarioId);

    // Suma del saldo de todas las cuentas
    const saldoTotal = cuentas.reduce(
      (acumulado, cuenta) => acumulado + Number(cuenta.saldo),
      0,
    );

    return {
      usuario,
      cuentas,
      movimientos,
      saldoTotal,
      totalCuentas: cuentas.length,
      totalMovimientos: movimientos.length,
    };
  }

  // CONSULTA MOVIMIENTOS
  obtenerMovimientosUsuario(usuarioId, tipo = 'TODOS') {
    // Recuperamos únicamente los movimientos
    // correspondientes al usuario.
    const { movimientos } = this.obtenerDatosUsuario(usuarioId);

    // Creamos una copia para evitar modificar
    // accidentalmente el array original.
    let resultado = [...movimientos];

    // Cuando el filtro sea diferente de TODOS
    // conservamos únicamente el tipo solicitado.
    if (tipo !== 'TODOS') {
      resultado = resultado.filter((movimiento) => movimiento.tipo === tipo);
    }

    // Ordenamos los movimientos para mostrar
    // primero las operaciones más recientes.
    resultado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Regresamos el array ya filtrado y ordenado.
    return resultado;
  }

  // obtener resumen de movimientos
  obtenerResumenMovimientos(usuarioId) {
    // Recuperamos todos los movimientos pertenecientes al usuario.
    const movimientos = this.obtenerMovimientosUsuario(usuarioId);

    // Contamos cuántos movimientos existen
    // de cada tipo.
    const depositos = movimientos.filter(
      (movimiento) => movimiento.tipo === 'DEPOSITO',
    ).length;

    // Contamos las transferencias enviadas.
    const enviadas = movimientos.filter(
      (movimiento) => movimiento.tipo === 'TRANSFERENCIA_ENVIADA',
    ).length;

    // Contamos las transferencias recibidas.
    const recibidas = movimientos.filter(
      (movimiento) => movimiento.tipo === 'TRANSFERENCIA_RECIBIDA',
    ).length;

    // Regresamos un resumen que posteriormente utilizará la interfaz para sus tarjetas.
    return {
      total: movimientos.length,
      depositos,
      enviadas,
      recibidas,
    };
  }

  // OPERACIONES BANCARIAS
  realizarDeposito({ cuentaId, monto, descripcion = '' }) {
    // Obtenemos la instancia reconstruida del Banco
    const banco = this.obtenerInstanciaBanco();

    // El modo Banco aplica las reglas correspondientes
    const movimiento = banco.realizarDeposito({ cuentaId, monto, descripcion });

    // Persistimos al nuevo saldo y movimiento generado
    this.guardarBanco();

    //Regresamos el movimiento creado
    return movimiento;
  }

  // TRANSFERENCIA
  realizarTransferencia({
    cuentaOrigenId,
    numeroCuentaDestino,
    monto,
    descripcion = '',
  }) {
    // Recuperamos el Banco con todas sus cuentas reconstruidas
    const banco = this.obtenerInstanciaBanco();

    // Normalizamos el numero recibido
    const numeroDestino = String(numeroCuentaDestino).replace(/\s/g, '').trim();

    // Buscamos la cuenta destino utilizandosu numero de cuenta visible
    const cuentaDestino = banco.buscarCuentaPorNumero(numeroDestino);

    // Detenemos la operación si el numero proporcionado no corresponde a una cuenta
    if (!cuentaDestino) {
      throw new Error('La cuenta destino no existe');
    }

    // Delegamos las reglas financieras
    // al modelo Banco.
    const resultado = banco.realizarTransferencia({
      cuentaOrigenId,
      cuentaDestinoId: cuentaDestino.id,
      monto,
      descripcion,
    });

    // Persistimos los dos nuevos saldos
    // y los movimientos generados.
    this.guardarBanco();

    return resultado;
  }

  // ACTUALIZAR USUARIO
  actualizarUsuario(usuarioId, { nombre, email, telefono }) {
    // Recupera todos los usuarios almacenados.
    const usuarios = storageService.obtener(STORAGE_KEYS.USUARIOS, []);

    // Busca específicamente al usuario que queremos modificar.
    const usuario = usuarios.find((item) => item.id === usuarioId);

    // No podemos modificar un usuario inexistente.
    if (!usuario) {
      throw new Error('El usuario no existe.');
    }

    // Normaliza el email eliminando espacios y convirtiéndolo a minúsculas.
    const emailNormalizado = String(email).trim().toLowerCase();

    // Comprueba si OTRO usuario ya tiene registrado ese mismo correo.
    const emailDuplicado = usuarios.some(
      (item) =>
        item.email.toLowerCase() === emailNormalizado && item.id !== usuarioId,
    );

    // Evita duplicidad de correos.
    if (emailDuplicado) {
      throw new Error('Ya existe un usuario con este correo.');
    }

    // Crea un nuevo array. Cuando encuentra al usuario solicitado, conserva sus propiedades con Spread Operator
    const usuariosActualizados = usuarios.map((item) =>
      item.id === usuarioId
        ? {
            ...item,
            nombre: nombre.trim(),
            email: emailNormalizado,
            telefono: telefono.trim(),
          }
        : item,
    );

    // Persiste el nuevo array.
    storageService.guardar(STORAGE_KEYS.USUARIOS, usuariosActualizados);

    // Reconstruye Banco para mantener sincronizada la información que se encuentra en memoria
    this.recargarBanco();

    // Busca y devuelve el usuario actualizado.
    return usuariosActualizados.find((item) => item.id === usuarioId) || null;
  }

  cambiarPassword(usuarioId, passwordActual, passwordNueva) {
    const usuarios = storageService.obtener(STORAGE_KEYS.USUARIOS, []);

    const usuario = usuarios.find((item) => item.id === usuarioId);

    if (!usuario) {
      throw new Error('El usuario no existe.');
    }

    if (usuario.password !== passwordActual) {
      throw new Error('La contraseña actual no es correcta.');
    }

    if (passwordNueva === passwordActual) {
      throw new Error('La nueva contraseña debe ser diferente.');
    }

    if (passwordNueva.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
    }

    const usuariosActualizados = usuarios.map((item) =>
      item.id === usuarioId
        ? {
            ...item,
            password: passwordNueva,
          }
        : item,
    );

    storageService.guardar(STORAGE_KEYS.USUARIOS, usuariosActualizados);

    this.recargarBanco();

    return true;
  }

  // ELIMINAR USUARIO
  eliminarUsuario(usuarioId) {
    const usuarios = storageService.obtener(STORAGE_KEYS.USUARIOS, []);

    const cuentas = storageService.obtener(STORAGE_KEYS.CUENTAS, []);

    const movimientos = storageService.obtener(STORAGE_KEYS.MOVIMIENTOS, []);

    const usuario = usuarios.find((item) => item.id === usuarioId);

    if (!usuario) {
      throw new Error('El usuario no existe.');
    }

    const cuentasUsuario = cuentas.filter(
      (cuenta) => cuenta.usuarioId === usuarioId,
    );

    const tieneSaldo = cuentasUsuario.some(
      (cuenta) => Number(cuenta.saldo) > 0,
    );

    if (tieneSaldo) {
      throw new Error(
        'No puedes eliminar tu cuenta mientras tengas saldo disponible.',
      );
    }

    const cuentasUsuarioIds = cuentasUsuario.map((cuenta) => cuenta.id);

    const usuariosFiltrados = usuarios.filter((item) => item.id !== usuarioId);

    const cuentasFiltradas = cuentas.filter(
      (cuenta) => cuenta.usuarioId !== usuarioId,
    );

    const movimientosFiltrados = movimientos.filter(
      (movimiento) =>
        !cuentasUsuarioIds.includes(movimiento.cuentaOrigen) &&
        !cuentasUsuarioIds.includes(movimiento.cuentaDestino),
    );

    storageService.guardar(STORAGE_KEYS.USUARIOS, usuariosFiltrados);

    storageService.guardar(STORAGE_KEYS.CUENTAS, cuentasFiltradas);

    storageService.guardar(STORAGE_KEYS.MOVIMIENTOS, movimientosFiltrados);

    this.recargarBanco();

    return true;
  }
}

// Creamos y exportamos una unica instancia reutilizable
export const bancoService = new BancoService();
