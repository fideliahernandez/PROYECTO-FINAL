# Sistema de Gestión Bancaria

Proyecto integrador correspondiente al Módulo 4.

El objetivo es desarrollar progresivamente un sistema bancario utilizando JavaScript moderno, arquitectura modular, programación orientada a objetos y programación funcional.

## Tecnologías

- HTML5
- CSS3
- JavaScript
- ECMAScript Modules
- Node.js
- npm
- Git
- GitHub

## Arquitectura

El proyecto utilizará las siguientes capas:

- Models
- Services
- UI
- Utils
- Tests

## Modelos disponibles

### Usuario

Representa a una persona registrada dentro del sistema.

Propiedades principales:

- `id`
- `nombre`
- `email`
- `telefono`
- `password`
- `activo`

### Cuenta

Representa una cuenta bancaria perteneciente a un usuario.

Propiedades principales:

- `id`
- `numeroCuenta`
- `tipo`
- `saldo`
- `usuarioId`
- `fechaApertura`
- `activa`

Métodos disponibles:

- `depositar()`
- `retirar()`

### Movimiento

Representa una operación registrada sobre una cuenta.

Propiedades principales:

- `id`
- `tipo`
- `monto`
- `descripcion`
- `cuentaOrigen`
- `cuentaDestino`
- `saldoResultante`
- `fecha`

### Banco

- agregarUsuario()
- buscarUsuarioPorId()

- agregarCuenta()
- buscarCuentaPorId()
- buscarCuentaPorNumero()
- obtenerCuentasDeUsuario()

- registrarMovimiento()
- obtenerMovimientosDeCuenta()

- realizarDeposito()

### StorageService.js

- LocalStorage
- JSON.stringify()
- JSON.parse()
- STORAGE_KEYS

## Funcionalidades previstas

Durante las siguientes versiones se desarrollarán:

- Registro de usuarios.
- Inicio de sesión.
- Gestión de cuentas.
- Depósitos.
- Transferencias.
- Historial de movimientos.
- Persistencia con LocalStorage.
- Manipulación del DOM.
- Manejo de eventos.
- Validaciones.
- Formateadores.
- Librerías visuales.
- Pruebas automatizadas con Jest.
- Git y GitHub.

## Versión actual

v0.5.0 — Persistencia con LocalStorage y StorageService
