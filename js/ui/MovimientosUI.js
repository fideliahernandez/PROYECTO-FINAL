/* =========================================
   MOVIMIENTOS UI IMPORTACIONES
========================================= */

import { authService } from '../services/AuthService.js';

import { bancoService } from '../services/BancoService.js';

import { formatCurrency, formatDate } from '../utils/formatters.js';

/* =========================================
   ESTADO DE LA INTERFAZ
========================================= */

// Guardamos el filtro seleccionado por
// el usuario dentro del módulo.
let filtroActual = 'TODOS';

/* =========================================
   CIERRE DE SESIÓN
========================================= */

function initLogout() {
  // Localizamos el botón.
  const btn = document.querySelector('#logoutBtn');

  // Si no existe, no registramos ningún evento.
  if (!btn) {
    return;
  }

  // Escuchamos el clic.
  btn.addEventListener('click', () => {
    // Solicitamos confirmación mediante SweetAlert2.
    Swal.fire({
      icon: 'question',
      title: 'Cerrar sesión',
      text: '¿Seguro que deseas salir?',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      // Si cancela, terminamos.
      if (!result.isConfirmed) {
        return;
      }

      // Eliminamos la sesión
      authService.logout();

      // Regresamos al login.
      window.location.href = 'index.html';
    });
  });
}

/* =========================================
   ETIQUETAS DE MOVIMIENTOS
========================================= */

function obtenerEtiquetaTipo(tipo) {
  // Este objeto funciona como diccionario:  tipo técnico → texto amigable.
  const etiquetas = {
    DEPOSITO: 'Depósito',

    TRANSFERENCIA_ENVIADA: 'Transferencia enviada',

    TRANSFERENCIA_RECIBIDA: 'Transferencia recibida',
  };

  // Si existe una etiqueta la devolvemos. En caso contrario conservamos el tipo
  return etiquetas[tipo] || tipo;
}

/* =========================================
   DETERMINAR TIPO DE MOVIMIENTO
========================================= */
function obtenerSignoMovimiento(tipo) {
  // Las transferencias enviadas representan
  // una salida de dinero.
  if (tipo === 'TRANSFERENCIA_ENVIADA') {
    return '-';
  }

  // Depósitos y transferencias recibidas
  // representan entradas.
  return '+';
}

/* =========================================
   CLASE VISUAL DEPENDIENDO EL MOVIMIENTO
========================================= */
function obtenerClaseMovimiento(tipo) {
  // Las transferencias enviadas // representan una salida.
  if (tipo === 'TRANSFERENCIA_ENVIADA') {
    return 'movimiento-salida';
  }

  // Los demás movimientos actuales // representan entradas.
  return 'movimiento-entrada';
}

/* =========================================
   RENDER PRINCIPAL
========================================= */

