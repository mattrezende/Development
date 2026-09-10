"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { OrderStatus } from "@/lib/types/entities"

interface StatusTransitionButtonsProps {
  status: OrderStatus
  onTransition: (next: OrderStatus) => Promise<void> | void
}

export function StatusTransitionButtons({ status, onTransition }: StatusTransitionButtonsProps) {
  const [submitting, setSubmitting] = useState(false)

  async function handle(next: OrderStatus) {
    setSubmitting(true)
    try {
      await onTransition(next)
    } finally {
      setSubmitting(false)
    }
  }

  const cancelable = status === "rascunho" || status === "confirmado"

  return (
    <div className="flex flex-wrap gap-2">
      {status === "rascunho" && (
        <Button size="sm" disabled={submitting} onClick={() => handle("confirmado")}>
          Confirmar pedido
        </Button>
      )}
      {status === "em_producao" && (
        <Button size="sm" disabled={submitting} onClick={() => handle("entregue")}>
          Marcar como entregue
        </Button>
      )}
      {status === "entregue" && (
        <Button size="sm" disabled={submitting} onClick={() => handle("faturado")}>
          Faturar pedido
        </Button>
      )}
      {cancelable && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="outline" disabled={submitting}>
              Cancelar pedido
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar este pedido?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O pedido não entrará na próxima remessa de produção.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction onClick={() => handle("cancelado")}>Cancelar pedido</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
