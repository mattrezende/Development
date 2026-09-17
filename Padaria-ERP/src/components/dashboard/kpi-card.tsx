import { ArrowDown, ArrowUp } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { chartColors } from "@/lib/chart-colors"

interface KpiCardProps {
  label: string
  value: string
  deltaPct?: number | null
  deltaLabel?: string
  invertDelta?: boolean
  highlight?: boolean
}

export function KpiCard({ label, value, deltaPct, deltaLabel, invertDelta, highlight }: KpiCardProps) {
  const hasDelta = deltaPct !== undefined && deltaPct !== null
  const isUp = hasDelta && deltaPct! >= 0
  const isGood = hasDelta && (invertDelta ? !isUp : isUp)

  return (
    <Card className={cn(highlight && "bg-primary text-primary-foreground")}>
      <CardContent className="grid gap-1 pt-6">
        <p className={cn("text-sm", highlight ? "text-primary-foreground/80" : "text-muted-foreground")}>
          {label}
        </p>
        <p className="text-2xl font-semibold">{value}</p>
        {hasDelta && (
          <p
            className="flex items-center gap-1 text-sm font-medium"
            style={!highlight ? { color: isGood ? chartColors.good : chartColors.critical } : undefined}
          >
            {isUp ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
            {Math.abs(deltaPct!).toFixed(1)}%
            {deltaLabel && (
              <span
                className={cn("font-normal", highlight ? "text-primary-foreground/70" : "text-muted-foreground")}
              >
                {deltaLabel}
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
