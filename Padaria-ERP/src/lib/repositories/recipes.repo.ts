import { asAsync, getTable, nowIso, setTable, uuid } from "@/lib/db/local-store"
import type { Recipe } from "@/lib/types/entities"

const KEY = "recipes"

export type RecipeInput = Pick<Recipe, "product_id" | "ingredient_id" | "quantity_per_unit">

async function listByProduct(productId: string): Promise<Recipe[]> {
  return asAsync(getTable<Recipe>(KEY).filter((r) => r.product_id === productId))
}

async function listByProducts(productIds: string[]): Promise<Recipe[]> {
  const idSet = new Set(productIds)
  return asAsync(getTable<Recipe>(KEY).filter((r) => idSet.has(r.product_id)))
}

async function upsert(input: RecipeInput): Promise<Recipe> {
  const rows = getTable<Recipe>(KEY)
  const idx = rows.findIndex(
    (r) => r.product_id === input.product_id && r.ingredient_id === input.ingredient_id
  )
  const now = nowIso()
  if (idx === -1) {
    const recipe: Recipe = { id: uuid(), created_at: now, updated_at: now, ...input }
    setTable(KEY, [...rows, recipe])
    return asAsync(recipe)
  }
  const updated: Recipe = { ...rows[idx], ...input, updated_at: now }
  rows[idx] = updated
  setTable(KEY, rows)
  return asAsync(updated)
}

async function remove(id: string): Promise<void> {
  const rows = getTable<Recipe>(KEY).filter((r) => r.id !== id)
  setTable(KEY, rows)
  return asAsync(undefined)
}

export const recipesRepo = { listByProduct, listByProducts, upsert, remove }
