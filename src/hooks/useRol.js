import { getRol } from '../services/config';

/**
 * Hook para verificar el rol del usuario autenticado.
 * El rol viene del localStorage, guardado tras el login.
 *
 * Uso:
 *   const { isAdmin, isEmpleado, rol } = useRol()
 *   {isAdmin && <Button>Eliminar</Button>}
 */
export function useRol() {
  const rol = getRol() || 'EMPLEADO'; // fallback seguro
  return {
    rol,
    isAdmin:    rol === 'ADMIN',
    isEmpleado: rol === 'EMPLEADO',
  };
}
