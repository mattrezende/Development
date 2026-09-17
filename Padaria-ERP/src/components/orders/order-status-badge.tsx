import { Badge } from "@/components/ui/badge"
import type { OrderStatus } from "@/lib/types/entities"

export const orderStatusLabel: Record<OrderStatus, string> = {
  rascunho: "Rascunho",
  confirmado: "Confirmado",
  em_producao: "Em produção",
  entregue: "Entregue",
  faturado: "Faturado",
  cancelado: "Cancelado",
}

export const orderStatusVariant: Record<OrderStatus, "success" | "destructive" | "outline"> = {
  rascunho: "outline",
  confirmado: "outline",
  em_producao: "outline",
  entregue: "success",
  faturado: "success",
  cancelado: "destructive",
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={orderStatusVariant[status]}>{orderStatusLabel[status]}</Badge>
}
