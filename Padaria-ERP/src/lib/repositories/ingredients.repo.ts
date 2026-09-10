import { asAsync, getTable, nowIso, setTable, uuid } from "@/lib/db/local-store"
import type { Ingredient } from "@/lib/types/entities"

const KEY = "ingredients"

export type IngredientInput = Omit<Ingredient, "id" | "created_at" | "updated_at" | "current_stock" | "average_cost"> & {
  current_stock?: number
  average_cost?: number
}

async function list(): Promise<Ingredient[]> {
  return asAsync(
    getTable<Ingredient>(KEY).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
  )
}

async function get(id: string): Promise<Ingredient | null> {
  return asAsync(getTable<Ingredient>(KEY).find((i) => i.id === id) ?? null)
}

async function listByIds(ids: string[]): Promise<Ingredient[]> {
  const idSet = new Set(ids)
  return asAsync(getTable<Ingredient>(KEY).filter((i) => idSet.has(i.id)))
}

async function listLowStock(): Promise<Ingredient[]> {
  return asAsync(
    getTable<Ingredient>(KEY).filter((i) => i.is_active && i.current_stock <= i.minimum_stock)
  )
}

async function create(input: IngredientInput): Promise<Ingredient> {
  const rows = getTable<Ingredient>(KEY)
  const now = nowIso()
  const ingredient: Ingredient = {
    id: uuid(),
    created_at: now,
    updated_at: now,
    current_stock: input.current_stock ?? 0,
    average_cost: input.average_cost ?? 0,
    ...input,
  }
  setTable(KEY, [...rows, ingredient])
  return asAsync(ingredient)
}

async function update(id: string, patch: Partial<IngredientInput>): Promise<Ingredient> {
  const rows = getTable<Ingredient>(KEY)
  const idx = rows.findIndex((i) => i.id === id)
  if (idx === -1) throw new Error("Insumo não encontrado")
  const updated: Ingredient = { ...rows[idx], ...patch, updated_at: nowIso() }
  rows[idx] = updated
  setTable(KEY, rows)
  return asAsync(updated)
}

async function toggleActive(id: string): Promise<Ingredient> {
  const ingredient = await get(id)
  if (!ingredient) throw new Error("Insumo não encontrado")
  return update(id, { is_active: !ingredient.is_active })
}

// Ajusta o estoque de forma atômica (usado por remessas, compras e ajustes manuais).
function adjustStock(id: string, delta: number): Ingredient {
  const rows = getTable<Ingredient>(KEY)
  const idx = rows.findIndex((i) => i.id === id)
  if (idx === -1) throw new Error("Insumo não encontrado")
  const updated: Ingredient = {
    ...rows[idx],
    current_stock: Math.round((rows[idx].current_stock + delta) * 1000) / 1000,
    updated_at: nowIso(),
  }
  rows[idx] = updated
  setTable(KEY, rows)
  return updated
}

function setAverageCost(id: string, averageCost: number): Ingredient {
  const rows = getTable<Ingredient>(KEY)
  const idx = rows.findIndex((i) => i.id === id)
  if (idx === -1) throw new Error("Insumo não encontrado")
  const updated: Ingredient = { ...rows[idx], average_cost: averageCost, updated_at: nowIso() }
  rows[idx] = updated
  setTable(KEY, rows)
  return updated
}

export const ingredientsRepo = {
  list,
  get,
  listByIds,
  listLowStock,
  create,
  update,
  toggleActive,
  adjustStock,
  setAverageCost,
}
