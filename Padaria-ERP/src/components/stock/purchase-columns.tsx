"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/data-table/column-header"
import { formatCurrencyBRL, formatDateBR } from "@/lib/format"
import type { Purchase } from "@/lib/types/entities"

export const purchaseStatusLabel: Record<Purchase["status"], string> = {
  pendente: "Pendente",
  recebido: "Recebido",
  cancelado: "Cancelado",
}

export const purchaseColumns: ColumnDef<Purchase>[] = [
  {
    accessorKey: "purchase_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Data" />,
    cell: ({ row }) => formatDateBR(row.original.purchase_date),
  },
  {
    accessorKey: "supplier",
    header: "Fornecedor",
    cell: ({ row }) => row.original.supplier ?? "-",
  },
  {
    id: "status",
    accessorFn: (row) => row.status,
    header: "Status",
    filterFn: "equalsString",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "recebido" ? "success" : "outline"}>
        {purchaseStatusLabel[row.original.status]}
      </Badge>
    ),
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
    cell: ({ row }) => formatCurrencyBRL(row.original.total_amount),
  },
]
