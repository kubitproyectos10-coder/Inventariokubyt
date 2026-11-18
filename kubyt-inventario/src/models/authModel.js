/**
 * MODELO · Autenticación
 * Habla con Firebase Authentication y traduce los errores a mensajes en español.
 */
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const login = (email, password) => signInWithEmailAndPassword(auth, email.trim(), password);

export const logout = () => signOut(auth);

export const resetPassword = (email) => sendPasswordResetEmail(auth, email.trim());

/** Se suscribe a los cambios de sesión. Devuelve la función para cancelar. */
export const watchSession = (callback) => onAuthStateChanged(auth, callback);

const messages = {
  'auth/invalid-email': 'El correo no tiene un formato válido.',
  'auth/missing-password': 'Escribe tu contraseña.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'Correo o contraseña incorrectos.',
  'auth/user-disabled': 'Esta cuenta está desactivada.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  'auth/network-request-failed': 'Sin conexión. Revisa tu internet.',
};

export const authErrorMessage = (error) =>
  messages[error?.code] || 'No pudimos iniciar sesión. Inténtalo de nuevo.';
