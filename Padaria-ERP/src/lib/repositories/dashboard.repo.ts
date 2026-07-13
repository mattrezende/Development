import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"

import { getTable } from "@/lib/db/local-store"
import { addDaysToIsoDate, todayIsoDate } from "@/lib/format"
import { ingredientsRepo } from "@/lib/repositories/ingredients.repo"
import type {
  BatchItem,
  Customer,
  Order,
  OrderItem,
  Product,
  ProductionBatch,
} from "@/lib/types/entities"

const REVENUE_STATUSES = new Set<Order["status"]>(["faturado", "entregue"])

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function dateRange(days: number, endDate: string = todayIsoDate()): string[] {
  const dates: string[] = []
  for (let i = days - 1; i >= 0; i--) dates.push(addDaysToIsoDate(endDate, -i))
  return dates
}

export interface RevenuePoint {
  date: string
  revenue: number
}

async function getRevenueByPeriod(days: number): Promise<RevenuePoint[]> {
  const dates = dateRange(days)
  const totals = new Map(dates.map((d) => [d, 0]))
  const orders = getTable<Order>("orders").filter((o) => REVENUE_STATUSES.has(o.status))
  for (const order of orders) {
    if (totals.has(order.delivery_date)) {
      totals.set(order.delivery_date, (totals.get(order.delivery_date) ?? 0) + order.total_amount)
    }
  }
  return dates.map((date) => ({ date, revenue: round2(totals.get(date) ?? 0) }))
}

export interface TopProductRow {
  product_id: string
  product_name: string
  total_quantity: number
  total_revenue: number
}

async function getTopProducts(days: number, limit = 8): Promise<TopProductRow[]> {
  const dates = new Set(dateRange(days))
  const orders = getTable<Order>("orders").filter(
    (o) => REVENUE_STATUSES.has(o.status) && dates.has(o.delivery_date)
  )
  const orderIds = new Set(orders.map((o) => o.id))
  const items = getTable<OrderItem>("order_items").filter((i) => orderIds.has(i.order_id))
  const productMap = new Map(getTable<Product>("products").map((p) => [p.id, p]))

  const totals = new Map<string, { quantity: number; revenue: number }>()
  for (const item of items) {
    const entry = totals.get(item.product_id) ?? { quantity: 0, revenue: 0 }
    entry.quantity += item.quantity
    entry.revenue += item.subtotal
    totals.set(item.product_id, entry)
  }

  return [...totals.entries()]
    .map(([product_id, entry]) => ({
      product_id,
      product_name: productMap.get(product_id)?.name ?? "Produto removido",
      total_quantity: Math.round(entry.quantity * 1000) / 1000,
      total_revenue: round2(entry.revenue),
    }))
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, limit)
}

export interface CustomerRankingRow {
  customer_id: string
  customer_name: string
  total_revenue: number
  orders_count: number
}

async function getCustomerRanking(days: number, limit = 8): Promise<CustomerRankingRow[]> {
  const dates = new Set(dateRange(days))
  const orders = getTable<Order>("orders").filter(
    (o) => REVENUE_STATUSES.has(o.status) && dates.has(o.delivery_date)
  )
  const customerMap = new Map(getTable<Customer>("customers").map((c) => [c.id, c.name]))

  const totals = new Map<string, { revenue: number; count: number }>()
  for (const order of orders) {
    const entry = totals.get(order.customer_id) ?? { revenue: 0, count: 0 }
    entry.revenue += order.total_amount
    entry.count += 1
    totals.set(order.customer_id, entry)
  }

  return [...totals.entries()]
    .map(([customer_id, entry]) => ({
      customer_id,
      customer_name: customerMap.get(customer_id) ?? "Cliente removido",
      total_revenue: round2(entry.revenue),
      orders_count: entry.count,
    }))
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, limit)
}

export interface ProductionCurvePoint {
  date: string
  total_quantity: number
}

async function getProductionCurve(days: number): Promise<ProductionCurvePoint[]> {
  const dates = dateRange(days)
  const batchDateMap = new Map(
    getTable<ProductionBatch>("production_batches")
      .filter((b) => b.status === "fechada")
      .map((b) => [b.id, b.delivery_date])
  )
  const totals = new Map(dates.map((d) => [d, 0]))
  for (const item of getTable<BatchItem>("batch_items")) {
    const date = batchDateMap.get(item.batch_id)
    if (date && totals.has(date)) {
      totals.set(date, (totals.get(date) ?? 0) + item.total_quantity)
    }
  }
  return dates.map((date) => ({ date, total_quantity: Math.round((totals.get(date) ?? 0) * 1000) / 1000 }))
}

export interface PeriodSummary {
  totalRevenue: number
  averageTicket: number
  ordersCount: number
}

async function getPeriodSummary(days: number): Promise<PeriodSummary> {
  const dates = new Set(dateRange(days))
  const orders = getTable<Order>("orders").filter(
    (o) => REVENUE_STATUSES.has(o.status) && dates.has(o.delivery_date)
  )
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0)
  return {
    totalRevenue: round2(totalRevenue),
    averageTicket: orders.length ? round2(totalRevenue / orders.length) : 0,
    ordersCount: orders.length,
  }
}

export interface MonthComparison {
  currentRevenue: number
  previousRevenue: number
  currentTicket: number
  previousTicket: number
  revenueDeltaPct: number | null
  ticketDeltaPct: number | null
}

async function getMonthComparison(): Promise<MonthComparison> {
  const now = new Date()
  const currentStart = format(startOfMonth(now), "yyyy-MM-dd")
  const currentEnd = format(now, "yyyy-MM-dd")
  const prevMonth = subMonths(now, 1)
  const previousStart = format(startOfMonth(prevMonth), "yyyy-MM-dd")
  const previousEnd = format(endOfMonth(prevMonth), "yyyy-MM-dd")

  const orders = getTable<Order>("orders").filter((o) => REVENUE_STATUSES.has(o.status))
  const current = orders.filter((o) => o.delivery_date >= currentStart && o.delivery_date <= currentEnd)
  const previous = orders.filter(
    (o) => o.delivery_date >= previousStart && o.delivery_date <= previousEnd
  )

  const currentRevenue = current.reduce((sum, o) => sum + o.total_amount, 0)
  const previousRevenue = previous.reduce((sum, o) => sum + o.total_amount, 0)
  const currentTicket = current.length ? currentRevenue / current.length : 0
  const previousTicket = previous.length ? previousRevenue / previous.length : 0

  return {
    currentRevenue: round2(currentRevenue),
    previousRevenue: round2(previousRevenue),
    currentTicket: round2(currentTicket),
    previousTicket: round2(previousTicket),
    revenueDeltaPct: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : null,
    ticketDeltaPct: previousTicket > 0 ? ((currentTicket - previousTicket) / previousTicket) * 100 : null,
  }
}

async function getLowStockCount(): Promise<number> {
  const rows = await ingredientsRepo.listLowStock()
  return rows.length
}

export const dashboardRepo = {
  getRevenueByPeriod,
  getTopProducts,
  getCustomerRanking,
  getProductionCurve,
  getPeriodSummary,
  getMonthComparison,
  getLowStockCount,
}
