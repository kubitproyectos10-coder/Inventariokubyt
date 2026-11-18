/**
 * MODELO · Acceso a Firestore (repositorio genérico)
 * Todas las lecturas/escrituras pasan por aquí. Si algún día cambian de base de datos,
 * se reescribe este archivo y el resto de la app sigue igual.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  runTransaction,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const COL = {
  insumos: 'insumos',
  compras: 'comprasInsumo',
  productos: 'productos',
  categorias: 'categorias',
  producciones: 'producciones',
  ventas: 'ventas',
  gastos: 'gastos',
  aportes: 'aportes',
  ajustes: 'ajustes',
};

const withId = (d) => ({ id: d.id, ...d.data() });
const stamp = (data) => ({ ...data, actualizado: Date.now() });

/** Escucha una colección en tiempo real. Devuelve la función para dejar de escuchar. */
export const subscribe = (name, cb, onError) =>
  onSnapshot(collection(db, name), (snap) => cb(snap.docs.map(withId)), onError);

/** Escucha un documento en tiempo real (null si no existe). */
export const subscribeDoc = (name, id, cb, onError) =>
  onSnapshot(doc(db, name, id), (s) => cb(s.exists() ? withId(s) : null), onError);

export const create = (name, data) => addDoc(collection(db, name), { ...stamp(data), creado: Date.now() });
export const update = (name, id, data) => updateDoc(doc(db, name, id), stamp(data));
export const remove = (name, id) => deleteDoc(doc(db, name, id));
export const save = (name, id, data) => setDoc(doc(db, name, id), stamp(data), { merge: true });

/** Referencias para usar dentro de transacciones. */
export const ref = (name, id) => doc(db, name, id);
export const newRef = (name) => doc(collection(db, name));

/** Transacción: todo se guarda o nada se guarda (para movimientos de stock). */
export const transaction = (fn) => runTransaction(db, fn);

/** Fecha de hoy en formato AAAA-MM-DD (hora local). */
export const today = () => new Date().toLocaleDateString('en-CA');
