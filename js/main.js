console.log('Sistema de Gestión Bancaria - v0.1.0');

// IMPORTAR VALIDADORES, HELPERS Y FORMATEADORES
import { validarCampoObligatorio, validarMonto } from './utils/validators.js';
import { generarId } from './utils/helpers.js';
import {
  formatCurrency,
  formatDate,
  formatAccountNumber,
} from './utils/formatters.js';

// IMPORTAR MODELOS
import { Usuario } from './models/Usuario.js';
import { Cuenta } from './models/Cuenta.js';
import { Movimiento } from './models/Movimiento.js';
import { Banco } from './models/Banco.js';

// IMPORTAR SERVICIO DE PEERSISTENCIA CON LOCALSTORAGE
import { STORAGE_KEYS, storageService } from './services/StorageService.js';

// mOSTRAMOS NUESTROS IMPORTS
console.log('Sistema de gstion bancaria -v0.2.0');

// MOSTRAMOS VALIDACIONES DEBEN MOSTRAR TRU
console.log('Campo obligatorio : ', validarCampoObligatorio('Banco digital'));

// Validacion del monto debe regresar true
console.log('Monto valido: ', validarMonto(1000));

// mostramos generador dinamico de id
console.log('ID generado: ', generarId());

// Convertir 1500 a formato monetario MXN
console.log('Monto formateado: ', formatCurrency(1500));

// Formateamosla fecha actual
console.log('Fecha formateada: ', formatDate(new Date()));

// Separar los digitos de la cuenta
console.log('Numero de cuenta: ', formatAccountNumber('123456789012'));

// GUARDAR ESTADO DEL BANCO version v0.5.0
function guardarBanco(banco) {
  // GUARDAR USUARIOS
  storageService.guardar(STORAGE_KEYS.USUARIOS, banco.usuarios);

  // GUARDAR CUENTAS
  storageService.guardar(STORAGE_KEYS.CUENTAS, banco.cuentas);

  // GUARDAR MOVIMIENTOS
  storageService.guardar(STORAGE_KEYS.MOVIMIENTOS, banco.movimientos);

  //
}

// CARGAR DATOS DEL BANCO: rtecupera la información persistida
function cargarBanco() {
  // RECUPERAR USUARIOS
  const usuariosGuardados = storageService.obtener(STORAGE_KEYS.USUARIOS, []);

  // RECUPERAR CUENTAS
  const cuentasGuardadas = storageService.obtener(STORAGE_KEYS.CUENTAS, []);

  // RECUPERAR MOVIMIENTOS
  const movimientosGuardados = storageService.obtener(
    STORAGE_KEYS.MOVIMIENTOS,
    [],
  );

  // RECONSTRUIR USUARIOS
  const usuarios = usuariosGuardados.map((usuario) => new Usuario(usuario));

  // RECONSTRUIR LAS Cuentas
  const cuentas = cuentasGuardadas.map((cuenta) => new Cuenta(cuenta));

  // RECONSTRUIR MOVIMIENTOS
  const movimientos = movimientosGuardados.map(
    (movimeinto) => new Movimiento(movimeinto),
  );

  // CREO NUEVAMENTE EL BANCO: mediante las colecciones reconstruidad
  return new Banco({
    usuarios,
    cuentas,
    movimientos,
  });
}

// CARGAR BANCO PERSISTIDO
const bancoDemo = cargarBanco();

if (bancoDemo.usuarios.length === 0) {
  // CREAMOS EL USUARIO INICIAL
  const usuarioDemo = new Usuario({
    nombre: 'Juan Suarez',
    email: 'juan@correo.com',
    telefono: '5512345678',
    password: '123456',
  });

  // REGISTAR USUARIO
  bancoDemo.agregarUsuario(usuarioDemo);

  // CREAR CUENTA INICIAL
  const cuentaDemo = new Cuenta({
    numeroCuenta: '123456789012',
    usuarioId: usuarioDemo.id,
  });

  bancoDemo.agregarCuenta(cuentaDemo);

  bancoDemo.realizarDeposito({
    cuentaId: cuentaDemo.id,
    monto: 1000,
    descripcion: 'Deposito para las cocas',
  });

  guardarBanco(bancoDemo);
  console.log('Datos iniciales guardados');
}

//DATOS RECUPERADOS
console.log('Bsnco recuperado: ', bancoDemo);

//MOSTRAR USUARIOS
console.log('Usuarios almacenados: ', bancoDemo.usuarios);

// MOSTRAR CUENTAS
console.log('Cuentas almacenadas: ', bancoDemo.cuentas);

// MOSTRAR MOVIMIENTOS
console.log('Movimientos almacenados: ', bancoDemo.movimientos);

// OBTENER PRIMEA CUENTA
const cuentaPrincipal = bancoDemo.cuentas[0] || null;

// VALIDAR SI EXISTE
if (cuentaPrincipal) {
  console.log('Saldo persistido: ', formatCurrency(cuentaPrincipal.saldo));

  // utiliza5r instance of que verifica la informacion despues de recuperarla
  console.log(
    '¿La cuenta recuperada sigue siendo una instancia de Cuenta?',
    cuentaPrincipal instanceof Cuenta,
  );
}
