"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/data-table/column-header"
import { formatCurrencyBRL, formatQty } from "@/lib/format"
import { chartColors } from "@/lib/chart-colors"
import type { Ingredient } from "@/lib/types/entities"

export const ingredientColumns: ColumnDef<Ingredient>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        {row.original.current_stock <= row.original.minimum_stock && (
          <AlertTriangle className="size-3.5" style={{ color: chartColors.warning }} />
        )}
        {row.original.name}
      </div>
    ),
  },
  {
    accessorKey: "current_stock",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estoque atual" />,
    cell: ({ row }) => formatQty(row.original.current_stock, row.original.unit),
  },
  {
    accessorKey: "minimum_stock",
    header: "Estoque mínimo",
    cell: ({ row }) => formatQty(row.original.minimum_stock, row.original.unit),
  },
  {
    accessorKey: "average_cost",
    header: "Custo médio",
    cell: ({ row }) => `${formatCurrencyBRL(row.original.average_cost)} / ${row.original.unit}`,
  },
  {
    accessorKey: "supplier",
    header: "Fornecedor",
    cell: ({ row }) => row.original.supplier ?? "-",
  },
  {
    id: "is_active",
    accessorFn: (row) => (row.is_active ? "ativo" : "inativo"),
    header: "Status",
    filterFn: "equalsString",
    cell: ({ row }) => (row.original.is_active ? "Ativo" : "Inativo"),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="icon" asChild onClick={(e) => e.stopPropagation()}>
        <Link href={`/estoque/insumos/${row.original.id}`}>
          <Pencil className="size-4" />
        </Link>
      </Button>
    ),
  },
]
