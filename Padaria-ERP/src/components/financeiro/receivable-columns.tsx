"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/data-table/column-header"
import { PaymentDialog } from "@/components/financeiro/payment-dialog"
import { formatCurrencyBRL, formatDateBR, todayIsoDate } from "@/lib/format"
import type { Receivable } from "@/lib/types/entities"

export type ReceivableRow = Receivable & { customer_name: string; balance: number }

export const billingTypeLabel: Record<Receivable["billing_type"], string> = {
  a_vista: "À vista",
  prazo: "Prazo",
  consolidado_mensal: "Consolidado mensal",
}

export const financeStatusLabel: Record<Receivable["status"], string> = {
  aberto: "Aberto",
  pago: "Pago",
  cancelado: "Cancelado",
}

export function buildReceivableColumns(onRegistered: () => void): ColumnDef<ReceivableRow>[] {
  return [
    {
      accessorKey: "customer_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Cliente" />,
    },
    {
      accessorKey: "due_date",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vencimento" />,
      cell: ({ row }) => {
        const overdue = row.original.status === "aberto" && row.original.due_date < todayIsoDate()
        return (
          <span className={overdue ? "text-destructive font-medium" : ""}>
            {formatDateBR(row.original.due_date)}
          </span>
        )
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Valor" />,
      cell: ({ row }) => formatCurrencyBRL(row.original.amount),
    },
    {
      accessorKey: "balance",
      header: "Saldo",
      cell: ({ row }) => formatCurrencyBRL(row.original.balance),
    },
    {
      id: "status",
      accessorFn: (row) => row.status,
      header: "Status",
      filterFn: "equalsString",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "pago" ? "success" : "outline"}>
          {financeStatusLabel[row.original.status]}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.status === "aberto" ? (
          <PaymentDialog
            receivableId={row.original.id}
            balance={row.original.balance}
            onRegistered={onRegistered}
          />
        ) : null,
    },
  ]
}
