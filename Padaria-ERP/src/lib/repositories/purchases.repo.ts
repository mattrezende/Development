import { addDaysToIsoDate } from "@/lib/format"
import { asAsync, getTable, nowIso, setTable, uuid } from "@/lib/db/local-store"
import type { Purchase, PurchaseItem } from "@/lib/types/entities"
import { ingredientsRepo } from "@/lib/repositories/ingredients.repo"
import { stockRepo } from "@/lib/repositories/stock.repo"
import { financeiroRepo } from "@/lib/repositories/financeiro.repo"

const PURCHASES_KEY = "purchases"
const ITEMS_KEY = "purchase_items"

export interface PurchaseItemInput {
  ingredient_id: string
  quantity: number
  unit_cost: number
}

export interface CreatePurchaseInput {
  supplier?: string | null
  purchase_date: string
  payment_due_days: number
  notes?: string | null
  items: PurchaseItemInput[]
}

async function list(): Promise<Purchase[]> {
  return asAsync(
    getTable<Purchase>(PURCHASES_KEY).sort((a, b) => b.purchase_date.localeCompare(a.purchase_date))
  )
}

async function get(id: string): Promise<Purchase | null> {
  return asAsync(getTable<Purchase>(PURCHASES_KEY).find((p) => p.id === id) ?? null)
}

async function listItems(purchaseId: string): Promise<PurchaseItem[]> {
  return asAsync(getTable<PurchaseItem>(ITEMS_KEY).filter((i) => i.purchase_id === purchaseId))
}

function recalcTotal(purchaseId: string) {
  const items = getTable<PurchaseItem>(ITEMS_KEY).filter((i) => i.purchase_id === purchaseId)
  const total = items.reduce((sum, i) => sum + i.subtotal, 0)
  const rows = getTable<Purchase>(PURCHASES_KEY)
  const idx = rows.findIndex((p) => p.id === purchaseId)
  if (idx === -1) return
  rows[idx] = { ...rows[idx], total_amount: Math.round(total * 100) / 100, updated_at: nowIso() }
  setTable(PURCHASES_KEY, rows)
}

async function create(input: CreatePurchaseInput): Promise<Purchase> {
  if (input.items.length === 0) throw new Error("A compra precisa de pelo menos um item")
  const now = nowIso()
  const purchase: Purchase = {
    id: uuid(),
    supplier: input.supplier ?? null,
    purchase_date: input.purchase_date,
    status: "pendente",
    total_amount: 0,
    payment_due_days: input.payment_due_days,
    notes: input.notes ?? null,
    created_at: now,
    updated_at: now,
  }
  setTable(PURCHASES_KEY, [...getTable<Purchase>(PURCHASES_KEY), purchase])

  const itemRows = input.items.map<PurchaseItem>((item) => ({
    id: uuid(),
    purchase_id: purchase.id,
    ingredient_id: item.ingredient_id,
    quantity: item.quantity,
    unit_cost: item.unit_cost,
    subtotal: Math.round(item.quantity * item.unit_cost * 100) / 100,
    created_at: now,
  }))
  setTable(ITEMS_KEY, [...getTable<PurchaseItem>(ITEMS_KEY), ...itemRows])
  recalcTotal(purchase.id)

  return get(purchase.id) as Promise<Purchase>
}

// Dá entrada no estoque, recalcula custo médio ponderado, marca a compra como
// recebida e gera automaticamente a conta a pagar correspondente.
async function receivePurchase(purchaseId: string): Promise<Purchase> {
  const purchase = await get(purchaseId)
  if (!purchase) throw new Error("Compra não encontrada")
  if (purchase.status !== "pendente") throw new Error("Compra já foi recebida ou cancelada")

  const items = await listItems(purchaseId)
  for (const item of items) {
    const ingredient = await ingredientsRepo.get(item.ingredient_id)
    if (!ingredient) continue

    const stockBefore = ingredient.current_stock
    const costBefore = ingredient.average_cost
    const newStock = stockBefore + item.quantity
    const newAverageCost =
      newStock > 0
        ? (stockBefore * costBefore + item.quantity * item.unit_cost) / newStock
        : item.unit_cost

    stockRepo.insert({
      ingredient_id: item.ingredient_id,
      type: "entrada",
      quantity: item.quantity,
      reference_type: "compra",
      production_batch_id: null,
      purchase_id: purchaseId,
      notes: null,
    })
    ingredientsRepo.adjustStock(item.ingredient_id, item.quantity)
    ingredientsRepo.setAverageCost(item.ingredient_id, Math.round(newAverageCost * 10000) / 10000)
  }

  const now = nowIso()
  const rows = getTable<Purchase>(PURCHASES_KEY)
  const idx = rows.findIndex((p) => p.id === purchaseId)
  const updated: Purchase = { ...rows[idx], status: "recebido", updated_at: now }
  rows[idx] = updated
  setTable(PURCHASES_KEY, rows)

  await financeiroRepo.createPayable(
    {
      description: `Compra de insumos${purchase.supplier ? " — " + purchase.supplier : ""}`,
      category: "insumos",
      amount: purchase.total_amount,
      due_date: addDaysToIsoDate(purchase.purchase_date, purchase.payment_due_days),
      issued_at: purchase.purchase_date,
      notes: purchase.notes,
    },
    purchaseId
  )

  return updated
}

export const purchasesRepo = { list, get, listItems, create, receivePurchase }
