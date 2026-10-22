/* =========================================
   TRANSFERENCIAS IMPORTACIONES
========================================= */

import { authService } from '../services/AuthService.js';

import { bancoService } from '../services/BancoService.js';

import { formatCurrency, formatAccountNumber } from '../utils/formatters.js';

import { validarMonto, validarCampoObligatorio } from '../utils/validators.js';

/* =========================================
   CIERRE DE SESIÓN
========================================= */

function initLogout() {
  // Buscamos el botón correspondiente.
  const btn = document.querySelector('#logoutBtn');

  // Si no existe, detenemos la inicialización.
  if (!btn) {
    return;
  }

  // Escuchamos el clic.
  btn.addEventListener('click', () => {
    // Pedimos confirmación.
    Swal.fire({
      icon: 'question',
      title: 'Cerrar sesión',
      text: '¿Seguro que deseas salir?',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      // No hacemos nada si el usuario cancela.
      if (!result.isConfirmed) {
        return;
      }

      // Eliminamos la sesión.
      authService.logout();

      // Regresamos al acceso.
      window.location.href = 'index.html';
    });
  });
}

/* =========================================
   RENDER DEL FORMULARIO
========================================= */

function renderFormulario(usuario, cuentas) {
  // Contenedor donde construiremos toda la interfaz.
  const root = document.querySelector('#transferenciaRoot');

  if (!root) {
    return;
  }

  // Tomamos la primera cuenta como cuenta principal.
  const cuentaPrincipal = cuentas[0] || null;

  // Sin cuentas no podemos realizar ninguna operación bancaria.
  if (!cuentaPrincipal) {
    root.innerHTML = `
            <section
                class="transferencia-card"
            >
                <h2>
                    No tienes cuentas
                    disponibles.
                </h2>
            </section>
        `;

    return;
  }

  // Construimos dinámicamente la interfaz utilizando los datos bancarios actuales.
  root.innerHTML = `
        <section
            class="transferencia-header"
        >
            <div>
                <span
                    class="dashboard-label"
                >
                    Operaciones bancarias
                </span>

                <h2>
                    Transferir dinero
                </h2>

                <p>
                    Realiza transferencias
                    entre cuentas registradas.
                </p>
            </div>


            <article
                class="saldo-disponible"
            >
                <span>
                    Saldo disponible
                </span>

                <strong
                    id="saldoActual"
                >
                    ${formatCurrency(cuentaPrincipal.saldo)}
                </strong>
            </article>
        </section>

        <section
            class="operaciones-grid"
        >

            <article
                class="transferencia-card"
            >

                <h3>
                    Nueva transferencia
                </h3>


                <form
                    id="formTransferencia"
                    novalidate
                >

                    <div
                        class="form-group"
                    >

                        <label
                            for="cuentaOrigen"
                        >
                            Cuenta origen
                        </label>


                        <select
                            id="cuentaOrigen"
                        >
                            <option
                                value=""
                            >
                                Selecciona una cuenta
                            </option>

                            ${cuentas
                              .map(
                                (cuenta) => `
                                        <option
                                            value="${cuenta.id}"
                                        >
                                            ${formatAccountNumber(
                                              cuenta.numeroCuenta,
                                            )}
                                            -
                                            ${formatCurrency(cuenta.saldo)}
                                        </option>
                                    `,
                              )
                              .join('')}
                        </select>

                    </div>

                    				
                    <div
                        class="form-group"
                    >
                        <label
                            for="cuentaDestino"
                        >
                            Número de cuenta destino
                        </label>

                        <input
                            id="cuentaDestino"
                            type="text"
                            placeholder="123456789012"
                            maxlength="14"
                        >
                    </div>


                    <div
                        class="form-group"
                    >
                        <label
                            for="montoTransferencia"
                        >
                            Monto
                        </label>

                        <input
                            id="montoTransferencia"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                        >
                    </div>


                    <div
                        class="form-group"
                    >
                        <label
                            for="descripcionTransferencia"
                        >
                            Descripción
                        </label>

                        <input
                            id="descripcionTransferencia"
                            type="text"
                            maxlength="80"
                            placeholder="Concepto de la transferencia"
                        >
                    </div>


                    <button
                        type="submit"
                        class="btn btn-primary"
                    >
                        Confirmar transferencia
                    </button>

                </form>

            </article>

            			
            <article
                class="transferencia-card"
            >

                <h3>
                    Depositar saldo
                </h3>

                <p
                    class="operation-help"
                >
                    Utiliza esta operación
                    para cargar saldo en tu
                    cuenta durante la práctica.
                </p>


                <form
                    id="formDeposito"
                    novalidate
                >

                    <div
                        class="form-group"
                    >
                        <label
                            for="cuentaDeposito"
                        >
                            Cuenta
                        </label>

                        <select
                            id="cuentaDeposito"
                        >

                            ${cuentas
                              .map(
                                (cuenta) => `
                                        <option
                                            value="${cuenta.id}"
                                        >
                                            ${formatAccountNumber(
                                              cuenta.numeroCuenta,
                                            )}
                                        </option>
                                    `,
                              )
                              .join('')}

                        </select>
                    </div>


                    <div
                        class="form-group"
                    >
                        <label
                            for="montoDeposito"
                        >
                            Monto
                        </label>

                        <input
                            id="montoDeposito"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                        >
                    </div>


                    <button
                        type="submit"
                        class="btn btn-secondary"
                    >
                        Realizar depósito
                    </button>

                </form>

            </article>

        </section>
    `;

  // Los formularios existen únicamente
  // después del innerHTML, por lo que
  // registramos los eventos en este punto.
  initEventosOperaciones(usuario);
}

