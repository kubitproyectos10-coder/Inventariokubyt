/**
 * MODELO · Usuarios y roles
 * Cada persona con acceso tiene un documento en `usuarios/{uid}` con su rol.
 * Roles previstos: 'admin' (todo) · más adelante 'ventas', 'produccion'…
 */
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const ROLES = {
  admin: { label: 'Administradora', can: ['*'] },
};

/** Lee el perfil del usuario. Devuelve null si no está dado de alta. */
export async function getProfile(uid) {
  const snap = await getDoc(doc(db, 'usuarios', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Regla de negocio: ¿el perfil puede usar un módulo? */
export function canAccess(profile, moduleId) {
  const role = ROLES[profile?.rol];
  if (!role) return false;
  return role.can.includes('*') || role.can.includes(moduleId);
}

export const roleLabel = (profile) => ROLES[profile?.rol]?.label ?? 'Sin rol';
