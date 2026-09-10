"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { parse, format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { formatCurrencyBRL } from "@/lib/format"
import { chartColors } from "@/lib/chart-colors"
import type { RevenuePoint } from "@/lib/repositories/dashboard.repo"

function shortDate(isoDate: string) {
  return format(parse(isoDate, "yyyy-MM-dd", new Date()), "dd/MM", { locale: ptBR })
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={chartColors.gridline} strokeWidth={1} />
          <XAxis
            dataKey="date"
            tickFormatter={shortDate}
            tick={{ fill: chartColors.textMuted, fontSize: 12 }}
            axisLine={{ stroke: chartColors.baseline }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatCurrencyBRL(v)}
            tick={{ fill: chartColors.textMuted, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            formatter={(value) => [formatCurrencyBRL(Number(value)), "Faturamento"]}
            labelFormatter={(label) => shortDate(String(label))}
            contentStyle={{
              borderRadius: 8,
              borderColor: chartColors.gridline,
              fontSize: 13,
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={chartColors.seriesAccent}
            strokeWidth={2}
            fill={chartColors.seriesAccent}
            fillOpacity={0.1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
