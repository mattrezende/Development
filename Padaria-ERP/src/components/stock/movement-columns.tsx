"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/data-table/column-header"
import { formatDateTimeBR, formatQty } from "@/lib/format"
import type { StockMovement } from "@/lib/types/entities"

export type MovementRow = StockMovement & { ingredient_name: string; ingredient_unit: string }

export const movementTypeLabel: Record<StockMovement["type"], string> = {
  entrada: "Entrada",
  saida: "Saída",
  ajuste: "Ajuste",
}

export const movementColumns: ColumnDef<MovementRow>[] = [
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Data" />,
    cell: ({ row }) => formatDateTimeBR(row.original.created_at),
  },
  {
    accessorKey: "ingredient_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Insumo" />,
  },
  {
    id: "type",
    accessorFn: (row) => row.type,
    header: "Tipo",
    filterFn: "equalsString",
    cell: ({ row }) => (
      <Badge variant={row.original.type === "saida" ? "destructive" : "secondary"}>
        {movementTypeLabel[row.original.type]}
      </Badge>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Quantidade",
    cell: ({ row }) => (
      <span className={row.original.quantity < 0 ? "text-destructive" : ""}>
        {row.original.quantity > 0 ? "+" : ""}
        {formatQty(row.original.quantity, row.original.ingredient_unit)}
      </span>
    ),
  },
  {
    accessorKey: "reference_type",
    header: "Origem",
    cell: ({ row }) =>
      ({ remessa: "Remessa de produção", compra: "Compra", manual: "Ajuste manual" }[
        row.original.reference_type ?? "manual"
      ] ?? "-"),
  },
]
