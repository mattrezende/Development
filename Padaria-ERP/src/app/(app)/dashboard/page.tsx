"use client"

import { useEffect, useState } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { TopProductsChart } from "@/components/dashboard/top-products-chart"
import { ProductionCurveChart } from "@/components/dashboard/production-curve-chart"
import { CustomerRankingTable } from "@/components/dashboard/customer-ranking-table"
import { LowStockAlertCard } from "@/components/dashboard/low-stock-alert-card"
import {
  dashboardRepo,
  type CustomerRankingRow,
  type MonthComparison,
  type PeriodSummary,
  type ProductionCurvePoint,
  type RevenuePoint,
  type TopProductRow,
} from "@/lib/repositories/dashboard.repo"
import { ingredientsRepo } from "@/lib/repositories/ingredients.repo"
import { formatCurrencyBRL } from "@/lib/format"
import type { Ingredient } from "@/lib/types/entities"

const PERIOD_OPTIONS = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
]

export default function DashboardPage() {
  const [days, setDays] = useState(30)
  const [revenue, setRevenue] = useState<RevenuePoint[] | null>(null)
  const [topProducts, setTopProducts] = useState<TopProductRow[] | null>(null)
  const [ranking, setRanking] = useState<CustomerRankingRow[] | null>(null)
  const [productionCurve, setProductionCurve] = useState<ProductionCurvePoint[] | null>(null)
  const [summary, setSummary] = useState<PeriodSummary | null>(null)
  const [monthComparison, setMonthComparison] = useState<MonthComparison | null>(null)
  const [lowStock, setLowStock] = useState<Ingredient[] | null>(null)

  useEffect(() => {
    Promise.all([
      dashboardRepo.getRevenueByPeriod(days),
      dashboardRepo.getTopProducts(days),
      dashboardRepo.getCustomerRanking(days),
      dashboardRepo.getProductionCurve(days),
      dashboardRepo.getPeriodSummary(days),
    ]).then(([r, t, c, p, s]) => {
      setRevenue(r)
      setTopProducts(t)
      setRanking(c)
      setProductionCurve(p)
      setSummary(s)
    })
  }, [days])

  useEffect(() => {
    dashboardRepo.getMonthComparison().then(setMonthComparison)
    ingredientsRepo.listLowStock().then(setLowStock)
  }, [])

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Visão geral de produção, vendas e financeiro</p>
        </div>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Faturamento no período"
          value={formatCurrencyBRL(summary?.totalRevenue ?? 0)}
          highlight
        />
        <KpiCard label="Ticket médio" value={formatCurrencyBRL(summary?.averageTicket ?? 0)} />
        <KpiCard label="Pedidos faturados/entregues" value={String(summary?.ordersCount ?? 0)} />
        {monthComparison && (
          <KpiCard
            label="Faturamento (mês vs. anterior)"
            value={formatCurrencyBRL(monthComparison.currentRevenue)}
            deltaPct={monthComparison.revenueDeltaPct}
            deltaLabel="vs mês anterior"
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Faturamento por dia</CardTitle>
          </CardHeader>
          <CardContent>{revenue && <RevenueChart data={revenue} />}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Curva de produção diária</CardTitle>
          </CardHeader>
          <CardContent>{productionCurve && <ProductionCurveChart data={productionCurve} />}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Produtos mais vendidos (receita)</CardTitle>
          </CardHeader>
          <CardContent>{topProducts && <TopProductsChart data={topProducts} />}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ranking de clientes</CardTitle>
          </CardHeader>
          <CardContent>{ranking && <CustomerRankingTable data={ranking} />}</CardContent>
        </Card>
      </div>

      {lowStock && <LowStockAlertCard ingredients={lowStock} />}
    </div>
  )
}
