/**
 * FieldError — Mensaje de error inline debajo de un campo de formulario.
 * FieldInput — Input con borde rojo cuando hay error.
 * FieldSelect — SelectTrigger con borde rojo cuando hay error.
 */

import { cn } from '#/lib/utils'
import { AlertCircle } from 'lucide-react'
import { Input } from './input'
import { Textarea } from './textarea'
import { SelectTrigger } from './select'

/** Mensaje de error debajo del campo */
export function FieldError({ error, className }) {
  if (!error) return null
  return (
    <p className={cn('flex items-center gap-1.5 text-xs font-medium text-red-500 mt-1', className)}>
      <AlertCircle size={12} className="shrink-0" />
      {error}
    </p>
  )
}

/** Input que se pone en rojo cuando hay error */
export function FieldInput({ error, className, ...props }) {
  return (
    <Input
      className={cn(
        className,
        error && 'border-red-500/70 bg-red-500/5 focus-visible:ring-red-500/30 placeholder:text-red-400/40'
      )}
      {...props}
    />
  )
}

/** Textarea que se pone en rojo cuando hay error */
export function FieldTextarea({ error, className, ...props }) {
  return (
    <Textarea
      className={cn(
        className,
        error && 'border-red-500/70 bg-red-500/5 focus-visible:ring-red-500/30'
      )}
      {...props}
    />
  )
}

/** SelectTrigger que se pone en rojo cuando hay error */
export function FieldSelect({ error, className, ...props }) {
  return (
    <SelectTrigger
      className={cn(
        className,
        error && 'border-red-500/70 bg-red-500/5 focus:ring-red-500/30'
      )}
      {...props}
    />
  )
}
