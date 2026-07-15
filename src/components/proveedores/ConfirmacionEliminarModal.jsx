import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'

export const ConfirmacionEliminarModal = ({ open, confirmEliminar, pedidosPorProveedor, onConfirmar, onCancelar, eliminando }) => {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancelar()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <Trash2 size={18} />
            {confirmEliminar?.tipo === 'proveedor' ? 'Eliminar Proveedor' : 'Eliminar Pedido'}
          </DialogTitle>
          <DialogDescription className="pt-1">
            {confirmEliminar?.tipo === 'proveedor' ? (
              <>
                Estás a punto de eliminar al proveedor{' '}
                <span className="font-semibold text-foreground">"{confirmEliminar?.item?.nombre}"</span>.
                {(confirmEliminar?.item?.id && pedidosPorProveedor[confirmEliminar.item.id] > 0) && (
                  <span className="mt-2 flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-amber-400">
                    <AlertTriangle size={13} /> Este proveedor tiene pedidos pendientes. Elimínalo solo si estás seguro.
                  </span>
                )}
              </>
            ) : (
              <>
                Estás a punto de eliminar el pedido{' '}
                <span className="font-semibold text-foreground">"{confirmEliminar?.item?.descripcion}"</span>.
                Esta acción no se puede deshacer.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onCancelar} className="rounded-xl" disabled={eliminando}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirmar}
            disabled={eliminando}
            className="gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white"
          >
            {eliminando ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
