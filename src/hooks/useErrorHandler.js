import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook para manejo consistente de errores HTTP en toda la aplicación.
 * Normaliza los mensajes de error del backend y proporciona feedback claro al usuario.
 * 
 * @returns {Object} Funciones para manejar errores
 */
export function useErrorHandler() {
  /**
   * Maneja errores HTTP y muestra toast apropiado según el status code
   * @param {Error} err - Error capturado del backend
   * @param {Object} options - Configuración de mensajes personalizados
   */
  const handleError = useCallback((err, options = {}) => {
    const {
      operation = 'realizar la operación',
      conflictMsg = 'Ya existe un registro con esos datos',
      validationMsg = 'Verifica los datos ingresados e intenta de nuevo',
      forbiddenMsg = 'No tienes permiso para realizar esta acción',
      notFoundMsg = 'El recurso solicitado no fue encontrado',
      insufficientMsg = 'Stock insuficiente para completar la operación',
    } = options;

    // fetchApi pone el status en err.status (no en err.response.status como Axios)
    const status = err?.status ?? err?.response?.status;

    // Log para debugging (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.error(`[Error ${status || 'NETWORK'}]:`, err);
    }

    switch (status) {
      case 400:
        toast.error(err.message || validationMsg);
        break;
      case 401:
        toast.error('Tu sesión expiró. Inicia sesión nuevamente');
        break;
      case 403:
        toast.error(forbiddenMsg);
        break;
      case 404:
        toast.error(notFoundMsg);
        break;
      case 409:
        toast.error(conflictMsg);
        break;
      case 422:
        toast.error(insufficientMsg);
        break;
      case 500:
        toast.error('Error interno del servidor. Contacta al administrador si el problema persiste');
        break;
      case 503:
        toast.error('El servicio no está disponible. Intenta más tarde');
        break;
      default:
        // Si el error tiene mensaje del backend, mostrarlo
        if (err?.message && !err.message.startsWith('Error ')) {
          toast.error(err.message);
        } else {
          toast.error(`No se pudo ${operation}. Intenta de nuevo`);
        }
    }
  }, []);

  /**
   * Wrapper para operaciones async que maneja errores automáticamente
   * @param {Function} operation - Función async a ejecutar
   * @param {Object} errorOptions - Opciones de manejo de error
   * @returns {Promise} Resultado de la operación o undefined si falla
   */
  const withErrorHandling = useCallback(async (operation, errorOptions) => {
    try {
      return await operation();
    } catch (err) {
      handleError(err, errorOptions);
      return undefined;
    }
  }, [handleError]);

  return {
    handleError,
    withErrorHandling,
  };
}
