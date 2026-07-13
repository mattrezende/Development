"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { StatusTransitionButtons } from "@/components/orders/status-transition-buttons"
import { ordersRepo } from "@/lib/repositories/orders.repo"
import { customersRepo } from "@/lib/repositories/customers.repo"
import { productsRepo } from "@/lib/repositories/products.repo"
import { financeiroRepo } from "@/lib/repositories/financeiro.repo"
import { formatCurrencyBRL, formatDateBR } from "@/lib/format"
import type { Customer, Order, OrderItem, OrderStatus, Product } from "@/lib/types/entities"

export default function PedidoDetalhePage() {
  const params = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null | undefined>(undefined)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const load = useCallback(async () => {
    const foundOrder = await ordersRepo.get(params.id)
    setOrder(foundOrder)
    if (foundOrder) {
      const [foundCustomer, orderItems, allProducts] = await Promise.all([
        customersRepo.get(foundOrder.customer_id),
        ordersRepo.listItems(foundOrder.id),
        productsRepo.list(),
      ])
      setCustomer(foundCustomer)
      setItems(orderItems)
      setProducts(allProducts)
    }
  }, [params.id])

  useEffect(() => {
    load()
  }, [load])

  async function handleTransition(next: OrderStatus) {
    try {
      const updated = await ordersRepo.updateStatus(params.id, next)
      if (next === "faturado" && customer) {
        await financeiroRepo.generateReceivable(updated, customer)
        toast.success("Pedido faturado — conta a receber gerada")
      } else {
        toast.success("Status do pedido atualizado")
      }
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar status")
    }
  }

  if (order === undefined) return null
  if (order === null) {
    return <p className="text-muted-foreground text-sm">Pedido não encontrado.</p>
  }

  const productMap = new Map(products.map((p) => [p.id, p]))

  return (
    <div className="grid max-w-3xl gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Pedido</h1>
          <p className="text-muted-foreground text-sm">
            {customer?.name ?? "Cliente removido"} — entrega em {formatDateBR(order.delivery_date)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.is_recurring && order.recurrence_rule && (
        <Badge variant="outline" className="w-fit">
          Pedido recorrente até {formatDateBR(order.recurrence_rule.until)}
        </Badge>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Preço unit.</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{productMap.get(item.product_id)?.name ?? "Produto removido"}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrencyBRL(item.unit_price)}</TableCell>
                    <TableCell>{formatCurrencyBRL(item.subtotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end pt-3 text-sm font-medium">
            Total: {formatCurrencyBRL(order.total_amount)}
          </div>
        </CardContent>
      </Card>

      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">{order.notes}</CardContent>
        </Card>
      )}

      <StatusTransitionButtons status={order.status} onTransition={handleTransition} />
    </div>
  )
}
