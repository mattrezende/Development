"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Repeat } from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table/column-header"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { formatCurrencyBRL, formatDateBR } from "@/lib/format"
import type { Order } from "@/lib/types/entities"

export type OrderRow = Order & { customer_name: string }

export const orderColumns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: "customer_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cliente" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        {row.original.is_recurring && <Repeat className="size-3.5 text-muted-foreground" />}
        {row.original.customer_name}
      </div>
    ),
  },
  {
    accessorKey: "delivery_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Entrega" />,
    cell: ({ row }) => formatDateBR(row.original.delivery_date),
  },
  {
    id: "status",
    accessorFn: (row) => row.status,
    header: "Status",
    filterFn: "equalsString",
    cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
    cell: ({ row }) => formatCurrencyBRL(row.original.total_amount),
  },
]
