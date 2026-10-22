// IMPORTAR SERVICIO DE AUTENTICACIÓN Y FORMATEADORES
import { authService } from '../services/AuthService.js';
import { bancoService } from '../services/BancoService.js';
import {
  formatCurrency,
  formatDate,
  formatAccountNumber,
} from '../utils/formatters.js';

// CERRAR SESION
function initLogout() {
  // Buscamos el boton cerrar sesión y lo obtenemos
  const btn = document.querySelector('#logoutBtn');

  // Validación si el boton no existe
  if (!btn) {
    return;
  }

  // Escuchamos el evento click
  btn.addEventListener('click', () => {
    // Solicitar confirmación ante de salir de la sesión
    Swal.fire({
      icon: 'question',
      title: 'Cerrar sesión',
      text: '¿Seguro que quieres cerrar sesión?',
      showCancelButton: true,
      confirmButtontext: 'Sí, salir',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      // Si no hay confirmación, no hacemos nada
      if (!result.isConfirmed) {
        return;
      }

      // Elimina la sesión almacenada
      authService.logout();

      // Regresa a la página de acceso
      window.location.href = 'index.html';
    });
  });
}

// RENDERIZAR MI CUENTA
function renderCuenta(usuario, cuenta) {
  // Buscamos y obtenemos el contenedor dinamico
  const root = document.querySelector('#cuentaRoot');

  // Comprueba que existan todos los elementos necesarios para el renderizado
  if (!root || !usuario || !cuenta) {
    return;
  }

  // Generar interfaz dinameicamente de la cuenta
  root.innerHTML = /*html*/ `
  
  <section class="cuenta-layout">
    <article class="cuenta-card">
      <header class="cuenta-card-header">
        <div>
          <h2>
            ${usuario.nombre}
          </h2>
          <p class="cuenta-meta">
            Titular de la cuenta
          </p>
        </div>
        <span class='badge ${cuenta.activa ? 'badge-success' : 'badge-danger'}'>
          ${cuenta.activa ? 'Activa' : 'Inactiva'}
        </span>
      </header>

      <section class="cuenta-detalle">
          <p>
            <strong>
              Numero de cuenta:
            </strong>
            ${formatAccountNumber(cuenta.numeroCuenta)}
          </p>

          <p>
            <strong>
              Tipo:
            </strong>
            ${cuenta.tipo}
          </p>

          <p>
            <strong>
              Saldo actual:
            </strong>
            ${formatCurrency(cuenta.saldo)}
          </p>

          <p>
            <strong>
              Fecha de apertura:
            </strong>
            ${formatDate(cuenta.fechaApertura)}
          </p>
        </section>
    </article>

    <!--Sección destinada a modificar los datos personales del usuario-->
    <section class="cuenta-panel">
      <article class="cuenta-section">
        <h3>
          Información personal
        </h3>
        <!--novalidate permite cntrolar nuestras vslidaciones mediante Javascript-->

        <form id='formInfoPersonal' class='cuenta-form' novalidate>

          <div class="form-group">

            <label for="infoNombre">
              Nombre completo
            </label>

<!--El nombre almacenado se coloca como valor inicial del input-->
            <input id='infoNombre' type="text" value='${usuario.nombre}'>

<!-- Aquí aparecerá un posible error relacionado con nombre. -->
            <p class="field-error" data-error-for="infoNombre">
            </p>
          </div>

          <div class="form-group">
            <label for="infoEmail">
              Correo electronico
            </label>

            <!-- Carga el email actual. -->
            <input id="infoEmail" type="email" value="${usuario.email}">

            <!-- Contenedor de error del email. -->
            <p class="field-error" data-error-for="infoEmail">
            </p>
          </div>

          <div class="form-group">
            <label for="infoTelefono">
              Teléfono
            </label>

            <!-- Si telefono no contiene un valor, utilizamos una cadena vacía. -->
            <input id="infoTelefono" type="tel" value='${usuario.telefono || null}'>

            <!-- Contenedor del error del teléfono. -->
            <p class="field-error" data-error-for="infoTelefono"></p>
          </div>

          <!-- Al ser type="submit", este botón dispara el evento submit del formulario. -->

          <button type='submit' class="btn btn-primary">
            Guardar Cambios
          </button>        
        </form>
      </article>

      <!-- Sección dedicada al cambio de contraseña. -->
      <article class="cuenta-section">
        <h3>
          Seguridad
        </h3>

        <form id="formSeguridad" class="cuenta-form" novalidate>

          <div class="form-group">

            <label for="segPasswordActual">
              Contraseña actual
            </label>

          <!-- Solicita la contraseña que actualmente posee el usuario. -->
          <input id="segPasswordActual" type="password">
          
          <p class="field-error" data-error-for="segPasswordActual"></p>          
          </div>

          <div class="form-group">

            <label for="segPasswordNueva">
              Nueva contraseña
            </label>

            <!-- Nueva contraseña solicitada. -->
            <input id="segPasswordNueva" type="password">
            <p class="field-error" data-error-for="segPasswordNueva"></p>

          </div>

          <div class="form-group">

            <label for="segPasswordConfirmar">
              Confirmar nueva contraseña
            </label>

            <!-- Permite comprobar que el usuario escribió correctamente la nueva contraseña. -->
            <input id="segPasswordConfirmar" type="password">

            <p class="field-error" data-error-for="segPasswordConfirmar"></p>
          </div>

          <button type="submit" class="btn btn-primary">
            Cambiar contraseña
          </button>

        </form>
      </article>

      				
<!-- Sección visualmente diferenciada porque contiene una acción destructiva. -->
                <article
                    class="
                        cuenta-section
                        cuenta-section-danger
                    "
                >

                    <h3>
                        Zona peligrosa
                    </h3>

                    <p
                        class="cuenta-warning"
                    >
                        Eliminar tu cuenta
                        es una acción
                        irreversible.
                    </p>

<!-- Este botón no envía un formulario. Escucharemos directamente su evento click. -->
                    <button
                        type="button"
                        id="btnEliminarCuenta"
                        class="btn btn-danger"
                    >
                        Eliminar mi cuenta
                    </button>

                </article>

            </section>

        </section>
  `;

  // Los formularios y el boton ya existen en el DOM agregamos eventos
  inicializarFormulariosCuenta(usuario, cuenta);
}

