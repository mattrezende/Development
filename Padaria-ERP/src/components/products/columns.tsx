"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { Pencil } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { DataTableColumnHeader } from "@/components/data-table/column-header"
import { formatCurrencyBRL } from "@/lib/format"
import type { Product } from "@/lib/types/entities"

export function buildProductColumns(
  onToggleActive: (product: Product) => void
): ColumnDef<Product>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
    },
    {
      accessorKey: "category",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Categoria" />,
      cell: ({ row }) => <Badge variant="secondary">{row.original.category}</Badge>,
      filterFn: "equalsString",
    },
    {
      accessorKey: "unit",
      header: "Unidade",
      cell: ({ row }) => (row.original.unit === "kg" ? "Quilo (kg)" : "Unidade (un)"),
    },
    {
      accessorKey: "sale_price",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Preço de venda" />,
      cell: ({ row }) => formatCurrencyBRL(row.original.sale_price),
    },
    {
      accessorKey: "estimated_cost",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Custo estimado" />,
      cell: ({ row }) => formatCurrencyBRL(row.original.estimated_cost),
    },
    {
      id: "margin",
      header: "Margem",
      cell: ({ row }) => {
        const { sale_price, estimated_cost } = row.original
        if (sale_price <= 0) return "-"
        const margin = ((sale_price - estimated_cost) / sale_price) * 100
        return (
          <span className={margin < 20 ? "text-destructive font-medium" : "text-foreground"}>
            {margin.toFixed(1)}%
          </span>
        )
      },
    },
    {
      id: "is_active",
      accessorFn: (row) => (row.is_active ? "ativo" : "inativo"),
      header: "Status",
      filterFn: "equalsString",
      cell: ({ row }) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={row.original.is_active}
            onCheckedChange={() => onToggleActive(row.original)}
          />
          <span className="text-muted-foreground text-sm">
            {row.original.is_active ? "Ativo" : "Inativo"}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" asChild onClick={(e) => e.stopPropagation()}>
          <Link href={`/produtos/${row.original.id}`}>
            <Pencil className="size-4" />
          </Link>
        </Button>
      ),
    },
  ]
}
