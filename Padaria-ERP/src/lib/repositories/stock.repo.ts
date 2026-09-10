import { asAsync, getTable, nowIso, setTable, uuid } from "@/lib/db/local-store"
import { todayIsoDate } from "@/lib/format"
import type { Ingredient, Order, OrderItem, Recipe, StockMovement } from "@/lib/types/entities"
import { ingredientsRepo } from "@/lib/repositories/ingredients.repo"

const KEY = "stock_movements"

async function list(): Promise<StockMovement[]> {
  return asAsync(
    getTable<StockMovement>(KEY).sort((a, b) => b.created_at.localeCompare(a.created_at))
  )
}

async function listByIngredient(ingredientId: string): Promise<StockMovement[]> {
  const all = await list()
  return all.filter((m) => m.ingredient_id === ingredientId)
}

function insert(movement: Omit<StockMovement, "id" | "created_at">): StockMovement {
  const rows = getTable<StockMovement>(KEY)
  const row: StockMovement = { id: uuid(), created_at: nowIso(), ...movement }
  setTable(KEY, [...rows, row])
  return row
}

// Ajuste manual (perda/inventário) — soma um delta com sinal ao estoque atual.
async function registerAdjustment(input: {
  ingredient_id: string
  quantity: number
  notes?: string | null
}): Promise<StockMovement> {
  if (input.quantity === 0) throw new Error("Quantidade do ajuste não pode ser zero")
  const movement = insert({
    ingredient_id: input.ingredient_id,
    type: "ajuste",
    quantity: input.quantity,
    reference_type: "manual",
    production_batch_id: null,
    purchase_id: null,
    notes: input.notes ?? null,
  })
  ingredientsRepo.adjustStock(input.ingredient_id, input.quantity)
  return asAsync(movement)
}

export interface PurchaseSuggestion {
  ingredient_id: string
  ingredient_name: string
  unit: string
  current_stock: number
  needed_for_planned_batches: number
  suggested_purchase_quantity: number
}

// Heurística: compara o consumo de insumos implícito nos pedidos confirmados
// ainda não produzidos (remessas planejadas) contra o estoque atual.
async function getPurchaseSuggestions(): Promise<PurchaseSuggestion[]> {
  const today = todayIsoDate()
  const plannedOrders = getTable<Order>("orders").filter(
    (o) => o.status === "confirmado" && o.production_batch_id === null && o.delivery_date >= today
  )
  const orderIds = new Set(plannedOrders.map((o) => o.id))
  const items = getTable<OrderItem>("order_items").filter((i) => orderIds.has(i.order_id))

  const neededByProduct = new Map<string, number>()
  for (const item of items) {
    neededByProduct.set(item.product_id, (neededByProduct.get(item.product_id) ?? 0) + item.quantity)
  }

  const recipes = getTable<Recipe>("recipes")
  const neededByIngredient = new Map<string, number>()
  for (const [productId, quantity] of neededByProduct.entries()) {
    for (const recipe of recipes.filter((r) => r.product_id === productId)) {
      neededByIngredient.set(
        recipe.ingredient_id,
        (neededByIngredient.get(recipe.ingredient_id) ?? 0) + recipe.quantity_per_unit * quantity
      )
    }
  }

  const ingredients = getTable<Ingredient>("ingredients")
  const suggestions: PurchaseSuggestion[] = []
  for (const [ingredientId, needed] of neededByIngredient.entries()) {
    const ingredient = ingredients.find((i) => i.id === ingredientId)
    if (!ingredient) continue
    const shortfall = needed - ingredient.current_stock
    if (shortfall > 0) {
      suggestions.push({
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        unit: ingredient.unit,
        current_stock: ingredient.current_stock,
        needed_for_planned_batches: Math.round(needed * 1000) / 1000,
        suggested_purchase_quantity: Math.round(shortfall * 1000) / 1000,
      })
    }
  }

  return suggestions.sort((a, b) => b.suggested_purchase_quantity - a.suggested_purchase_quantity)
}

export const stockRepo = { list, listByIngredient, insert, registerAdjustment, getPurchaseSuggestions }
