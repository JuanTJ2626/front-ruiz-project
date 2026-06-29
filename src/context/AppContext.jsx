import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProductos } from '../services/productoService';
import { getCategorias } from '../services/categoriaService';
import { getDashboard } from '../services/dashboardService';
import { getNegociosUsuario, crearNegocio } from '../services/negocioService';
import { getNegocioId, getUsuarioId } from '../services/config';
import { toast } from 'sonner';

const AppCtx = createContext(null);

export function AppProvider({ children, isAuthenticated }) {
  const [productos,   setProductos]   = useState([]);
  const [categorias,  setCategorias]  = useState([]);
  const [negocios,    setNegocios]    = useState([]);
  const [dashData,    setDashData]    = useState(null);
  const [negocioActivo, setNegocioActivo] = useState(Number(getNegocioId()) || null);
  const [loading,     setLoading]     = useState(false);

  /* ── Carga todos los datos del negocio activo ── */
  const recargar = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [prods, cats, dash] = await Promise.allSettled([
        getProductos(),
        getCategorias(),
        getDashboard(),
      ]);
      if (prods.status === 'fulfilled')  setProductos(Array.isArray(prods.value)  ? prods.value  : []);
      if (cats.status  === 'fulfilled')  setCategorias(Array.isArray(cats.value)  ? cats.value   : []);
      if (dash.status  === 'fulfilled')  setDashData(dash.value);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [isAuthenticated]);

  /* ── Carga los negocios del usuario ── */
  const cargarNegocios = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await getNegociosUsuario();
      setNegocios(Array.isArray(data) ? data : []);
    } catch { /* silencioso */ }
  }, [isAuthenticated]);

  /* Al autenticarse, carga todo */
  useEffect(() => {
    if (isAuthenticated) {
      recargar();
      cargarNegocios();
    }
  }, [isAuthenticated, recargar, cargarNegocios]);

  /* ── Cambiar de negocio activo ── */
  const cambiarNegocio = useCallback((nuevoId) => {
    localStorage.setItem('negocioId', String(nuevoId));
    setNegocioActivo(nuevoId);
    // recargar datos del nuevo negocio
    setTimeout(() => recargar(), 50);
    toast.success('Negocio cambiado');
  }, [recargar]);

  /* ── Crear nuevo negocio ── */
  const handleCrearNegocio = useCallback(async (datos) => {
    const data = await crearNegocio(datos);
    await cargarNegocios();
    return data;
  }, [cargarNegocios]);

  return (
    <AppCtx.Provider value={{
      productos, categorias, negocios, dashData,
      negocioActivo, loading,
      recargar, cambiarNegocio, handleCrearNegocio,
    }}>
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
};
