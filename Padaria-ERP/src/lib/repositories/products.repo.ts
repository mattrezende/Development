import { asAsync, getTable, nowIso, setTable, uuid } from "@/lib/db/local-store"
import type { Product } from "@/lib/types/entities"

const KEY = "products"

export type ProductInput = Pick<
  Product,
  "name" | "category" | "unit" | "sale_price" | "estimated_cost" | "is_active"
>

async function list(): Promise<Product[]> {
  return asAsync(
    getTable<Product>(KEY).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
  )
}

async function get(id: string): Promise<Product | null> {
  return asAsync(getTable<Product>(KEY).find((p) => p.id === id) ?? null)
}

async function create(input: ProductInput): Promise<Product> {
  const rows = getTable<Product>(KEY)
  const now = nowIso()
  const product: Product = { id: uuid(), created_at: now, updated_at: now, ...input }
  setTable(KEY, [...rows, product])
  return asAsync(product)
}

async function update(id: string, patch: Partial<ProductInput>): Promise<Product> {
  const rows = getTable<Product>(KEY)
  const idx = rows.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error("Produto não encontrado")
  const updated: Product = { ...rows[idx], ...patch, updated_at: nowIso() }
  rows[idx] = updated
  setTable(KEY, rows)
  return asAsync(updated)
}

async function toggleActive(id: string): Promise<Product> {
  const product = await get(id)
  if (!product) throw new Error("Produto não encontrado")
  return update(id, { is_active: !product.is_active })
}

async function listByIds(ids: string[]): Promise<Product[]> {
  const idSet = new Set(ids)
  return asAsync(getTable<Product>(KEY).filter((p) => idSet.has(p.id)))
}

export const productsRepo = { list, get, create, update, toggleActive, listByIds }
