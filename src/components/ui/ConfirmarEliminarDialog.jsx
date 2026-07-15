import { Loader2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from './dialog'
import { Button } from './button'

/**
 * Dialog genérico de confirmación de eliminación.
 *
 * @param {object}      props
 * @param {boolean}     props.open          - Controla visibilidad
 * @param {function}    props.onOpenChange  - Callback de cambio de estado
 * @param {ReactNode}   props.icon          - Icono renderizado dentro del círculo rojo
 * @param {string}      props.title         - Título del dialog
 * @param {ReactNode}   props.description   - Descripción (acepta JSX)
 * @param {boolean}     [props.loading]     - Muestra spinner en el botón de confirmar
 * @param {string}      [props.confirmLabel]- Texto del botón confirmar (default: "Eliminar")
 * @param {function}    props.onConfirm     - Callback al confirmar
 * @param {function}    props.onCancel      - Callback al cancelar
 */
export const ConfirmarEliminarDialog = ({
  open,
  onOpenChange,
  icon,
  title,
  description,
  loading = false,
  confirmLabel = 'Eliminar',
  onConfirm,
  onCancel,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-sm rounded-[24px] p-6">
      <DialogHeader>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          {icon}
        </div>
        <DialogTitle className="text-center text-xl">{title}</DialogTitle>
        <DialogDescription className="pt-2 text-center">{description}</DialogDescription>
      </DialogHeader>

      <DialogFooter className="mt-4 gap-3">
        <Button
          variant="outline"
          className="flex-1 rounded-xl"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          variant="destructive"
          className="flex-1 gap-2 rounded-xl"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? 'Eliminando...' : confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
