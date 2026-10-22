// IMPORTAMOS EL SERVICIO DE AUTENTYICACION

import { authService } from '../services/AuthService.js';
import { bancoService } from '../services/BancoService.js';
import { formatCurrency, formatAccountNumber } from '../utils/formatters.js';

// Renderización visual de la información bancaria
function renderDashboard(resumen) {
  //Buscamos el contenido principal
  const root = document.querySelector('#dashboardRoot');

  // Si el elmento no existe, detenemos la funcion
  if (!root) {
    return;
  }

  // Extraemos la información necesaria para la interfaz
  const { usuario, cuentas, saldoTotal, totalCuentas, totalMovimientos } =
    resumen;

  // Utilizar la primera cuenta como principal
  const cuentaPrincipal = cuentas[0] || null;

  // Generar el contenido HTML del Dashboard mediante un template literal
  // Renderizado dinamico
  root.innerHTML = /*html*/ `
  
  <section class='dashboard-welcome'>
    <div>
      <p class="dashboard-label">
        Bienvenido
      </p>
      <h2>
        ${usuario.nombre}
      </h2>
      <p>
        Consulta el estado actual de tus cuentas
      </p>
    </div>
  </section>

  <section class="summary-grid">
    <article class="summary-card">
      <span>
        Saldo total
      </span>

      <strong>
        ${formatCurrency(saldoTotal)}
      </strong>
    </article>

    <article class="summary-card">
      <span>
        Cuentas
      </span>

      <strong>
        ${totalCuentas}
      </strong>
    </article>

    <article class="summary-card">
      <span>
        Movimientos
      </span>
      <strong>
        ${totalMovimientos}
      </strong>
    </article>
  </section>
  
  <section class="dashboard-section">
    <header class="section-header">
      <div>
        <span>
          Cuenta Principal
        </span>
        <h3>
          Información bancaria
        </h3>
      </div>
    </header>

    ${
      cuentaPrincipal
        ? `
      
      <article>
        <div>
          <span>
            Numero de cuenta
          </span>
          <strong>
            ${formatAccountNumber(cuentaPrincipal.numeroCuenta)}
          </strong>
        </div>

        <div>
          <span>
            Tipo
          </span>
          
          <strong>
            ${cuentaPrincipal.tipo}
          </strong>
        </div>

        <div>
          <span>
            Saldo disponible
          </span>

          <strong>
            ${formatCurrency(cuentaPrincipal.saldo)}
          </strong>
        </div>
      </article>
      
      `
        : `

      <p>
        No tienes cuentas bancarias registradas
      </p>
      
      `
    }
  </section>
  `;
}

// CONFIGURACIÓN DEL BOTON CERRAR SESION
function initLogout() {
  // Buscar el boton por ID
  const btn = document.querySelector('#logoutBtn');

  // Evitar continuar si el boton no existe
  if (!btn) {
    return;
  }

  // Añadimos el evento al click del usuario
  btn.addEventListener('click', () => {
    // Alerta de conficacion con Sweet
    Swal.fire({
      icon: 'question',
      title: 'Cerrar sesión',
      text: '¿Seguro que deseas salir?',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      // Si el usuario cancela, no hacemos nada
      if (!result.isConfirmed) {
        return;
      }

      //Eliminar la sesión actual
      authService.logout();

      // Regresa la pagina inicial
      window.location.href = 'index.html';
    });
  });
}

// INICIALIZAR EL DASHBOARD
function init() {
  // PROTEGER RUTA
  const accesoPermitido = authService.protegerRuta();

  // DETENER SIN ACCESO
  if (!accesoPermitido) {
    return;
  }

  // Recuperar al usuario autenticado
  const usuario = authService.getCurrentUser();

  // Validacion Adicional antes de consultar la información bancaria
  if (!usuario) {
    return;
  }

  // Fuerza la reeconstruccion dle banco utilizando el estado mas reciente 4en localstorage
  try {
    bancoService.recargarBanco();

    // Obtener el recumen correpondiente
    const resumen = bancoService.obtenerResumenUsuario(usuario.id);

    // Generamos el contenido visual
    renderDashboard(resumen);

    // Configuramos el boton logout
    initLogout();
  } catch (error) {
    // Informamos cualquier error con Sweetalert
    Swal.fire({
      icon: 'error',
      title: 'No fue posible cargar el dashboard',
      text: error.message,
    });
  }
}

init();