function renderMovimientos(usuario) {
  // Buscamos el contenedor principal.
  const root = document.querySelector('#movimientosRoot');

  // Si el contenedor no existe, no podemos renderizar
  if (!root) {
    return;
  }

  // Obtenemos las cantidades generales de movimientos.
  const resumen = bancoService.obtenerResumenMovimientos(usuario.id);

  // Recuperamos los movimientos utilizando el filtro actualmente seleccionado.
  const movimientos = bancoService.obtenerMovimientosUsuario(
    usuario.id,
    filtroActual,
  );

  root.innerHTML = `
	    <!-- ================================= 
				    ENCABEZADO 
		================================== -->
        <section
            class="movimientos-header"
        >
            <div>
                <span
                    class="dashboard-label"
                >
                    Actividad bancaria
                </span>

                <h2>
                    Historial de movimientos
                </h2>

                <p>
                    Consulta las operaciones
                    realizadas en tus cuentas.
                </p>
            </div>
        </section>

        		
		<!-- ================================= 
						RESUMEN 
		================================== -->
        <section
            class="movimientos-summary"
        >

            <article
                class="movimiento-summary-card"
            >
                <span>
                    Todos
                </span>

                <strong>
                    ${resumen.total}
                </strong>
            </article>


            <article
                class="movimiento-summary-card"
            >
                <span>
                    Depósitos
                </span>

                <strong>
                    ${resumen.depositos}
                </strong>
            </article>


            <article
                class="movimiento-summary-card"
            >
                <span>
                    Enviadas
                </span>

                <strong>
                    ${resumen.enviadas}
                </strong>
            </article>


            <article
                class="movimiento-summary-card"
            >
                <span>
                    Recibidas
                </span>

                <strong>
                    ${resumen.recibidas}
                </strong>
            </article>

        </section>

        		
        <section
            class="movimientos-panel"
        >

            <header
                class="movimientos-toolbar"
            >

                <div>
                    <h3>
                        Operaciones
                    </h3>

                    <p>
                        Filtra el historial
                        por tipo de movimiento.
                    </p>
                </div>

<!-- ========================= FILTROS ========================== -->
                <div
                    class="movimientos-filtros"
                >

				<!-- Filtro general. -->
                    <button
                        type="button"
                        class="
                            filtro-btn
                            ${filtroActual === 'TODOS' ? 'active' : ''}
                        "
                        data-filtro="TODOS"
                    >
                        Todos
                    </button>

				<!-- Filtro de depósitos. -->
                    <button
                        type="button"
                        class="
                            filtro-btn
                            ${filtroActual === 'DEPOSITO' ? 'active' : ''}
                        "
                        data-filtro="DEPOSITO"
                    >
                        Depósitos
                    </button>

                    				
				<!-- Filtro de transferencias enviadas. -->
                    <button
                        type="button"
                        class="
                            filtro-btn
                            ${
                              filtroActual === 'TRANSFERENCIA_ENVIADA'
                                ? 'active'
                                : ''
                            }
                        "
                        data-filtro="TRANSFERENCIA_ENVIADA"
                    >
                        Enviadas
                    </button>

				<!-- Filtro de transferencias recibidas. -->
                    <button
                        type="button"
                        class="
                            filtro-btn
                            ${
                              filtroActual === 'TRANSFERENCIA_RECIBIDA'
                                ? 'active'
                                : ''
                            }
                        "
                        data-filtro="TRANSFERENCIA_RECIBIDA"
                    >
                        Recibidas
                    </button>

                </div>

            </header>

            			
			<!-- ================================= 
						TABLA O ESTADO VACÍO 
			================================== -->
            ${
              // Si no existen movimientos para
              // el filtro actual mostramos el estado vacío.
              movimientos.length === 0
                ? `
                        <div
                            class="movimientos-empty"
                        >
                            <strong>
                                No hay movimientos
                                para mostrar.
                            </strong>

                            <p>
                                Realiza un depósito
                                o una transferencia
                                para generar actividad.
                            </p>
                        </div>
                    `
                : `
                        <div
                            class="table-wrapper"
                        >

                            <table
                                class="movimientos-table"
                            >

                                <thead>
                                    <tr>
                                        <th>
                                            Fecha
                                        </th>

                                        <th>
                                            Tipo
                                        </th>

                                        <th>
                                            Descripción
                                        </th>

                                        <th>
                                            Monto
                                        </th>

                                        <th>
                                            Saldo
                                        </th>
                                    </tr>
                                </thead>


                                <tbody>

                                								
                                    ${movimientos
                                      .map((movimiento) => {
                                        // Obtenemos + o -
                                        // dependiendo del tipo.
                                        const signo = obtenerSignoMovimiento(
                                          movimiento.tipo,
                                        );
                                        // Obtenemos la clase CSS correspondiente.
                                        const clase = obtenerClaseMovimiento(
                                          movimiento.tipo,
                                        );
                                        // Convertimos cada movimiento en una fila de la tabla.
                                        return `
                                                    <tr>
                                                        <td>
                                                            ${formatDate(
                                                              movimiento.fecha,
                                                            )}
                                                        </td>

                                                        <td>
                                                            <span
                                                                class="
                                                                    movimiento-tipo
                                                                    ${clase}
                                                                "
                                                            >
		                                                ${obtenerEtiquetaTipo(
                                                      movimiento.tipo,
                                                    )}
                                                            </span>
                                                        </td>

                                                        						
                                                        <td>
                                                            ${
                                                              movimiento.descripcion ||
                                                              'Sin descripción'
                                                            }
                                                        </td>


                                                        <td
                                                            class="
                                                                movimiento-monto
                                                                ${clase}
                                                            "
                                                        >
                                                        ${signo}${formatCurrency(
                                                          movimiento.monto,
                                                        )}
                                                        </td>


                                                        <td>
                                                            ${formatCurrency(
                                                              movimiento.saldoResultante,
                                                            )}
                                                        </td>
                                                    </tr>
                                                `;
                                      })
                                      .join('')}

                                  </tbody>

                            </table>

                        </div>
                    `
            }

        </section>
    `;
  // Los botones de filtro fueron generados
  // mediante innerHTML. Ahora podemos
  // registrar sus eventos.
  initFiltros(usuario);
}

/* =========================================
   FILTROS
========================================= */

function initFiltros(usuario) {
  // Recuperamos todos los elementos // que contienen data-filtro.
  const botones = document.querySelectorAll('[data-filtro]');

  // Recorremos todos los botones.
  botones.forEach((boton) => {
    // Registramos el evento click individualmente.
    boton.addEventListener('click', () => {
      // dataset permite recuperar el valor
      // almacenado en data-filtro.
      filtroActual = boton.dataset.filtro;

      // Volvemos a renderizar utilizando
      // el nuevo filtro seleccionado.
      renderMovimientos(usuario);
    });
  });
}

/* =========================================
   INICIALIZACIÓN
========================================= */

function init() {
  // Primero comprobamos que exista
  // una sesión válida.
  const accesoPermitido = authService.protegerRuta();

  if (!accesoPermitido) {
    return;
  }

  // Inicializamos el cierre de sesión.
  initLogout();

  // Recuperamos el usuario autenticado
  const usuario = authService.getCurrentUser();

  if (!usuario) {
    return;
  }

  try {
    // Reconstruimos el Banco utilizando
    // la información más reciente.
    bancoService.recargarBanco();

    // Renderizamos el historial.
    renderMovimientos(usuario);
  } catch (error) {
    // Mostramos cualquier error producido durante la carga.
    Swal.fire({
      icon: 'error',
      title: 'No fue posible cargar los movimientos',
      text: error.message,
    });
  }
}

// Solamente inicializamos el módulo cuando estamos en movimientos.html.
if (document.querySelector('.app-movimientos')) {
  init();
}
