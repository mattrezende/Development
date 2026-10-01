"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { buildPayableColumns, type PayableRow } from "@/components/financeiro/payable-columns"
import { financeStatusLabel } from "@/components/financeiro/receivable-columns"
import { NewPayableDialog } from "@/components/financeiro/new-payable-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { financeiroRepo } from "@/lib/repositories/financeiro.repo"
import { formatCurrencyBRL } from "@/lib/format"

export default function ContasPagarPage() {
  const [rows, setRows] = useState<PayableRow[] | null>(null)

  const load = useCallback(async () => {
    const payables = await financeiroRepo.listPayables()
    const balances = await Promise.all(payables.map((p) => financeiroRepo.payableBalance(p.id)))
    setRows(payables.map((p, index) => ({ ...p, balance: balances[index].balance })))
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
        <h1 className="text-2xl font-semibold">Contas a Pagar</h1>
        <p className="text-muted-foreground text-sm">
          Compras de insumos (automático) e lançamentos manuais (fornecedores, salários, contas fixas)
        </p>
      </div>

      <Card className="w-fit">
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-sm">Total em aberto</p>
          <p className="text-2xl font-semibold">{formatCurrencyBRL(totalAberto)}</p>
        </CardContent>
      </Card>

      {rows && (
        <DataTable
          columns={buildPayableColumns(load)}
          data={rows}
          searchColumnId="description"
          searchPlaceholder="Buscar por descrição..."
          filters={[
            {
              columnId: "status",
              placeholder: "Status",
              options: Object.entries(financeStatusLabel).map(([value, label]) => ({ value, label })),
            },
          ]}
          actions={<NewPayableDialog onRegistered={load} />}
        />
      )}
    </div>
  )
}
