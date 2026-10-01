"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { formatCurrencyBRL } from "@/lib/format"
import { chartColors } from "@/lib/chart-colors"
import type { TopProductRow } from "@/lib/repositories/dashboard.repo"

export function TopProductsChart({ data }: { data: TopProductRow[] }) {
  const chartData = [...data].reverse()
  const height = Math.max(chartData.length * 36, 120)

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke={chartColors.gridline} strokeWidth={1} />
          <XAxis
            type="number"
            tickFormatter={(v) => formatCurrencyBRL(v)}
            tick={{ fill: chartColors.textMuted, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="product_name"
            tick={{ fill: chartColors.textSecondary, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={110}
          />
          <Tooltip
            formatter={(value) => [formatCurrencyBRL(Number(value)), "Receita"]}
            contentStyle={{ borderRadius: 8, borderColor: chartColors.gridline, fontSize: 13 }}
          />
          <Bar dataKey="total_revenue" fill={chartColors.seriesAccent} radius={[0, 4, 4, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
