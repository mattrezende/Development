"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { DataTable } from "@/components/data-table/data-table"
import {
  buildReceivableColumns,
  financeStatusLabel,
  type ReceivableRow,
} from "@/components/financeiro/receivable-columns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { financeiroRepo } from "@/lib/repositories/financeiro.repo"
import { customersRepo } from "@/lib/repositories/customers.repo"
import { formatCurrencyBRL, formatDateBR } from "@/lib/format"

export default function ContasReceberPage() {
  const [rows, setRows] = useState<ReceivableRow[] | null>(null)
  const [overdue, setOverdue] = useState<
    Array<{ id: string; customer_name: string; amount: number; due_date: string; dias_atraso: number }>
  >([])

  const load = useCallback(async () => {
    const [receivables, customers, overdue] = await Promise.all([
      financeiroRepo.listReceivables(),
      customersRepo.list(),
      financeiroRepo.listOverdueReceivables(),
    ])
    const customerMap = new Map(customers.map((c) => [c.id, c.name]))
    const balances = await Promise.all(receivables.map((r) => financeiroRepo.receivableBalance(r.id)))
    setRows(
      receivables.map((r, index) => ({
        ...r,
        customer_name: customerMap.get(r.customer_id) ?? "Cliente removido",
        balance: balances[index].balance,
      }))
    )
    setOverdue(overdue.map((o) => ({ ...o, customer_name: customerMap.get(o.customer_id) ?? "-" })))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const totalAberto = useMemo(
    () => (rows ?? []).filter((r) => r.status === "aberto").reduce((sum, r) => sum + r.balance, 0),
    [rows]
  )

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Contas a Receber</h1>
        <p className="text-muted-foreground text-sm">Títulos gerados ao faturar pedidos</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total em aberto</p>
            <p className="text-2xl font-semibold">{formatCurrencyBRL(totalAberto)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Clientes inadimplentes</p>
            <p className="text-2xl font-semibold">{overdue.length}</p>
          </CardContent>
        </Card>
      </div>

      {overdue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inadimplência</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {overdue.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                <span className="font-medium">{o.customer_name}</span>
                <span className="text-muted-foreground">
                  {formatCurrencyBRL(o.amount)} — venceu em {formatDateBR(o.due_date)} (
                  <span className="text-destructive">{o.dias_atraso} dia(s) de atraso</span>)
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {rows && (
        <DataTable
          columns={buildReceivableColumns(load)}
          data={rows}
          searchColumnId="customer_name"
          searchPlaceholder="Buscar por cliente..."
          filters={[
            {
              columnId: "status",
              placeholder: "Status",
              options: Object.entries(financeStatusLabel).map(([value, label]) => ({ value, label })),
            },
          ]}
        />
      )}
    </div>
  )
}
