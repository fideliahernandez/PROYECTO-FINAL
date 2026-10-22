// CLAVES DE ALMACENAMIENTO

export const STORAGE_KEYS = {
  USUARIOS: 'usuarios',
  CUENTAS: 'cuentas',
  MOVIMIENTOS: 'movimientos',
  SESION: 'sesion',
};

class StorageService {
  guardar(clave, valor) {
    const valorJSON = JSON.stringify(valor);

    // Guardamos el JSON en el localStorage
    localStorage.setItem(clave, valorJSON);
  }

  // OBTENER INFORMACION
  obtener(clave, valorPordefecto = null) {
    // getItem decuelve el contenido
    const valor = localStorage.getItem(clave);

    // VALIDAR SI EXISTE INFORMACIÓN
    if (valor === null) {
      return valorPordefecto;
    }

    // CONVERTIMOS A JSON
    try {
      return JSON.parse(valor);
    } catch (error) {
      console.log(
        `No fue posible leer la clave ${clave} de LocalStorage `,
        error,
      );
      return valorPordefecto;
    }
  }

  // METODO ELIMINAR
  eliminar(clave) {
    localStorage.removeItem(clave);
  }

  // METODO LIMPIAR LOCALSTORAGE
  limpiar() {
    localStorage.clear();
  }
}

export const storageService = new StorageService();
