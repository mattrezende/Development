import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { formatCurrencyBRL, formatDateBR } from "@/lib/format"
import type { Order } from "@/lib/types/entities"

export function OrderHistoryTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhum pedido encontrado para este cliente.</p>
  }

  return (
    <div className="overflow-x-auto rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entrega</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{formatDateBR(order.delivery_date)}</TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell>{formatCurrencyBRL(order.total_amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
