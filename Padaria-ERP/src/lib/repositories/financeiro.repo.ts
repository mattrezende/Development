import { addDaysToIsoDate, daysBetween, todayIsoDate } from "@/lib/format"
import { asAsync, getTable, nowIso, setTable, uuid } from "@/lib/db/local-store"
import type {
  Customer,
  Ingredient,
  Order,
  Payable,
  Payment,
  PaymentMethod,
  Product,
  Receivable,
  Recipe,
} from "@/lib/types/entities"
import { ordersRepo } from "@/lib/repositories/orders.repo"

const RECEIVABLES_KEY = "receivables"
const PAYABLES_KEY = "payables"
const PAYMENTS_KEY = "payments"

export interface Balance {
  paid: number
  balance: number
}

function paymentsFor(kind: "receivable_id" | "payable_id", id: string): Payment[] {
  return getTable<Payment>(PAYMENTS_KEY).filter((p) => p[kind] === id)
}

function balanceOf(amount: number, kind: "receivable_id" | "payable_id", id: string): Balance {
  const paid = paymentsFor(kind, id).reduce((sum, p) => sum + p.amount, 0)
  return { paid, balance: Math.round((amount - paid) * 100) / 100 }
}

// --- Contas a Receber ---

async function listReceivables(): Promise<Receivable[]> {
  return asAsync(
    getTable<Receivable>(RECEIVABLES_KEY).sort((a, b) => a.due_date.localeCompare(b.due_date))
  )
}

async function getReceivable(id: string): Promise<Receivable | null> {
  return asAsync(getTable<Receivable>(RECEIVABLES_KEY).find((r) => r.id === id) ?? null)
}

async function listOverdueReceivables(): Promise<(Receivable & { dias_atraso: number })[]> {
  const today = todayIsoDate()
  const all = await listReceivables()
  return all
    .filter((r) => r.status === "aberto" && r.due_date < today)
    .map((r) => ({ ...r, dias_atraso: daysBetween(r.due_date, today) }))
}

// Chamado ao faturar um pedido — ramifica pela condição de pagamento do cliente.
async function generateReceivable(order: Order, customer: Customer): Promise<Receivable> {
  const now = nowIso()
  const today = todayIsoDate()

  if (customer.payment_terms === "consolidado_mensal") {
    const monthPrefix = today.slice(0, 7) // yyyy-MM
    const rows = getTable<Receivable>(RECEIVABLES_KEY)
    const openConsolidated = rows.find(
      (r) =>
        r.customer_id === customer.id &&
        r.billing_type === "consolidado_mensal" &&
        r.status === "aberto" &&
        r.issued_at.slice(0, 7) === monthPrefix
    )
    if (openConsolidated) {
      const idx = rows.findIndex((r) => r.id === openConsolidated.id)
      rows[idx] = {
        ...rows[idx],
        amount: Math.round((rows[idx].amount + order.total_amount) * 100) / 100,
        updated_at: now,
      }
      setTable(RECEIVABLES_KEY, rows)
      await ordersRepo.attachReceivable(order.id, rows[idx].id)
      return rows[idx]
    }
  }

  const dueDate =
    customer.payment_terms === "a_vista"
      ? today
      : customer.payment_terms === "prazo"
        ? addDaysToIsoDate(today, customer.payment_terms_days)
        : addDaysToIsoDate(today, 30) // consolidado_mensal, primeiro título do mês

  const receivable: Receivable = {
    id: uuid(),
    customer_id: customer.id,
    billing_type: customer.payment_terms,
    amount: order.total_amount,
    due_date: dueDate,
    status: "aberto",
    issued_at: today,
    notes: null,
    created_at: now,
    updated_at: now,
  }
  const rows = getTable<Receivable>(RECEIVABLES_KEY)
  setTable(RECEIVABLES_KEY, [...rows, receivable])
  await ordersRepo.attachReceivable(order.id, receivable.id)
  return receivable
}

