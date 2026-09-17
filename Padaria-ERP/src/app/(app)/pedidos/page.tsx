"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { orderColumns, type OrderRow } from "@/components/orders/columns"
import { orderStatusLabel } from "@/components/orders/order-status-badge"
import { ordersRepo } from "@/lib/repositories/orders.repo"
import { customersRepo } from "@/lib/repositories/customers.repo"

export default function PedidosPage() {
  const router = useRouter()
  const [rows, setRows] = useState<OrderRow[] | null>(null)

  useEffect(() => {
    Promise.all([ordersRepo.list(), customersRepo.list()]).then(([orders, customers]) => {
      const customerMap = new Map(customers.map((c) => [c.id, c.name]))
      setRows(
        orders.map((order) => ({
          ...order,
          customer_name: customerMap.get(order.customer_id) ?? "Cliente removido",
        }))
      )
    })
  }, [])

  const statusOptions = useMemo(
    () => Object.entries(orderStatusLabel).map(([value, label]) => ({ value, label })),
    []
  )

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <p className="text-muted-foreground text-sm">Pedidos de clientes e recorrências</p>
      </div>

      {rows && (
        <DataTable
          columns={orderColumns}
          data={rows}
          searchColumnId="customer_name"
          searchPlaceholder="Buscar por cliente..."
          filters={[{ columnId: "status", placeholder: "Status", options: statusOptions }]}
          actions={
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/pedidos/novo">
                <Plus className="size-4" />
                Novo pedido
              </Link>
            </Button>
          }
          onRowClick={(order) => router.push(`/pedidos/${order.id}`)}
        />
      )}
    </div>
  )
}
