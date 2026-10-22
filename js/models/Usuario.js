// IMPORTAR UTILIDADES
import { generarId } from '../utils/helpers.js';

// MODELO O CLASE USUARIO
// lA CLASE USUARIO ES UN MOLDE PARA REPRESAR LAS PERSIONAS REGISTRADAS EN EL SISTEMA BANCARIO

export class Usuario {
  constructor({
    id = generarId(),
    nombre,
    email,
    telefono,
    password,
    activo = true,
  }) {
    // ASIGNR O INSTANCIAR PROPIEDADES DEL USUARIO
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.telefono = telefono;
    this.password = password;
    this.activo = activo;
  }
}
