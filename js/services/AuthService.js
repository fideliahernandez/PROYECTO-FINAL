// IMPORTAR STORAGE SERVICE
import { STORAGE_KEYS, storageService } from './StorageService.js';

// SERVICIO DE AUTENTICACIÓN
class AuthService {
  // METODO INICIAR SESION: recuperamos todos los usuarios registrados
  login(email, password) {
    const usuarios = storageService.obtener(STORAGE_KEYS.USUARIOS, []);

    // NORMALIZAR CORREO: convertimos el valor a string, eliminamos espacios y transformamos el correo a minusculas
    const emailNormalizado = String(email).trim().toLocaleLowerCase();

    // BUSCAR USUARIO: find() devuelve el primer usuario que cumpla con: mismo correo, misma contraseña, usuario activo
    const usuario = usuarios.find(
      (u) =>
        u.email.toLocaleLowerCase() === emailNormalizado &&
        u.password === password &&
        u.activo !== false,
    );

    // CREDENCIALES INCORRECTAS: si find no encontro usuario, error
    if (!usuario) {
      throw new Error('Correo o contraseña incorrectos. ');
    }

    // CERRAR SESIÓN: La sesion solamente necesita saber: que usuario inicio sesion, cuando inicio sesion
    const sesion = {
      usuarioId: usuario.id,
      fechaInicio: new Date().toISOString(),
    };

    // GUARDAR SESION CON STORAGE SERVICE
    storageService.guardar(STORAGE_KEYS.SESION, sesion);

    // DEVOLVEMOS EL USUARIO
    return usuario;
  }

  // METODO CERRAR SESION
  logout() {
    storageService.eliminar(STORAGE_KEYS.SESION);
  }

  //OBTENER USUARIO ACTUAL
  getCurrentUser() {
    // Recuperar sesion
    const sesion = storageService.obtener(STORAGE_KEYS.SESION, null);

    // Validamos la sesion
    if (!sesion) {
      return null;
    }

    // RECUPERAMOS LOS USUARIOS
    const usuarios = storageService.obtener(STORAGE_KEYS.USUARIOS, []);

    // BUSCAMOS EL USUARIO DE LA SESION
    return usuarios.find((usuario) => usuario.id === sesion.usuarioId) || null;
  }

  // PROTEGER RUTA
  protegerRuta() {
    // OBTENER USUARIO AUTENTICADO
    const usuario = this.getCurrentUser();

    // Si no existe usuario autenticado, regresa al index.html
    if (!usuario) {
      window.location.href = 'index.html';

      return false;
    }

    return true;
  }
}

export const authService = new AuthService();
