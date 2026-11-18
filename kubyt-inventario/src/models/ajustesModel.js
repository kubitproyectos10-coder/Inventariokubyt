/**
 * MODELO · Ajustes del negocio (un solo documento: ajustes/general)
 */
import { COL, save } from './repository';

export const AJUSTES_ID = 'general';

export const AJUSTES_DEFAULT = {
  valorHoraManoObra: 0, // COP por hora de trabajo
  gastosAdminEstimadosMes: 0, // se calcula solo desde el módulo Gastos (no se guarda aquí)
  unidadesEstimadasMes: 0, // unidades que esperan producir al mes
  potenciaImpresoraW: 0, // vatios que consume la impresora imprimiendo
  precioKwh: 0, // COP por kWh (recibo de luz)
  desgasteHora: 0, // COP por hora: boquillas, camas, correas, repuestos
  porcentajeFallos: 0, // % de piezas que salen mal
  margenObjetivo: 40, // % para el precio sugerido
  moneda: 'COP',
};

export const guardarAjustes = (data) => save(COL.ajustes, AJUSTES_ID, data);