// EVENTOS DE MI CUENTA
function inicializarFormulariosCuenta(usuario, cuenta) {
  // Obtener el formulario de información
  const formInfo = document.querySelector('#formInfoPersonal');

  // Obtener el formualrio de seguridad
  const formSeguridad = document.querySelector('#formSeguridad');

  //Obtiene el boton de eliminación
  const btnEliminar = document.querySelector('#btnEliminarCuenta');

  // Configurar el evento para actualizar información personal
  if (formInfo) {
    formInfo.addEventListener('submit', (event) =>
      manejarActualizarInfo(event, usuario),
    );
  }

  // Configurar el evento cambiar la contraseña
  if (formSeguridad) {
    formSeguridad.addEventListener('submit', (event) =>
      manejarCambiarPassword(event, usuario),
    );
  }

  //Configurar el evento para eliminar cuenta
  if (btnEliminar) {
    btnEliminar.addEventListener('click', () =>
      manejarEliminarCuenta(usuario, cuenta),
    );
  }
}

// MOSTRAR ERROR DE CAMPO
function mostrarError(campoId, mensaje) {
  // Construye dinámicamente un selector utilizando el atributo data-error-for.
  const elemento = document.querySelector(`[data-error-for="${campoId}"]`);

  // Si encontramos el elemento, colocamos el mensaje dentro de él.
  if (elemento) {
    elemento.textContent = mensaje;
  }
}

// LIMPIAR ERRRES
function limpiarErroresCuenta() {
  // Obtiene todos los mensajes de error.
  // Recorre cada elemento encontrado.
  // Elimina el mensaje anterior.
  document.querySelectorAll('.field-error').forEach((elemento) => {
    elemento.textContent = '';
  });
}

// MANEJAR ACTUALIZAR INFO
function manejarActualizarInfo(event, usuario) {
  // Evita el envío tradicional y la recarga del navegador.
  event.preventDefault();

  // Elimina errores de intentos anteriores.
  limpiarErroresCuenta();

  // Obtiene y limpia el nombre
  const nombre = document.querySelector('#infoNombre').value.trim();

  // Obtiene, limpia y normaliza el correo
  const email = document.querySelector('#infoEmail').value.trim().toLowerCase();

  // Obtiene y limpia el teléfono.
  const telefono = document.querySelector('#infoTelefono').value.trim();

  // Bandera que permitirá saber si todas las validaciones pasaron.
  let valido = true;

  // Nombre obligatorio
  if (!nombre) {
    mostrarError('infoNombre', 'El nombre es obligatorio.');

    valido = false;
  }

  // Expresión regular utilizada para realizar una validación básica de email.
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Comprueba email obligatorio y formato.
  if (!email || !emailValido) {
    mostrarError('infoEmail', 'Ingresa un correo válido.');

    valido = false;
  }

  // Teléfono obligatorio.
  if (!telefono) {
    mostrarError('infoTelefono', 'El teléfono es obligatorio.');

    valido = false;
  }

  // Si alguna validación falló, no enviamos datos al servicio.
  if (!valido) {
    return;
  }

  // Solicita al servicio la actualización.
  try {
    const actualizado = bancoService.actualizarUsuario(usuario.id, {
      nombre,
      email,
      telefono,
    });

    // Informa que la operación terminó.
    Swal.fire({
      icon: 'success',
      title: 'Datos actualizados',
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      // Recupera nuevamente las cuentas utilizando los datos actualizados.
      const { cuentas } = bancoService.obtenerDatosUsuario(actualizado.id);

      // Vuelve a renderizar sin recargar completamente la página.
      renderCuenta(actualizado, cuentas[0]);
    });
  } catch (error) {
    // Los errores del servicio se presentan debajo del campo email
    mostrarError('infoEmail', error.message);
  }
}

