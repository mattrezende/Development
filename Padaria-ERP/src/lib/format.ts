import { format, parse, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export function formatCurrencyBRL(value: number): string {
  return currencyFormatter.format(value ?? 0)
}

export function parseCurrencyInput(value: string): number {
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".")
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

// Datas de domínio são armazenadas como "yyyy-MM-dd" (string), sem hora/fuso.
export function formatDateBR(isoDate: string | null | undefined): string {
  if (!isoDate) return "-"
  const [datePart] = isoDate.split("T")
  const parsed = parse(datePart, "yyyy-MM-dd", new Date())
  if (!isValid(parsed)) return "-"
  return format(parsed, "dd/MM/yyyy", { locale: ptBR })
}

export function formatDateTimeBR(isoDateTime: string | null | undefined): string {
  if (!isoDateTime) return "-"
  const parsed = new Date(isoDateTime)
  if (!isValid(parsed)) return "-"
  return format(parsed, "dd/MM/yyyy HH:mm", { locale: ptBR })
}

export function parseDateBR(value: string): string | null {
  const parsed = parse(value, "dd/MM/yyyy", new Date())
  if (!isValid(parsed)) return null
  return format(parsed, "yyyy-MM-dd")
}

export function todayIsoDate(): string {
  return format(new Date(), "yyyy-MM-dd")
}

export function formatQty(value: number, unit: string): string {
  const decimals = unit === "kg" ? 3 : 0
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })} ${unit}`
}

export function addDaysToIsoDate(isoDate: string, days: number): string {
  const d = parse(isoDate, "yyyy-MM-dd", new Date())
  d.setDate(d.getDate() + days)
  return format(d, "yyyy-MM-dd")
}

export function daysBetween(fromIsoDate: string, toIsoDate: string): number {
  const from = parse(fromIsoDate, "yyyy-MM-dd", new Date())
  const to = parse(toIsoDate, "yyyy-MM-dd", new Date())
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
}
