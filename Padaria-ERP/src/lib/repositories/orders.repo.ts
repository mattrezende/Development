import { addDaysToIsoDate } from "@/lib/format"
import { asAsync, getTable, nowIso, setTable, uuid } from "@/lib/db/local-store"
import type {
  Order,
  OrderItem,
  OrderStatus,
  RecurrenceRule,
} from "@/lib/types/entities"

const ORDERS_KEY = "orders"
const ITEMS_KEY = "order_items"

export interface OrderItemInput {
  product_id: string
  quantity: number
  unit_price: number
}

export interface CreateOrderInput {
  customer_id: string
  delivery_date: string
  notes?: string | null
  items: OrderItemInput[]
  recurrence?: { weekdays: number[]; until: string } | null
}

const STATUS_FLOW: OrderStatus[] = [
  "rascunho",
  "confirmado",
  "em_producao",
  "entregue",
  "faturado",
]

function recalcOrderTotal(orderId: string, allItems?: OrderItem[]): number {
  const items = (allItems ?? getTable<OrderItem>(ITEMS_KEY)).filter(
    (i) => i.order_id === orderId
  )
  return items.reduce((sum, i) => sum + i.subtotal, 0)
}

function persistOrderTotal(orderId: string) {
  const orders = getTable<Order>(ORDERS_KEY)
  const idx = orders.findIndex((o) => o.id === orderId)
  if (idx === -1) return
  orders[idx] = {
    ...orders[idx],
    total_amount: recalcOrderTotal(orderId),
    updated_at: nowIso(),
  }
  setTable(ORDERS_KEY, orders)
}

async function list(): Promise<Order[]> {
  return asAsync(
    getTable<Order>(ORDERS_KEY).sort((a, b) =>
      b.delivery_date.localeCompare(a.delivery_date)
    )
  )
}

async function get(id: string): Promise<Order | null> {
  return asAsync(getTable<Order>(ORDERS_KEY).find((o) => o.id === id) ?? null)
}

async function listItems(orderId: string): Promise<OrderItem[]> {
  return asAsync(
    getTable<OrderItem>(ITEMS_KEY).filter((i) => i.order_id === orderId)
  )
}

async function listByDeliveryDate(deliveryDate: string): Promise<Order[]> {
  return asAsync(
    getTable<Order>(ORDERS_KEY).filter((o) => o.delivery_date === deliveryDate)
  )
}

function insertItems(orderId: string, items: OrderItemInput[]): OrderItem[] {
  const now = nowIso()
  const rows = items.map<OrderItem>((item) => ({
    id: uuid(),
    order_id: orderId,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: Math.round(item.quantity * item.unit_price * 100) / 100,
    created_at: now,
  }))
  const existing = getTable<OrderItem>(ITEMS_KEY)
  setTable(ITEMS_KEY, [...existing, ...rows])
  return rows
}

async function create(input: CreateOrderInput): Promise<Order> {
  if (input.items.length === 0) {
    throw new Error("O pedido precisa de pelo menos um item")
  }
  const now = nowIso()
  const order: Order = {
    id: uuid(),
    customer_id: input.customer_id,
    delivery_date: input.delivery_date,
    status: "rascunho",
    is_recurring: !!input.recurrence,
    recurrence_rule: input.recurrence
      ? ({ weekdays: input.recurrence.weekdays, until: input.recurrence.until } as RecurrenceRule)
      : null,
    parent_order_id: null,
    production_batch_id: null,
    receivable_id: null,
    total_amount: 0,
    notes: input.notes ?? null,
    confirmed_at: null,
    production_at: null,
    delivered_at: null,
    invoiced_at: null,
    created_at: now,
    updated_at: now,
  }
  const rows = getTable<Order>(ORDERS_KEY)
  setTable(ORDERS_KEY, [...rows, order])
  insertItems(order.id, input.items)
  persistOrderTotal(order.id)

  if (input.recurrence) {
    await generateRecurringOrders(order.id)
  }

  return get(order.id) as Promise<Order>
}