/* =========================================
   EVENTOS DE OPERACIONES
========================================= */

function initEventosOperaciones(usuario) {
  // Recuperamos el formulario de transferencia.
  const formTransferencia = document.querySelector('#formTransferencia');

  // Recuperamos el formulario de depósito.
  const formDeposito = document.querySelector('#formDeposito');

  // Asociamos submit con manejarTransferencia()
  if (formTransferencia) {
    formTransferencia.addEventListener('submit', (event) =>
      manejarTransferencia(event, usuario),
    );
  }

  // Asociamos submit con manejarDeposito().
  if (formDeposito) {
    formDeposito.addEventListener('submit', (event) =>
      manejarDeposito(event, usuario),
    );
  }
}

/* =========================================
   DEPÓSITOS
========================================= */

function manejarDeposito(event, usuario) {
  // Evitamos el envío tradicional del formulario.
  event.preventDefault();

  // Recuperamos la cuenta seleccionada.
  const cuentaId = document.querySelector('#cuentaDeposito').value;

  // Recuperamos el monto escrito.
  const monto = document.querySelector('#montoDeposito').value;

  // Reutilizamos nuestro validador.
  if (!validarMonto(monto)) {
    Swal.fire({
      icon: 'warning',
      title: 'Monto inválido',
      text: 'El monto debe ser mayor a cero.',
    });

    return;
  }

  // Solicitamos el depósito
  try {
    bancoService.realizarDeposito({
      cuentaId,
      monto,
      descripcion: 'Depósito desde interfaz',
    });

    // Informamos el resultado.
    Swal.fire({
      icon: 'success',
      title: 'Depósito exitoso',
      text: `Se depositaron ${formatCurrency(monto)}.`,
    }).then(() => {
      // Recuperamos los saldos más recientes.
      recargarFormulario(usuario);
    });
  } catch (error) {
    // Presentamos cualquier error proveniente del dominio.
    Swal.fire({
      icon: 'error',
      title: 'No fue posible depositar',
      text: error.message,
    });
  }
}

/* =========================================
   TRANSFERENCIAS
========================================= */

