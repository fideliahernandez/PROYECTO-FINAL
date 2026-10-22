// IMPORTAR VALIDADORES, HELPERS Y FORMATEADORES
import { validarCampoObligatorio } from './utils/validators.js';
import { generarNumeroCuenta } from './utils/helpers.js';

// IMPORTAR MODELOS
import { Usuario } from './models/Usuario.js';
import { Cuenta } from './models/Cuenta.js';

// IMPORTAR SERVICIO DE PEERSISTENCIA CON LOCALSTORAGE
import { STORAGE_KEYS, storageService } from './services/StorageService.js';

// IMPORTAR AUTENTICACIÓN
import { authService } from './services/AuthService.js';

// INICIALIZAR STORAGE
function inicializarStorage() {
  // RECUPERAR USUARIOS
  const usuarios = storageService.obtener(STORAGE_KEYS.USUARIOS, null);

  // RECUPERAR CUENTAS
  const cuentas = storageService.obtener(STORAGE_KEYS.CUENTAS, null);

  // RECUPERAR MOVIMIENTOS
  const movimientos = storageService.obtener(STORAGE_KEYS.MOVIMIENTOS, null);

  // CREAMOS USUARIO SI NO EXISTE
  if (usuarios === null) {
    storageService.guardar(STORAGE_KEYS.USUARIOS, []);
  }

  // CREAR CUENTAS SI NO EXISTE
  if (movimientos === null) {
    storageService.guardar(STORAGE_KEYS.MOVIMIENTOS, []);
  }
}

// MANEJAR EL REGISTRO
function manejarRegistro(event) {
  // EVITAR REFRESH DE PAGINA
  event.preventDefault();

  // OBTENEMOS EL NOMBRE
  const nombre = document.querySelector('#registroNombre').value.trim();

  // OBTENEMOS EL EMAIL
  const email = document
    .querySelector('#registroEmail')
    .value.trim()
    .toLowerCase();

  // OBTENER TELEFONO
  const telefono = document.querySelector('#registroTelefono').value.trim();

  // OBTENER CONTRASEÑA
  const password = document.querySelector('#registroPassword').value;

  // CONFIRMAR CONTRASEÑA
  const confirmarPassword = document.querySelector(
    '#registroConfirmPassword',
  ).value;

  // VALIDACIÓN DE CAMPOS OBLIGATORIOS
  if (
    !validarCampoObligatorio(nombre) ||
    !validarCampoObligatorio(email) ||
    !validarCampoObligatorio(password)
  ) {
    // mostrar una alerta con SweetAlert
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Completa los campos obligatorios',
    });

    return;
  }

  // VALIDAR LONGITUD DE CONTRASEÑA
  if (password.length < 6) {
    Swal.fire({
      icon: 'warning',
      title: 'Contraseña inválida',
      text: 'La contraseña debe tener al menos 6 caracteres',
    });

    return;
  }

  // COMPARAR CONTRASEÑAS
  if (password !== confirmarPassword) {
    Swal.fire({
      icon: 'warning',
      title: 'Contraseñas diferentes',
      text: 'Las contraseñas no coinciden',
    });

    return;
  }

  // RECUPERAR USUARIOS PARA EVITAR CORREOS DUPLICADOS
  const usuarios = storageService.obtener(STORAGE_KEYS.USUARIOS, []);

  // BUSCAR CORREO DUPLICADO
  const emailExistente = usuarios.some(
    (usuario) => usuario.email.toLowerCase() === email,
  );

  // DETENER REGISTRO DUPLICADO
  if (emailExistente) {
    Swal.fire({
      icon: 'error',
      title: 'Correo registrado',
      text: 'Ya existe un usuario con este correo',
    });

    return;
  }

  const nuevoUsuario = new Usuario({
    nombre,
    email,
    telefono,
    password,
  });

  // NUMERO DE CUENTA
  let numeroCuenta;

  // GENERAR NUMERO UNICO
  do {
    numeroCuenta = generarNumeroCuenta();
  } while (
    //Recuperamos todas las cuentas
    storageService
      .obtener(STORAGE_KEYS.CUENTAS, [])
      .some((cuenta) => cuenta.numeroCuenta === numeroCuenta)
  );

  // CREAR CUENTA
  const nuevaCuenta = new Cuenta({
    numeroCuenta,
    tipo: 'Ahorro',
    saldo: 0,
    usuarioId: nuevoUsuario.id,
  });

  // RECUPERAR CUENTAS
  const cuentas = storageService.obtener(STORAGE_KEYS.CUENTAS, []);

  // AGREGAR USUARIO
  usuarios.push(nuevoUsuario);

  // AGREGAR CUENTA
  cuentas.push(nuevaCuenta);

  // GUARDAR USUARIOS
  storageService.guardar(STORAGE_KEYS.USUARIOS, usuarios);

  // GUARDAMOS CUENTAS
  storageService.guardar(STORAGE_KEYS.CUENTAS, cuentas);

  // REGISTRO EXITOSO
  Swal.fire({
    icon: 'success',
    title: 'Registro exitoso',
    text: 'Tu usuario y cuenta bancaria fueron creados correctamente.',
    confirmButtonText: 'Continuar',
  }).then(() => {
    // LIMPIAR FORMULARIO
    document.querySelector('#formRegistro').reset();

    // COPIAR CORREO AL LOGIN
    document.querySelector('#loginEmail').value = email;
  });
}

// MANEJAR LOGIN
function manejarLogin(event) {
  // EVITAR ENVIO AUTOMATICO
  event.preventDefault();

  // OBTENER MAIL
  const email = document
    .querySelector('#loginEmail')
    .value.trim()
    .toLowerCase();

  // OBTENER CONTRASEÑA
  const password = document.querySelector('#loginPassword').value;

  // VALIDAMOS CAMPOS
  if (!validarCampoObligatorio(email) || !validarCampoObligatorio(password)) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Ingresa tu correo y contraseña',
    });

    return;
  }

  // INTENTAR LOGIN
  try {
    //AUTENTICAR USUARIO
    const usuario = authService.login(email, password);
    console.log('Usuario autenticado:', usuario);

    // LOGIN EXITOSO
    Swal.fire({
      icon: 'success',
      title: `Bienvenido, ${usuario.nombre}`,
      text: 'Inicio de sesión correcto. ',
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      // REDIRIGIR AL DASHBOARD
      console.log('Redirigiendo al Dashboard...');
      window.location.href = 'dashboard.html';
    });
  } catch (error) {
    // LOGIN INCORRECTO
    Swal.fire({
      icon: 'error',
      title: 'No fue posible iniciar sesión',
      text: error.message,
    });
  }
}

// INICIALIZAR APLICACIÓN
function init() {
  // PREPARAR LOCALSTORAGE
  inicializarStorage();

  // COMPROBAR SESIÓN
  if (authService.getCurrentUser()) {
    window.location.href = 'dashboard.html';

    return;
  }

  // OBTENER LOGIN
  const formLogin = document.querySelector('#formLogin');

  // OBTENER REGISTRO
  const formRegistro = document.querySelector('#formRegistro');

  // EVENTO LOGIN: cuando ocurra el submit ejecutar manejarLogin
  if (formLogin) {
    formLogin.addEventListener('submit', manejarLogin);
  }

  // EVENTO REGISTRO: cuando ocurra submit ejecutar manejarRegistro
  if (formRegistro) {
    formRegistro.addEventListener('submit', manejarRegistro);
  }
}

// EJECUTAR INICIALIZACIÓN
init();
