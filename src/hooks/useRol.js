import { getRol } from '../services/config';

/**
 * Hook para verificar el rol del usuario autenticado.
 * El rol viene del localStorage, guardado tras el login.
 *
 * Uso:
 *   const { isAdmin, isEmpleado, isSuperAdmin, rol } = useRol()
 *   {isAdmin && <Button>Eliminar</Button>}
 *   {isSuperAdmin && <Button>Panel Super Admin</Button>}
 */
export function useRol() {
  const rol = getRol() || 'EMPLEADO'; // fallback seguro
  return {
    rol,
    isSuperAdmin: rol === 'SUPER_ADMIN',
    isAdmin:      rol === 'ADMIN' || rol === 'SUPER_ADMIN', // SUPER_ADMIN tiene todos los permisos de ADMIN
    isEmpleado:   rol === 'EMPLEADO',
  };
}
