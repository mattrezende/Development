"use client"

import { useEffect, useState } from "react"
import { parse, format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { CashflowChart } from "@/components/financeiro/cashflow-chart"
import {
  financeiroRepo,
  type ProjectedCashflowBucket,
  type RealizedCashflowPoint,
} from "@/lib/repositories/financeiro.repo"
import { formatCurrencyBRL } from "@/lib/format"

const bucketLabel: Record<ProjectedCashflowBucket["bucket"], string> = {
  "0-30": "0–30 dias",
  "31-60": "31–60 dias",
  "61-90": "61–90 dias",
}

export default function FluxoCaixaPage() {
  const [realized, setRealized] = useState<RealizedCashflowPoint[] | null>(null)
  const [projected, setProjected] = useState<ProjectedCashflowBucket[] | null>(null)

  useEffect(() => {
    financeiroRepo.getRealizedCashflow(30).then(setRealized)
    financeiroRepo.getProjectedCashflow().then(setProjected)
  }, [])

  const realizedTotals = (realized ?? []).reduce(
    (acc, r) => ({ entradas: acc.entradas + r.entradas, saidas: acc.saidas + r.saidas }),
    { entradas: 0, saidas: 0 }
  )

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Fluxo de Caixa</h1>
        <p className="text-muted-foreground text-sm">Realizado (últimos 30 dias) e projetado (30/60/90 dias)</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Entradas realizadas (30d)" value={formatCurrencyBRL(realizedTotals.entradas)} />
        <KpiCard label="Saídas realizadas (30d)" value={formatCurrencyBRL(realizedTotals.saidas)} />
        <KpiCard
          label="Saldo realizado (30d)"
          value={formatCurrencyBRL(realizedTotals.entradas - realizedTotals.saidas)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Realizado por dia</CardTitle>
        </CardHeader>
        <CardContent>
          {realized && (
            <CashflowChart
              data={realized}
              xKey="date"
              xFormatter={(d) => format(parse(d, "yyyy-MM-dd", new Date()), "dd/MM", { locale: ptBR })}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Projetado (títulos em aberto)</CardTitle>
        </CardHeader>
        <CardContent>
          {projected && (
            <CashflowChart
              data={projected}
              xKey="bucket"
              xFormatter={(b) => bucketLabel[b as ProjectedCashflowBucket["bucket"]]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