function manejarTransferencia(event, usuario) {
  event.preventDefault();

  // Cuenta que enviará el dinero.
  const cuentaOrigenId = document.querySelector('#cuentaOrigen').value;

  // Número visible de la cuenta receptora
  const numeroCuentaDestino = document
    .querySelector('#cuentaDestino')
    .value.trim();

  // Cantidad a transferir.
  const monto = document.querySelector('#montoTransferencia').value;

  // Concepto opcional.
  const descripcion = document
    .querySelector('#descripcionTransferencia')
    .value.trim();

  // La cuenta origen es obligatoria.
  if (!validarCampoObligatorio(cuentaOrigenId)) {
    Swal.fire({
      icon: 'warning',
      title: 'Selecciona la cuenta origen',
    });

    return;
  }

  // Necesitamos conocer el número
  // de cuenta que recibirá el dinero.
  if (!validarCampoObligatorio(numeroCuentaDestino)) {
    Swal.fire({
      icon: 'warning',
      title: 'Ingresa la cuenta destino',
    });

    return;
  }

  // Validamos el monto antes de solicitar
  // la operación al servicio bancario.
  if (!validarMonto(monto)) {
    Swal.fire({
      icon: 'warning',
      title: 'Monto inválido',
      text: 'El monto debe ser mayor a cero.',
    });

    return;
  }

  // Antes de mover dinero mostramos los datos y pedimos confirmación.
  Swal.fire({
    icon: 'question',
    title: 'Confirmar transferencia',
    html: `
            <p>
                Estás por transferir
                <strong>
                    ${formatCurrency(monto)}
                </strong>
            </p>

            <p>
                Cuenta destino:
                <strong>
                    ${numeroCuentaDestino}
                </strong>
            </p>
        `,
    showCancelButton: true,
    confirmButtonText: 'Transferir',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    // Si cancela, no se realiza ninguna operación.
    if (!result.isConfirmed) {
      return;
    }

    try {
      // Solicitamos al servicio ejecutar la transferencia.
      bancoService.realizarTransferencia({
        cuentaOrigenId,
        numeroCuentaDestino,
        monto,
        descripcion,
      });

      // Confirmamos que terminó correctamente.
      Swal.fire({
        icon: 'success',
        title: 'Transferencia exitosa',
        text: `${formatCurrency(monto)} fueron transferidos correctamente.`,
      }).then(() => {
        // Actualizamos los saldos mostrados en pantalla
        recargarFormulario(usuario);
      });
    } catch (error) {
      // Convierte los errores del dominio en mensajes amigables.
      Swal.fire({
        icon: 'error',
        title: 'No fue posible realizar la transferencia',
        text: error.message,
      });
    }
  });
}

/* =========================================
   ACTUALIZACIÓN DE INTERFAZ
========================================= */

function recargarFormulario(usuario) {
  // Reconstruimos el Banco desde
  // LocalStorage para obtener los
  // saldos más recientes.
  bancoService.recargarBanco();

  // Recuperamos nuevamente las cuentas.
  const { cuentas } = bancoService.obtenerDatosUsuario(usuario.id);

  // Volvemos a construir la interfaz // con los nuevos valores.
  renderFormulario(usuario, cuentas);
}

/* =========================================
   INICIALIZACIÓN
========================================= */

function init() {
  // La página solo está disponible
  // para usuarios autenticados.
  const accesoPermitido = authService.protegerRuta();

  if (!accesoPermitido) {
    return;
  }

  // Inicializamos logout
  initLogout();

  // Recuperamos al usuario autenticado.
  const usuario = authService.getCurrentUser();

  if (!usuario) {
    return;
  }

  try {
    // Reconstruimos Banco.
    bancoService.recargarBanco();

    // Recuperamos sus cuentas.
    const { cuentas } = bancoService.obtenerDatosUsuario(usuario.id);

    // Generamos la interfaz.
    renderFormulario(usuario, cuentas);
  } catch (error) {
    // Controlamos errores durante la carga inicial.
    Swal.fire({
      icon: 'error',
      title: 'No fue posible cargar las operaciones',
      text: error.message,
    });
  }
}

// Ejecutamos únicamente cuando estamos dentro de transferencia.html.
if (document.querySelector('.app-transferencia')) {
  init();
}
