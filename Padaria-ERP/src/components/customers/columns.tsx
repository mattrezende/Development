"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { Pencil } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/data-table/column-header"
import type { Customer } from "@/lib/types/entities"

const paymentTermsLabel: Record<Customer["payment_terms"], string> = {
  a_vista: "À vista",
  prazo: "Prazo",
  consolidado_mensal: "Consolidado mensal",
}

export const customerColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
  },
  {
    accessorKey: "document",
    header: "CPF/CNPJ",
    cell: ({ row }) => row.original.document ?? "-",
  },
  {
    accessorKey: "phone",
    header: "Telefone",
    cell: ({ row }) => row.original.phone ?? "-",
  },
  {
    id: "payment_terms",
    accessorFn: (row) => row.payment_terms,
    header: "Pagamento",
    filterFn: "equalsString",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {paymentTermsLabel[row.original.payment_terms]}
        {row.original.payment_terms === "prazo" ? ` (${row.original.payment_terms_days}d)` : ""}
      </Badge>
    ),
  },
  {
    id: "is_active",
    accessorFn: (row) => (row.is_active ? "ativo" : "inativo"),
    header: "Status",
    filterFn: "equalsString",
    cell: ({ row }) => (
      <span className={row.original.is_active ? "text-foreground" : "text-muted-foreground"}>
        {row.original.is_active ? "Ativo" : "Inativo"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="icon" asChild onClick={(e) => e.stopPropagation()}>
        <Link href={`/clientes/${row.original.id}`}>
          <Pencil className="size-4" />
        </Link>
      </Button>
    ),
  },
]
