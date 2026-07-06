import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { actualizarNegocio } from '../services/negocioService';
import { subirLogoNegocio } from '../services/uploadService';
import { useErrorHandler } from './useErrorHandler';

/**
 * Hook para gestionar el formulario de negocio en ConfiguracionDashboard.
 * Maneja edición de datos del negocio y subida de logo.
 * 
 * @param {Object} negocioActual - Datos del negocio actual
 * @param {Function} onSuccess - Callback después de guardar exitosamente
 * @returns {Object} Estado y funciones del formulario de negocio
 */
export function useNegocioForm(negocioActual, onSuccess) {
  const [formNegocio, setFormNegocio] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    logoUrl: '',
  });
  const [savingNegocio, setSavingNegocio] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const { handleError } = useErrorHandler();

  // Cargar datos del negocio en el formulario
  const cargarDatosNegocio = useCallback((negocio) => {
    if (!negocio) return;
    setFormNegocio({
      nombre: negocio.nombre || '',
      direccion: negocio.direccion || '',
      telefono: negocio.telefono || '',
      logoUrl: negocio.logoUrl || '',
    });
  }, []);

  // Actualizar campo del formulario
  const updateField = useCallback((field, value) => {
    setFormNegocio(prev => ({ ...prev, [field]: value }));
  }, []);

  // Guardar cambios del negocio
  const handleGuardarNegocio = useCallback(async () => {
    if (!negocioActual?.id) {
      toast.error('Selecciona un negocio primero');
      return false;
    }

    if (!formNegocio.nombre?.trim()) {
      toast.error('El nombre del negocio es obligatorio');
      return false;
    }

    setSavingNegocio(true);
    try {
      await actualizarNegocio(negocioActual.id, {
        nombre: formNegocio.nombre.trim(),
        direccion: formNegocio.direccion?.trim() || undefined,
        telefono: formNegocio.telefono?.trim() || undefined,
        logoUrl: formNegocio.logoUrl || undefined,
      });
      toast.success('Datos del negocio actualizados');
      onSuccess?.();
      return true;
    } catch (err) {
      handleError(err, {
        operation: 'actualizar los datos del negocio',
        conflictMsg: 'Ya existe otro negocio con ese nombre',
        forbiddenMsg: 'No tienes permiso para editar este negocio',
      });
      return false;
    } finally {
      setSavingNegocio(false);
    }
  }, [negocioActual, formNegocio, onSuccess, handleError]);

  // Subir logo del negocio
  const handleSubirLogo = useCallback(async (archivo) => {
    if (!archivo) return false;

    // Validación de tamaño (5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      toast.error('El logo no puede superar 5MB');
      return false;
    }

    // Validación de tipo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!tiposPermitidos.includes(archivo.type)) {
      toast.error('Solo se permiten imágenes JPG, PNG, GIF o WebP');
      return false;
    }

    setUploadingLogo(true);
    try {
      const { url } = await subirLogoNegocio(archivo);
      setFormNegocio(prev => ({ ...prev, logoUrl: url }));
      toast.success('Logo subido correctamente');
      return true;
    } catch (err) {
      handleError(err, {
        operation: 'subir el logo',
        validationMsg: 'El archivo no es válido o está corrupto',
        forbiddenMsg: 'No tienes permiso para subir logos',
      });
      return false;
    } finally {
      setUploadingLogo(false);
    }
  }, [handleError]);

  return {
    formNegocio,
    savingNegocio,
    uploadingLogo,
    cargarDatosNegocio,
    updateField,
    handleGuardarNegocio,
    handleSubirLogo,
  };
}
