// Interfaces espelhando o schema Postgres/Supabase planejado (ver supabase/migrations).
// Nomes de campos em snake_case propositalmente, para a migração futura ser
// apenas uma troca de implementação do repositório, não do modelo de dados.

export type Unit = "un" | "kg"

export interface Product {
  id: string
  name: string
  category: string
  unit: Unit
  sale_price: number
  estimated_cost: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type DocumentType = "CPF" | "CNPJ"
export type PaymentTerms = "a_vista" | "prazo" | "consolidado_mensal"
export type Weekday = "dom" | "seg" | "ter" | "qua" | "qui" | "sex" | "sab"

export interface Customer {
  id: string
  name: string
  document: string | null
  document_type: DocumentType | null
  phone: string | null
  address_street: string | null
  address_number: string | null
  address_neighborhood: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  delivery_days: Weekday[]
  payment_terms: PaymentTerms
  payment_terms_days: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type OrderStatus =
  | "rascunho"
  | "confirmado"
  | "em_producao"
  | "entregue"
  | "faturado"
  | "cancelado"

export interface RecurrenceRule {
  weekdays: number[] // 0=domingo .. 6=sábado
  until: string // yyyy-MM-dd
}

export interface Order {
  id: string
  customer_id: string
  delivery_date: string // yyyy-MM-dd
  status: OrderStatus
  is_recurring: boolean
  recurrence_rule: RecurrenceRule | null
  parent_order_id: string | null
  production_batch_id: string | null
  receivable_id: string | null
  total_amount: number
  notes: string | null
  confirmed_at: string | null
  production_at: string | null
  delivered_at: string | null
  invoiced_at: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

export type ProductionBatchStatus = "aberta" | "fechada" | "cancelada"

export interface ProductionBatch {
  id: string
  delivery_date: string
  status: ProductionBatchStatus
  opened_at: string
  closed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface BatchItem {
  id: string
  batch_id: string
  product_id: string
  total_quantity: number
  unit: Unit
  created_at: string
}

export interface Ingredient {
  id: string
  name: string
  unit: string
  current_stock: number
  minimum_stock: number
  average_cost: number
  supplier: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Recipe {
  id: string
  product_id: string
  ingredient_id: string
  quantity_per_unit: number
  created_at: string
  updated_at: string
}

export type StockMovementType = "entrada" | "saida" | "ajuste"
export type StockReferenceType = "remessa" | "compra" | "manual"

export interface StockMovement {
  id: string
  ingredient_id: string
  type: StockMovementType
  quantity: number // delta com sinal
  reference_type: StockReferenceType
  production_batch_id: string | null
  purchase_id: string | null
  notes: string | null
  created_at: string
}

export type PurchaseStatus = "pendente" | "recebido" | "cancelado"

export interface Purchase {
  id: string
  supplier: string | null
  purchase_date: string
  status: PurchaseStatus
  total_amount: number
  payment_due_days: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PurchaseItem {
  id: string
  purchase_id: string
  ingredient_id: string
  quantity: number
  unit_cost: number
  subtotal: number
  created_at: string
}

export type FinanceStatus = "aberto" | "pago" | "cancelado"

export interface Receivable {
  id: string
  customer_id: string
  billing_type: PaymentTerms
  amount: number
  due_date: string
  status: FinanceStatus
  issued_at: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Payable {
  id: string
  description: string
  purchase_id: string | null
  category: string | null
  amount: number
  due_date: string
  status: FinanceStatus
  issued_at: string
  notes: string | null
  created_at: string
  updated_at: string
}

export type PaymentMethod = "pix" | "dinheiro" | "cartao" | "transferencia" | "boleto"

export interface Payment {
  id: string
  receivable_id: string | null
  payable_id: string | null
  amount: number
  payment_date: string
  method: PaymentMethod | null
  notes: string | null
  created_at: string
}