// CAMBIAR CONTRASEÑA DESDE LA INTERFAZ
function manejarCambiarPassword(event, usuario) {
  // Evita recargar la página.
  event.preventDefault();

  // Limpia errores anteriores.
  limpiarErroresCuenta();

  // Recupera contraseña actual.
  const actual = document.querySelector('#segPasswordActual').value.trim();

  // Recupera contraseña nueva.
  const nueva = document.querySelector('#segPasswordNueva').value.trim();

  // Recupera confirmación.
  const confirmar = document
    .querySelector('#segPasswordConfirmar')
    .value.trim();

  let valido = true;

  // Contraseña actual obligatoria.
  if (!actual) {
    mostrarError('segPasswordActual', 'Ingresa tu contraseña actual.');

    valido = false;
  }

  // Nueva contraseña obligatoria y de mínimo seis caracteres.
  if (!nueva || nueva.length < 6) {
    mostrarError(
      'segPasswordNueva',
      'La nueva contraseña debe tener al menos 6 caracteres.',
    );

    valido = false;
  }

  // No permite utilizar la misma contraseña.
  if (nueva === actual) {
    mostrarError('segPasswordNueva', 'La nueva contraseña debe ser diferente.');

    valido = false;
  }

  // Comprueba la confirmación.
  if (!confirmar || confirmar !== nueva) {
    mostrarError('segPasswordConfirmar', 'Las contraseñas no coinciden.');

    valido = false;
  }

  if (!valido) {
    return;
  }

  // Solicita al servicio realizar el cambio definitivo.
  try {
    bancoService.cambiarPassword(usuario.id, actual, nueva);

    document.querySelector('#formSeguridad').reset();

    Swal.fire({
      icon: 'success',
      title: 'Contraseña actualizada',
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    mostrarError('segPasswordActual', error.message);
  }
}

// ELIMINAR CUENTA
function manejarEliminarCuenta(usuario) {
  Swal.fire({
    icon: 'warning',
    title: 'Eliminar cuenta',
    text: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar mi cuenta',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc2626',
  }).then((result) => {
    if (!result.isConfirmed) {
      return;
    }

    // BancoService aplica las reglas y elimina los datos relacionados.
    try {
      // Una vez eliminado el usuario, también eliminamos su sesión.
      bancoService.eliminarUsuario(usuario.id);

      authService.logout();

      Swal.fire({
        icon: 'success',
        title: 'Cuenta eliminada',
        text: 'Tu usuario y sus datos han sido eliminados.',
        confirmButtonText: 'Continuar',
      }).then(() => {
        window.location.href = 'index.html';
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se puede eliminar',
        text: error.message,
      });
    }
  });
}

// INICIALIZACIÓN DE MI CUENTA
function init() {
  const accesoPermitido = authService.protegerRuta();

  if (!accesoPermitido) {
    return;
  }

  initLogout();

  const usuario = authService.getCurrentUser();

  if (!usuario) {
    return;
  }

  try {
    bancoService.recargarBanco();

    // Obtiene las cuentas del usuario.
    const { cuentas } = bancoService.obtenerDatosUsuario(usuario.id);

    // Toma la primera como cuenta principal.
    const cuentaPrincipal = cuentas[0] || null;

    // Informa si no existe una cuenta.
    if (!cuentaPrincipal) {
      Swal.fire({
        icon: 'error',
        title: 'Cuenta no encontrada',
        text: 'No existe una cuenta bancaria asociada a este usuario.',
      });

      return;
    }

    // Construye la interfaz.
    renderCuenta(usuario, cuentaPrincipal);
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'No fue posible cargar la cuenta',
      text: error.message,
    });
  }
}

// EJECUTAR SOLO EN CUENTA.HTML
if (document.querySelector('.app-cuenta')) {
  // Inicializa la página.
  init();
}
