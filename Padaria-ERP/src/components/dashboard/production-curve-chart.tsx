"use client"

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { parse, format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { chartColors } from "@/lib/chart-colors"
import type { ProductionCurvePoint } from "@/lib/repositories/dashboard.repo"

function shortDate(isoDate: string) {
  return format(parse(isoDate, "yyyy-MM-dd", new Date()), "dd/MM", { locale: ptBR })
}

export function ProductionCurveChart({ data }: { data: ProductionCurvePoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={chartColors.gridline} strokeWidth={1} />
          <XAxis
            dataKey="date"
            tickFormatter={shortDate}
            tick={{ fill: chartColors.textMuted, fontSize: 12 }}
            axisLine={{ stroke: chartColors.baseline }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: chartColors.textMuted, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            formatter={(value) => [Number(value).toLocaleString("pt-BR"), "Unidades produzidas"]}
            labelFormatter={(label) => shortDate(String(label))}
            contentStyle={{ borderRadius: 8, borderColor: chartColors.gridline, fontSize: 13 }}
          />
          <Line
            type="monotone"
            dataKey="total_quantity"
            stroke={chartColors.seriesOlive}
            strokeWidth={2}
            dot={{ r: 4, fill: chartColors.seriesOlive, stroke: chartColors.surface, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