// --- Contas a Pagar ---

async function listPayables(): Promise<Payable[]> {
  return asAsync(
    getTable<Payable>(PAYABLES_KEY).sort((a, b) => a.due_date.localeCompare(b.due_date))
  )
}

async function getPayable(id: string): Promise<Payable | null> {
  return asAsync(getTable<Payable>(PAYABLES_KEY).find((p) => p.id === id) ?? null)
}

export type PayableInput = Pick<
  Payable,
  "description" | "category" | "amount" | "due_date" | "issued_at" | "notes"
>

async function createPayable(
  input: PayableInput,
  purchaseId: string | null = null
): Promise<Payable> {
  const now = nowIso()
  const payable: Payable = {
    id: uuid(),
    purchase_id: purchaseId,
    status: "aberto",
    created_at: now,
    updated_at: now,
    ...input,
  }
  const rows = getTable<Payable>(PAYABLES_KEY)
  setTable(PAYABLES_KEY, [...rows, payable])
  return payable
}

// --- Pagamentos (baixa) ---

async function listPayments(): Promise<Payment[]> {
  return asAsync(
    getTable<Payment>(PAYMENTS_KEY).sort((a, b) => b.payment_date.localeCompare(a.payment_date))
  )
}

export interface RegisterPaymentInput {
  receivable_id?: string | null
  payable_id?: string | null
  amount: number
  payment_date?: string
  method?: PaymentMethod | null
  notes?: string | null
}

async function registerPayment(input: RegisterPaymentInput): Promise<Payment> {
  const hasReceivable = !!input.receivable_id
  const hasPayable = !!input.payable_id
  if (hasReceivable === hasPayable) {
    throw new Error("Informe exatamente um título (a receber OU a pagar)")
  }

  const payment: Payment = {
    id: uuid(),
    receivable_id: input.receivable_id ?? null,
    payable_id: input.payable_id ?? null,
    amount: input.amount,
    payment_date: input.payment_date ?? todayIsoDate(),
    method: input.method ?? null,
    notes: input.notes ?? null,
    created_at: nowIso(),
  }
  const rows = getTable<Payment>(PAYMENTS_KEY)
  setTable(PAYMENTS_KEY, [...rows, payment])

  if (input.receivable_id) {
    const receivable = await getReceivable(input.receivable_id)
    if (receivable) {
      const { balance } = balanceOf(receivable.amount, "receivable_id", receivable.id)
      if (balance <= 0) {
        const recRows = getTable<Receivable>(RECEIVABLES_KEY)
        const idx = recRows.findIndex((r) => r.id === receivable.id)
        recRows[idx] = { ...recRows[idx], status: "pago", updated_at: nowIso() }
        setTable(RECEIVABLES_KEY, recRows)
      }
    }
  }
  if (input.payable_id) {
    const payable = await getPayable(input.payable_id)
    if (payable) {
      const { balance } = balanceOf(payable.amount, "payable_id", payable.id)
      if (balance <= 0) {
        const payRows = getTable<Payable>(PAYABLES_KEY)
        const idx = payRows.findIndex((p) => p.id === payable.id)
        payRows[idx] = { ...payRows[idx], status: "pago", updated_at: nowIso() }
        setTable(PAYABLES_KEY, payRows)
      }
    }
  }

  return payment
}

async function receivableBalance(id: string): Promise<Balance> {
  const receivable = await getReceivable(id)
  if (!receivable) throw new Error("Título não encontrado")
  return asAsync(balanceOf(receivable.amount, "receivable_id", id))
}

async function payableBalance(id: string): Promise<Balance> {
  const payable = await getPayable(id)
  if (!payable) throw new Error("Título não encontrado")
  return asAsync(balanceOf(payable.amount, "payable_id", id))
}

// --- Fluxo de Caixa ---

export interface RealizedCashflowPoint {
  date: string
  entradas: number
  saidas: number
}

