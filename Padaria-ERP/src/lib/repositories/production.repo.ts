import { asAsync, getTable, nowIso, setTable, uuid } from "@/lib/db/local-store"
import type { BatchItem, Order, OrderItem, ProductionBatch } from "@/lib/types/entities"
import { productsRepo } from "@/lib/repositories/products.repo"
import { recipesRepo } from "@/lib/repositories/recipes.repo"
import { ingredientsRepo } from "@/lib/repositories/ingredients.repo"
import { stockRepo } from "@/lib/repositories/stock.repo"

const BATCHES_KEY = "production_batches"
const BATCH_ITEMS_KEY = "batch_items"
const ORDERS_KEY = "orders"
const ORDER_ITEMS_KEY = "order_items"

export interface ProductionPreviewRow {
  product_id: string
  product_name: string
  unit: string
  total_quantity: number
}

// Fonte única da agregação — usada tanto pela tela de preview quanto pelo
// fechamento da remessa, para que os números nunca divirjam.
async function previewProduction(deliveryDate: string): Promise<ProductionPreviewRow[]> {
  const orders = getTable<Order>(ORDERS_KEY).filter(
    (o) =>
      o.delivery_date === deliveryDate &&
      o.status === "confirmado" &&
      o.production_batch_id === null
  )
  const orderIds = new Set(orders.map((o) => o.id))
  const items = getTable<OrderItem>(ORDER_ITEMS_KEY).filter((i) => orderIds.has(i.order_id))

  const totals = new Map<string, number>()
  for (const item of items) {
    totals.set(item.product_id, (totals.get(item.product_id) ?? 0) + item.quantity)
  }

  const products = await productsRepo.listByIds([...totals.keys()])
  const productMap = new Map(products.map((p) => [p.id, p]))

  return [...totals.entries()]
    .map(([product_id, total_quantity]) => ({
      product_id,
      product_name: productMap.get(product_id)?.name ?? "Produto removido",
      unit: productMap.get(product_id)?.unit ?? "un",
      total_quantity: Math.round(total_quantity * 1000) / 1000,
    }))
    .sort((a, b) => a.product_name.localeCompare(b.product_name, "pt-BR"))
}

async function countConfirmedOrders(deliveryDate: string): Promise<number> {
  return asAsync(
    getTable<Order>(ORDERS_KEY).filter(
      (o) =>
        o.delivery_date === deliveryDate &&
        o.status === "confirmado" &&
        o.production_batch_id === null
    ).length
  )
}

async function listBatches(): Promise<ProductionBatch[]> {
  return asAsync(
    getTable<ProductionBatch>(BATCHES_KEY).sort((a, b) =>
      b.delivery_date.localeCompare(a.delivery_date)
    )
  )
}

async function getBatch(id: string): Promise<ProductionBatch | null> {
  return asAsync(getTable<ProductionBatch>(BATCHES_KEY).find((b) => b.id === id) ?? null)
}

async function listBatchItems(batchId: string): Promise<BatchItem[]> {
  return asAsync(getTable<BatchItem>(BATCH_ITEMS_KEY).filter((bi) => bi.batch_id === batchId))
}

async function listBatchOrders(batchId: string): Promise<Order[]> {
  return asAsync(getTable<Order>(ORDERS_KEY).filter((o) => o.production_batch_id === batchId))
}

async function getOrCreateOpenBatch(deliveryDate: string): Promise<ProductionBatch> {
  const batches = getTable<ProductionBatch>(BATCHES_KEY)
  const existing = batches.find((b) => b.delivery_date === deliveryDate && b.status === "aberta")
  if (existing) return existing

  const now = nowIso()
  const batch: ProductionBatch = {
    id: uuid(),
    delivery_date: deliveryDate,
    status: "aberta",
    opened_at: now,
    closed_at: null,
    notes: null,
    created_at: now,
    updated_at: now,
  }
  setTable(BATCHES_KEY, [...batches, batch])
  return batch
}

async function closeProductionBatch(batchId: string): Promise<ProductionBatch> {
  const batch = await getBatch(batchId)
  if (!batch) throw new Error("Remessa não encontrada")
  if (batch.status !== "aberta") throw new Error("Remessa já foi fechada")

  const preview = await previewProduction(batch.delivery_date)
  if (preview.length === 0) {
    throw new Error("Não há pedidos confirmados para esta data")
  }

  // 1. grava batch_items
  const now = nowIso()
  const existingBatchItems = getTable<BatchItem>(BATCH_ITEMS_KEY).filter(
    (bi) => bi.batch_id !== batchId
  )
  const newBatchItems: BatchItem[] = preview.map((row) => ({
    id: uuid(),
    batch_id: batchId,
    product_id: row.product_id,
    total_quantity: row.total_quantity,
    unit: row.unit as BatchItem["unit"],
    created_at: now,
  }))
  setTable(BATCH_ITEMS_KEY, [...existingBatchItems, ...newBatchItems])

  // 2. marca pedidos confirmados dessa data como em_producao
  const orders = getTable<Order>(ORDERS_KEY)
  const affectedIds = new Set(
    orders
      .filter(
        (o) =>
          o.delivery_date === batch.delivery_date &&
          o.status === "confirmado" &&
          o.production_batch_id === null
      )
      .map((o) => o.id)
  )
  const updatedOrders = orders.map((o) =>
    affectedIds.has(o.id)
      ? {
          ...o,
          status: "em_producao" as const,
          production_batch_id: batchId,
          production_at: now,
          updated_at: now,
        }
      : o
  )
  setTable(ORDERS_KEY, updatedOrders)

  // 3. calcula consumo de insumos via ficha técnica e dá baixa no estoque
  const recipes = await recipesRepo.listByProducts(newBatchItems.map((bi) => bi.product_id))
  const consumptionByIngredient = new Map<string, number>()
  for (const item of newBatchItems) {
    for (const recipe of recipes.filter((r) => r.product_id === item.product_id)) {
      const consumo = recipe.quantity_per_unit * item.total_quantity
      consumptionByIngredient.set(
        recipe.ingredient_id,
        (consumptionByIngredient.get(recipe.ingredient_id) ?? 0) + consumo
      )
    }
  }
  for (const [ingredientId, consumo] of consumptionByIngredient.entries()) {
    const delta = -Math.round(consumo * 1000) / 1000
    stockRepo.insert({
      ingredient_id: ingredientId,
      type: "saida",
      quantity: delta,
      reference_type: "remessa",
      production_batch_id: batchId,
      purchase_id: null,
      notes: null,
    })
    ingredientsRepo.adjustStock(ingredientId, delta)
  }

  // 4. fecha a remessa
  const batches = getTable<ProductionBatch>(BATCHES_KEY)
  const idx = batches.findIndex((b) => b.id === batchId)
  const closed: ProductionBatch = { ...batches[idx], status: "fechada", closed_at: now, updated_at: now }
  batches[idx] = closed
  setTable(BATCHES_KEY, batches)

  return closed
}

export const productionRepo = {
  previewProduction,
  countConfirmedOrders,
  listBatches,
  getBatch,
  listBatchItems,
  listBatchOrders,
  getOrCreateOpenBatch,
  closeProductionBatch,
}
