/** CONTROLADOR · Ajustes del negocio */
import { useEffect, useState } from 'react';
import { costoHoraImpresora, guardarAjustes, mesActual, mesesAtras } from '../models';
import { useData } from './DataController';
import { useUI } from './UIController';

const n = (v) => Number(v) || 0;

export function useAjustesController() {
  const data = useData();
  const { toast } = useUI();
  const [values, setValues] = useState(data.ajustes);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) setValues(data.ajustes);
  }, [data.ajustes, dirty]);

  const bind = (f) => (e) => {
    setValues((v) => ({ ...v, [f]: e.target.value }));
    setDirty(true);
  };

  // Ayudas: promedio real de los últimos 3 meses
  const ultimos = mesesAtras(mesActual(), 3);
  const unidadesProm =
    ultimos.reduce((s, m) => s + data.producciones.filter((p) => p.fecha?.startsWith(m)).reduce((t, p) => t + n(p.cantidadOk), 0), 0) / 3;

  const usarPromedios = () => {
    setValues((v) => ({ ...v, unidadesEstimadasMes: Math.round(unidadesProm) }));
    setDirty(true);
  };

  const adminMes = data.adminMensual.promedio;
  const adminUnidad = n(values.unidadesEstimadasMes) > 0 ? adminMes / n(values.unidadesEstimadasMes) : 0;

  const costoHora = costoHoraImpresora(values);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await guardarAjustes({
        valorHoraManoObra: n(values.valorHoraManoObra),
        unidadesEstimadasMes: n(values.unidadesEstimadasMes),
        potenciaImpresoraW: n(values.potenciaImpresoraW),
        precioKwh: n(values.precioKwh),
        desgasteHora: n(values.desgasteHora),
        porcentajeFallos: Math.min(Math.max(n(values.porcentajeFallos), 0), 90),
        margenObjetivo: Math.min(Math.max(n(values.margenObjetivo), 0), 95),
        moneda: 'COP',
      });
      setDirty(false);
      toast('Ajustes guardados');
    } catch (err) {
      toast(err.message || 'No se pudo guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  return { values, bind, save, saving, dirty, adminMes, adminInfo: data.adminMensual, unidadesProm, usarPromedios, adminUnidad, costoHora };
}
