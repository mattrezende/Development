import { asAsync, getTable, nowIso, setTable, uuid } from "@/lib/db/local-store"
import type { Customer, Order } from "@/lib/types/entities"
import { ordersRepo } from "@/lib/repositories/orders.repo"

const KEY = "customers"

export type CustomerInput = Omit<Customer, "id" | "created_at" | "updated_at">

async function list(): Promise<Customer[]> {
  return asAsync(
    getTable<Customer>(KEY).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
  )
}

async function get(id: string): Promise<Customer | null> {
  return asAsync(getTable<Customer>(KEY).find((c) => c.id === id) ?? null)
}

async function create(input: CustomerInput): Promise<Customer> {
  const rows = getTable<Customer>(KEY)
  const now = nowIso()
  const customer: Customer = { id: uuid(), created_at: now, updated_at: now, ...input }
  setTable(KEY, [...rows, customer])
  return asAsync(customer)
}

async function update(id: string, patch: Partial<CustomerInput>): Promise<Customer> {
  const rows = getTable<Customer>(KEY)
  const idx = rows.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error("Cliente não encontrado")
  const updated: Customer = { ...rows[idx], ...patch, updated_at: nowIso() }
  rows[idx] = updated
  setTable(KEY, rows)
  return asAsync(updated)
}

async function toggleActive(id: string): Promise<Customer> {
  const customer = await get(id)
  if (!customer) throw new Error("Cliente não encontrado")
  return update(id, { is_active: !customer.is_active })
}

async function getOrderHistory(customerId: string): Promise<Order[]> {
  const orders = await ordersRepo.list()
  return orders
    .filter((o) => o.customer_id === customerId)
    .sort((a, b) => b.delivery_date.localeCompare(a.delivery_date))
}

export const customersRepo = { list, get, create, update, toggleActive, getOrderHistory }
