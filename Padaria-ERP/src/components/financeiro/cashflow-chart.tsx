"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { formatCurrencyBRL } from "@/lib/format"
import { chartColors } from "@/lib/chart-colors"

interface CashflowChartProps<T> {
  data: T[]
  xKey: keyof T
  xFormatter?: (value: string) => string
}

export function CashflowChart<T extends { entradas: number; saidas: number }>({
  data,
  xKey,
  xFormatter,
}: CashflowChartProps<T>) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data as Record<string, unknown>[]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={chartColors.gridline} strokeWidth={1} />
          <XAxis
            dataKey={xKey as string}
            tickFormatter={xFormatter ? (v) => xFormatter(String(v)) : undefined}
            tick={{ fill: chartColors.textMuted, fontSize: 12 }}
            axisLine={{ stroke: chartColors.baseline }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatCurrencyBRL(Number(v))}
            tick={{ fill: chartColors.textMuted, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            formatter={(value, name) => [
              formatCurrencyBRL(Number(value)),
              name === "entradas" ? "Entradas" : "Saídas",
            ]}
            labelFormatter={(label) => (xFormatter ? xFormatter(String(label)) : String(label))}
            contentStyle={{ borderRadius: 8, borderColor: chartColors.gridline, fontSize: 13 }}
          />
          <Legend
            formatter={(value) => (value === "entradas" ? "Entradas" : "Saídas")}
            wrapperStyle={{ fontSize: 13, color: chartColors.textSecondary }}
          />
          <Bar dataKey="entradas" fill={chartColors.seriesBlue} radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="saidas" fill={chartColors.seriesRed} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
