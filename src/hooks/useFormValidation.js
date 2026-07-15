/**
 * useFormValidation
 * Hook centralizado de validaciones de formularios.
 * Devuelve errores por campo + helpers para validar antes de submit.
 */

import { useState, useCallback } from 'react'

/* ── Reglas reutilizables ─────────────────────────────────── */
export const rules = {
  required:    (v) => (!v || !String(v).trim()) ? 'Este campo es obligatorio' : null,
  email:       (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? 'Ingresa un email válido (ej. correo@ejemplo.com)' : null,
  minLen:      (n) => (v) => v && v.trim().length < n ? `Mínimo ${n} caracteres` : null,
  maxLen:      (n) => (v) => v && v.trim().length > n ? `Máximo ${n} caracteres` : null,
  positiveNum: (v) => (!v || isNaN(Number(v)) || Number(v) <= 0) ? 'Debe ser un número mayor a cero' : null,
  nonNegNum:   (v) => (v === '' || v === null || v === undefined || isNaN(Number(v)) || Number(v) < 0) ? 'Debe ser un número mayor o igual a cero' : null,
  phone:       (v) => v && !/^[\d\s\-+().]{7,20}$/.test(v.trim()) ? 'Número de teléfono inválido' : null,
  sku:         (v) => v && !/^[a-zA-Z0-9\-_]{1,50}$/.test(v.trim()) ? 'SKU solo puede contener letras, números, guiones y guiones bajos' : null,
  noSpaces:    (v) => v && /\s/.test(v) ? 'No se permiten espacios' : null,
  username:    (v) => v && !/^[a-zA-Z0-9._\-]{3,50}$/.test(v.trim()) ? 'Usuario: 3-50 caracteres, sin espacios (letras, números, puntos, guiones)' : null,
  password:    (v) => !v || v.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : null,
}

/* ── Esquemas por formulario ─────────────────────────────── */
export const schemas = {
  /** Login */
  login: {
    username: [rules.required],
    password: [rules.required],
  },

  /** Crear/editar producto */
  producto: {
    nombre:     [rules.required, rules.minLen(2), rules.maxLen(100)],
    precio:     [rules.required, rules.positiveNum],
    stock:      [rules.nonNegNum],
    stockMinimo:[rules.nonNegNum],
    sku:        [rules.sku],
  },

  /** Crear/editar proveedor */
  proveedor: {
    nombre:   [rules.required, rules.minLen(2), rules.maxLen(100)],
    email:    [rules.email],
    telefono: [rules.phone],
  },

  /** Crear pedido */
  pedido: {
    descripcion: [rules.required, rules.minLen(3)],
    cantidad:    [rules.required, rules.positiveNum],
    proveedorId: [(v) => (!v || v === '') ? 'Selecciona un proveedor' : null],
  },

  /** Registrar movimiento de stock */
  movimiento: {
    productoId: [(v) => (!v || v === '') ? 'Selecciona un producto' : null],
    cantidad:   [rules.required, rules.positiveNum],
  },

  /** Movimiento tipo AJUSTE (stock puede ser 0) */
  movimientoAjuste: {
    productoId: [(v) => (!v || v === '') ? 'Selecciona un producto' : null],
    cantidad:   [rules.nonNegNum],
  },

  /** Crear usuario */
  usuario: {
    email:    [rules.required, rules.email],
    password: [rules.required, rules.password],
    nombre:   [rules.required, rules.minLen(2)],
  },

  /** Crear negocio */
  negocio: {
    nombre: [rules.required, rules.minLen(2), rules.maxLen(80)],
  },

  /** Crear categoría */
  categoria: {
    nombre: [rules.required, rules.minLen(2), rules.maxLen(60)],
  },

  /** Nuevo producto rápido (recepción de pedido) */
  productoRapido: {
    nombre: [rules.required, rules.minLen(2)],
    precio: [rules.required, rules.positiveNum],
    stock:  [rules.nonNegNum],
  },
}

/* ── Hook principal ──────────────────────────────────────── */
export function useFormValidation(schema = {}) {
  const [errors, setErrors] = useState({})

  /** Valida un solo campo y devuelve el primer error encontrado o null */
  const validateField = useCallback((field, value) => {
    const fieldRules = schema[field]
    if (!fieldRules) return null
    for (const rule of fieldRules) {
      const error = rule(value)
      if (error) return error
    }
    return null
  }, [schema])

  /** Valida todos los campos del objeto `data` según el schema */
  const validate = useCallback((data) => {
    const newErrors = {}
    for (const field of Object.keys(schema)) {
      const error = validateField(field, data[field])
      if (error) newErrors[field] = error
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [schema, validateField])

  /** Actualiza el error de un campo mientras el usuario escribe */
  const touchField = useCallback((field, value) => {
    const error = validateField(field, value)
    setErrors(prev => {
      if (!error && !prev[field]) return prev // sin cambio
      return { ...prev, [field]: error || undefined }
    })
  }, [validateField])

  /** Limpia todos los errores */
  const clearErrors = useCallback(() => setErrors({}), [])

  /** Limpia el error de un campo específico */
  const clearField = useCallback((field) => {
    setErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  return { errors, validate, touchField, clearErrors, clearField }
}