async function getRealizedCashflow(days: number): Promise<RealizedCashflowPoint[]> {
  const today = todayIsoDate()
  const startDate = addDaysToIsoDate(today, -(days - 1))
  const dates: string[] = []
  for (let i = 0; i < days; i++) dates.push(addDaysToIsoDate(startDate, i))

  const totals = new Map(dates.map((d) => [d, { entradas: 0, saidas: 0 }]))
  for (const payment of getTable<Payment>(PAYMENTS_KEY)) {
    const bucket = totals.get(payment.payment_date)
    if (!bucket) continue
    if (payment.receivable_id) bucket.entradas += payment.amount
    if (payment.payable_id) bucket.saidas += payment.amount
  }

  return dates.map((date) => {
    const t = totals.get(date)!
    return { date, entradas: Math.round(t.entradas * 100) / 100, saidas: Math.round(t.saidas * 100) / 100 }
  })
}

export interface ProjectedCashflowBucket {
  bucket: "0-30" | "31-60" | "61-90"
  entradas: number
  saidas: number
}

async function getProjectedCashflow(): Promise<ProjectedCashflowBucket[]> {
  const today = todayIsoDate()
  const boundaries = [
    { bucket: "0-30" as const, from: 0, to: 30 },
    { bucket: "31-60" as const, from: 31, to: 60 },
    { bucket: "61-90" as const, from: 61, to: 90 },
  ]

  const openReceivables = getTable<Receivable>(RECEIVABLES_KEY).filter((r) => r.status === "aberto")
  const openPayables = getTable<Payable>(PAYABLES_KEY).filter((p) => p.status === "aberto")

  return boundaries.map(({ bucket, from, to }) => {
    const entradas = openReceivables
      .filter((r) => {
        const d = daysBetween(today, r.due_date)
        return d >= from && d <= to
      })
      .reduce((sum, r) => sum + balanceOf(r.amount, "receivable_id", r.id).balance, 0)
    const saidas = openPayables
      .filter((p) => {
        const d = daysBetween(today, p.due_date)
        return d >= from && d <= to
      })
      .reduce((sum, p) => sum + balanceOf(p.amount, "payable_id", p.id).balance, 0)
    return { bucket, entradas: Math.round(entradas * 100) / 100, saidas: Math.round(saidas * 100) / 100 }
  })
}

// --- Margem por Produto ---

export interface ProductMargin {
  product_id: string
  product_name: string
  unit: string
  sale_price: number
  estimated_cost: number
  real_cost: number
  margin_amount: number
  margin_pct: number | null
}

async function getProductMargins(): Promise<ProductMargin[]> {
  const products = getTable<Product>("products").filter((p) => p.is_active)
  const recipes = getTable<Recipe>("recipes")
  const ingredientMap = new Map(getTable<Ingredient>("ingredients").map((i) => [i.id, i]))

  return products
    .map((product) => {
      const realCost = recipes
        .filter((r) => r.product_id === product.id)
        .reduce((sum, r) => sum + r.quantity_per_unit * (ingredientMap.get(r.ingredient_id)?.average_cost ?? 0), 0)
      const marginAmount = product.sale_price - realCost
      return {
        product_id: product.id,
        product_name: product.name,
        unit: product.unit,
        sale_price: product.sale_price,
        estimated_cost: product.estimated_cost,
        real_cost: Math.round(realCost * 100) / 100,
        margin_amount: Math.round(marginAmount * 100) / 100,
        margin_pct: product.sale_price > 0 ? (marginAmount / product.sale_price) * 100 : null,
      }
    })
    .sort((a, b) => (a.margin_pct ?? 0) - (b.margin_pct ?? 0))
}

export const financeiroRepo = {
  listReceivables,
  getReceivable,
  listOverdueReceivables,
  generateReceivable,
  listPayables,
  getPayable,
  createPayable,
  listPayments,
  registerPayment,
  receivableBalance,
  payableBalance,
  getRealizedCashflow,
  getProjectedCashflow,
  getProductMargins,
}