async function updateItems(orderId: string, items: OrderItemInput[]): Promise<Order> {
  const order = await get(orderId)
  if (!order) throw new Error("Pedido não encontrado")
  if (order.status !== "rascunho") {
    throw new Error("Só é possível editar itens de pedidos em rascunho")
  }
  const allItems = getTable<OrderItem>(ITEMS_KEY).filter((i) => i.order_id !== orderId)
  setTable(ITEMS_KEY, allItems)
  insertItems(orderId, items)
  persistOrderTotal(orderId)
  return get(orderId) as Promise<Order>
}

function assertTransitionAllowed(current: OrderStatus, next: OrderStatus) {
  if (next === "cancelado") {
    if (current === "entregue" || current === "faturado" || current === "cancelado") {
      throw new Error(`Não é possível cancelar um pedido "${current}"`)
    }
    return
  }
  const currentIdx = STATUS_FLOW.indexOf(current)
  const nextIdx = STATUS_FLOW.indexOf(next)
  if (currentIdx === -1 || nextIdx !== currentIdx + 1) {
    throw new Error(`Transição de status inválida: ${current} → ${next}`)
  }
}

async function updateStatus(id: string, next: OrderStatus): Promise<Order> {
  const order = await get(id)
  if (!order) throw new Error("Pedido não encontrado")
  assertTransitionAllowed(order.status, next)

  const now = nowIso()
  const patch: Partial<Order> = { status: next, updated_at: now }
  if (next === "confirmado") patch.confirmed_at = now
  if (next === "entregue") patch.delivered_at = now
  if (next === "faturado") patch.invoiced_at = now

  const rows = getTable<Order>(ORDERS_KEY)
  const idx = rows.findIndex((o) => o.id === id)
  rows[idx] = { ...rows[idx], ...patch }
  setTable(ORDERS_KEY, rows)
  return rows[idx]
}

async function attachToBatch(orderIds: string[], batchId: string): Promise<void> {
  const now = nowIso()
  const rows = getTable<Order>(ORDERS_KEY)
  const idSet = new Set(orderIds)
  const updated = rows.map((o) =>
    idSet.has(o.id)
      ? { ...o, status: "em_producao" as OrderStatus, production_batch_id: batchId, production_at: now, updated_at: now }
      : o
  )
  setTable(ORDERS_KEY, updated)
}

async function attachReceivable(orderId: string, receivableId: string): Promise<void> {
  const rows = getTable<Order>(ORDERS_KEY)
  const idx = rows.findIndex((o) => o.id === orderId)
  if (idx === -1) return
  rows[idx] = { ...rows[idx], receivable_id: receivableId, updated_at: nowIso() }
  setTable(ORDERS_KEY, rows)
}

const WEEKDAY_MAX_HORIZON_DAYS = 90

async function generateRecurringOrders(templateId: string): Promise<number> {
  const template = await get(templateId)
  if (!template || !template.recurrence_rule) {
    throw new Error("Pedido não é um modelo recorrente")
  }
  const items = await listItems(templateId)
  const { weekdays, until } = template.recurrence_rule
  const existingChildren = getTable<Order>(ORDERS_KEY).filter(
    (o) => o.parent_order_id === templateId
  )
  const existingDates = new Set(existingChildren.map((o) => o.delivery_date))

  let cursor = addDaysToIsoDate(template.delivery_date, 1)
  let horizon = 0
  let created = 0

  while (cursor <= until && horizon < WEEKDAY_MAX_HORIZON_DAYS) {
    const weekday = new Date(cursor + "T00:00:00").getDay()
    if (weekdays.includes(weekday) && !existingDates.has(cursor)) {
      const child = await create({
        customer_id: template.customer_id,
        delivery_date: cursor,
        notes: template.notes,
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
      })
      const rows = getTable<Order>(ORDERS_KEY)
      const idx = rows.findIndex((o) => o.id === child.id)
      rows[idx] = { ...rows[idx], parent_order_id: templateId }
      setTable(ORDERS_KEY, rows)
      existingDates.add(cursor)
      created += 1
    }
    cursor = addDaysToIsoDate(cursor, 1)
    horizon += 1
  }

  return created
}

export const ordersRepo = {
  list,
  get,
  listItems,
  listByDeliveryDate,
  create,
  updateItems,
  updateStatus,
  attachToBatch,
  attachReceivable,
  generateRecurringOrders,
}
