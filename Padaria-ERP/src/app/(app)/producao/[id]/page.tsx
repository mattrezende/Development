"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Printer } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { productionRepo } from "@/lib/repositories/production.repo"
import { productsRepo } from "@/lib/repositories/products.repo"
import { customersRepo } from "@/lib/repositories/customers.repo"
import { ordersRepo } from "@/lib/repositories/orders.repo"
import { formatDateBR, formatDateTimeBR, formatQty } from "@/lib/format"
import type {
  BatchItem,
  Customer,
  Order,
  OrderItem,
  Product,
  ProductionBatch,
} from "@/lib/types/entities"

const batchStatusLabel: Record<ProductionBatch["status"], string> = {
  aberta: "Aberta",
  fechada: "Fechada",
  cancelada: "Cancelada",
}

export default function RemessaDetalhePage() {
  const params = useParams<{ id: string }>()
  const [batch, setBatch] = useState<ProductionBatch | null | undefined>(undefined)
  const [batchItems, setBatchItems] = useState<BatchItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [orderItemsByOrder, setOrderItemsByOrder] = useState<Map<string, OrderItem[]>>(new Map())

  useEffect(() => {
    async function load() {
      const foundBatch = await productionRepo.getBatch(params.id)
      setBatch(foundBatch)
      if (!foundBatch) return

      const [items, batchOrders, allProducts, allCustomers] = await Promise.all([
        productionRepo.listBatchItems(foundBatch.id),
        productionRepo.listBatchOrders(foundBatch.id),
        productsRepo.list(),
        customersRepo.list(),
      ])
      setBatchItems(items)
      setOrders(batchOrders)
      setProducts(allProducts)
      setCustomers(allCustomers)

      const itemsMap = new Map<string, OrderItem[]>()
      await Promise.all(
        batchOrders.map(async (order) => {
          itemsMap.set(order.id, await ordersRepo.listItems(order.id))
        })
      )
      setOrderItemsByOrder(itemsMap)
    }
    load()
  }, [params.id])

  if (batch === undefined) return null
  if (batch === null) {
    return <p className="text-muted-foreground text-sm">Remessa não encontrada.</p>
  }

  const productMap = new Map(products.map((p) => [p.id, p]))
  const customerMap = new Map(customers.map((c) => [c.id, c.name]))

  return (
    <div className="grid max-w-3xl gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">Remessa de Produção</h1>
          <p className="text-muted-foreground text-sm">
            Entrega em {formatDateBR(batch.delivery_date)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={batch.status === "fechada" ? "success" : "outline"}>
            {batchStatusLabel[batch.status]}
          </Badge>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
            <Printer className="size-4" />
            Imprimir ordem de produção
          </Button>
        </div>
      </div>

      <div className="hidden print:block">
        <h1 className="text-xl font-semibold">Ordem de Produção — {formatDateBR(batch.delivery_date)}</h1>
        {batch.closed_at && (
          <p className="text-muted-foreground text-sm">Fechada em {formatDateTimeBR(batch.closed_at)}</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Total a produzir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batchItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {productMap.get(item.product_id)?.name ?? "Produto removido"}
                    </TableCell>
                    <TableCell>{formatQty(item.total_quantity, item.unit)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="text-base">Pedidos incluídos ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-md border p-3">
              <p className="font-medium">{customerMap.get(order.customer_id) ?? "Cliente removido"}</p>
              <ul className="text-muted-foreground mt-1 grid gap-0.5 text-sm">
                {(orderItemsByOrder.get(order.id) ?? []).map((item) => (
                  <li key={item.id}>
                    {formatQty(item.quantity, productMap.get(item.product_id)?.unit ?? "un")} —{" "}
                    {productMap.get(item.product_id)?.name ?? "Produto removido"}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
