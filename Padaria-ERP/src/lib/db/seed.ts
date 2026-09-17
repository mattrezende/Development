import { seedIfEmpty, nowIso } from "@/lib/db/local-store"
import { addDaysToIsoDate, todayIsoDate } from "@/lib/format"
import type {
  BatchItem,
  Customer,
  Ingredient,
  Order,
  OrderItem,
  Payable,
  Payment,
  ProductionBatch,
  Product,
  Purchase,
  PurchaseItem,
  Receivable,
  Recipe,
  StockMovement,
} from "@/lib/types/entities"

export function seedDatabase(): void {
  const now = nowIso()
  const today = todayIsoDate()
  const yesterday = addDaysToIsoDate(today, -1)
  const tomorrow = addDaysToIsoDate(today, 1)

  const products: Product[] = [
    { id: "prod-pao-frances", name: "Pão Francês", category: "Pão Francês", unit: "un", sale_price: 0.75, estimated_cost: 0.35, is_active: true, created_at: now, updated_at: now },
    { id: "prod-pao-forma", name: "Pão de Forma", category: "Pão de Forma", unit: "un", sale_price: 9.9, estimated_cost: 4.5, is_active: true, created_at: now, updated_at: now },
    { id: "prod-baguete", name: "Baguete", category: "Pão Francês", unit: "un", sale_price: 8.5, estimated_cost: 3.2, is_active: true, created_at: now, updated_at: now },
    { id: "prod-croissant", name: "Croissant", category: "Doce", unit: "un", sale_price: 6.5, estimated_cost: 2.1, is_active: true, created_at: now, updated_at: now },
    { id: "prod-pao-queijo", name: "Pão de Queijo", category: "Salgado", unit: "kg", sale_price: 32, estimated_cost: 14, is_active: true, created_at: now, updated_at: now },
    { id: "prod-bolo-chocolate", name: "Bolo de Chocolate", category: "Doce", unit: "un", sale_price: 45, estimated_cost: 18, is_active: true, created_at: now, updated_at: now },
    { id: "prod-pao-doce", name: "Pão Doce", category: "Doce", unit: "un", sale_price: 4.5, estimated_cost: 1.6, is_active: true, created_at: now, updated_at: now },
    { id: "prod-rosca", name: "Rosca", category: "Doce", unit: "un", sale_price: 12, estimated_cost: 5, is_active: true, created_at: now, updated_at: now },
    { id: "prod-sonho", name: "Sonho", category: "Doce", unit: "un", sale_price: 5.5, estimated_cost: 2, is_active: true, created_at: now, updated_at: now },
    { id: "prod-cuca-uva", name: "Cuca de Uva", category: "Doce", unit: "un", sale_price: 15, estimated_cost: 6.5, is_active: true, created_at: now, updated_at: now },
    { id: "prod-pao-integral", name: "Pão Integral", category: "Integral", unit: "un", sale_price: 10.5, estimated_cost: 5.2, is_active: true, created_at: now, updated_at: now },
    { id: "prod-torta-salgada", name: "Torta Salgada", category: "Salgado", unit: "kg", sale_price: 38, estimated_cost: 16, is_active: true, created_at: now, updated_at: now },
    { id: "prod-coxinha", name: "Coxinha", category: "Salgado", unit: "un", sale_price: 6, estimated_cost: 2.4, is_active: true, created_at: now, updated_at: now },
    { id: "prod-brigadeiro", name: "Brigadeiro", category: "Doce", unit: "un", sale_price: 3, estimated_cost: 1.1, is_active: true, created_at: now, updated_at: now },
    { id: "prod-cafe", name: "Café", category: "Bebida", unit: "un", sale_price: 4, estimated_cost: 0.9, is_active: true, created_at: now, updated_at: now },
  ]

  const customers: Customer[] = [
    { id: "cust-mercadinho-bompreco", name: "Mercadinho Bom Preço Ltda", document: "12.345.678/0001-90", document_type: "CNPJ", phone: "(11) 98888-1010", address_street: "Rua das Flores", address_number: "120", address_neighborhood: "Centro", address_city: "São Paulo", address_state: "SP", address_zip: "01000-000", delivery_days: ["seg", "ter", "qua", "qui", "sex"], payment_terms: "prazo", payment_terms_days: 15, is_active: true, created_at: now, updated_at: now },
    { id: "cust-rest-sabor-caseiro", name: "Restaurante Sabor Caseiro", document: "23.456.789/0001-01", document_type: "CNPJ", phone: "(11) 98888-2020", address_street: "Av. Paulista", address_number: "900", address_neighborhood: "Bela Vista", address_city: "São Paulo", address_state: "SP", address_zip: "01310-000", delivery_days: ["seg", "ter", "qua", "qui", "sex", "sab"], payment_terms: "prazo", payment_terms_days: 15, is_active: true, created_at: now, updated_at: now },
    { id: "cust-padaria-central", name: "Distribuidora Padaria Central", document: "34.567.890/0001-12", document_type: "CNPJ", phone: "(11) 98888-3030", address_street: "Rua Augusta", address_number: "500", address_neighborhood: "Consolação", address_city: "São Paulo", address_state: "SP", address_zip: "01305-000", delivery_days: ["seg", "qua", "sex"], payment_terms: "consolidado_mensal", payment_terms_days: 0, is_active: true, created_at: now, updated_at: now },
    { id: "cust-maria-silva", name: "Maria da Silva", document: "123.456.789-00", document_type: "CPF", phone: "(11) 97777-1111", address_street: "Rua Ipê", address_number: "45", address_neighborhood: "Vila Nova", address_city: "São Paulo", address_state: "SP", address_zip: "04000-000", delivery_days: ["sab"], payment_terms: "a_vista", payment_terms_days: 0, is_active: true, created_at: now, updated_at: now },
    { id: "cust-joao-pereira", name: "João Pereira", document: "234.567.890-11", document_type: "CPF", phone: "(11) 97777-2222", address_street: "Rua Jasmim", address_number: "88", address_neighborhood: "Vila Nova", address_city: "São Paulo", address_state: "SP", address_zip: "04000-000", delivery_days: ["dom"], payment_terms: "a_vista", payment_terms_days: 0, is_active: true, created_at: now, updated_at: now },
    { id: "cust-cantina-escolar", name: "Cantina Escolar Nova Esperança", document: "45.678.901/0001-23", document_type: "CNPJ", phone: "(11) 98888-4040", address_street: "Rua da Escola", address_number: "200", address_neighborhood: "Jardim América", address_city: "São Paulo", address_state: "SP", address_zip: "05000-000", delivery_days: ["seg", "ter", "qua", "qui", "sex"], payment_terms: "prazo", payment_terms_days: 30, is_active: true, created_at: now, updated_at: now },
    { id: "cust-hotel-pousada", name: "Hotel Pousada Estrela", document: "56.789.012/0001-34", document_type: "CNPJ", phone: "(11) 98888-5050", address_street: "Estrada Velha", address_number: "10", address_neighborhood: "Zona Norte", address_city: "São Paulo", address_state: "SP", address_zip: "02000-000", delivery_days: ["seg", "ter", "qua", "qui", "sex", "sab", "dom"], payment_terms: "prazo", payment_terms_days: 15, is_active: true, created_at: now, updated_at: now },
    { id: "cust-ana-souza", name: "Ana Souza", document: "345.678.901-22", document_type: "CPF", phone: "(11) 97777-3333", address_street: "Rua Tulipa", address_number: "12", address_neighborhood: "Centro", address_city: "São Paulo", address_state: "SP", address_zip: "01000-000", delivery_days: ["qui"], payment_terms: "a_vista", payment_terms_days: 0, is_active: true, created_at: now, updated_at: now },
    { id: "cust-mercado-vila-verde", name: "Mercado Vila Verde", document: "67.890.123/0001-45", document_type: "CNPJ", phone: "(11) 98888-6060", address_street: "Rua Verde", address_number: "300", address_neighborhood: "Vila Verde", address_city: "São Paulo", address_state: "SP", address_zip: "03000-000", delivery_days: ["seg", "ter", "qua", "qui", "sex"], payment_terms: "consolidado_mensal", payment_terms_days: 0, is_active: true, created_at: now, updated_at: now },
    { id: "cust-carlos-oliveira", name: "Carlos Oliveira", document: "456.789.012-33", document_type: "CPF", phone: "(11) 97777-4444", address_street: "Rua Cravo", address_number: "77", address_neighborhood: "Centro", address_city: "São Paulo", address_state: "SP", address_zip: "01000-000", delivery_days: ["ter", "qui"], payment_terms: "a_vista", payment_terms_days: 0, is_active: true, created_at: now, updated_at: now },
  ]

  const ingredients: Ingredient[] = [
    { id: "ing-farinha", name: "Farinha de Trigo", unit: "kg", current_stock: 80, minimum_stock: 50, average_cost: 4.2, supplier: "Moinho Trigo Bom", is_active: true, created_at: now, updated_at: now },
    { id: "ing-acucar", name: "Açúcar", unit: "kg", current_stock: 40, minimum_stock: 20, average_cost: 4.8, supplier: "Distribuidora Doce Sabor", is_active: true, created_at: now, updated_at: now },
    { id: "ing-fermento", name: "Fermento Biológico", unit: "kg", current_stock: 3, minimum_stock: 5, average_cost: 32, supplier: "Fermentos & Cia", is_active: true, created_at: now, updated_at: now },
    { id: "ing-sal", name: "Sal Refinado", unit: "kg", current_stock: 15, minimum_stock: 5, average_cost: 2.5, supplier: "Salinas do Nordeste", is_active: true, created_at: now, updated_at: now },
    { id: "ing-manteiga", name: "Manteiga", unit: "kg", current_stock: 20, minimum_stock: 10, average_cost: 22, supplier: "Laticínios Serra Verde", is_active: true, created_at: now, updated_at: now },
    { id: "ing-ovos", name: "Ovos", unit: "un", current_stock: 300, minimum_stock: 100, average_cost: 0.6, supplier: "Granja Boa Postura", is_active: true, created_at: now, updated_at: now },
    { id: "ing-leite", name: "Leite Integral", unit: "L", current_stock: 60, minimum_stock: 30, average_cost: 4.1, supplier: "Laticínios Serra Verde", is_active: true, created_at: now, updated_at: now },
    { id: "ing-chocolate", name: "Chocolate em Pó", unit: "kg", current_stock: 12, minimum_stock: 8, average_cost: 18.5, supplier: "Distribuidora Doce Sabor", is_active: true, created_at: now, updated_at: now },
  ]

  const recipeInputs: Array<[string, string, number]> = [
    ["prod-pao-frances", "ing-farinha", 0.06],
    ["prod-pao-frances", "ing-fermento", 0.001],
    ["prod-pao-frances", "ing-sal", 0.001],
    ["prod-pao-forma", "ing-farinha", 0.25],
    ["prod-pao-forma", "ing-fermento", 0.005],
    ["prod-pao-forma", "ing-leite", 0.05],
    ["prod-pao-forma", "ing-manteiga", 0.02],
    ["prod-baguete", "ing-farinha", 0.15],
    ["prod-baguete", "ing-fermento", 0.002],
    ["prod-baguete", "ing-sal", 0.003],
    ["prod-croissant", "ing-farinha", 0.08],
    ["prod-croissant", "ing-manteiga", 0.04],
    ["prod-croissant", "ing-ovos", 0.1],
    ["prod-croissant", "ing-leite", 0.02],
    ["prod-pao-queijo", "ing-leite", 0.2],
    ["prod-pao-queijo", "ing-ovos", 0.3],
    ["prod-pao-queijo", "ing-manteiga", 0.1],
    ["prod-bolo-chocolate", "ing-farinha", 0.4],
    ["prod-bolo-chocolate", "ing-acucar", 0.3],
    ["prod-bolo-chocolate", "ing-ovos", 4],
    ["prod-bolo-chocolate", "ing-chocolate", 0.15],
    ["prod-bolo-chocolate", "ing-manteiga", 0.1],
    ["prod-pao-doce", "ing-farinha", 0.07],
    ["prod-pao-doce", "ing-acucar", 0.02],
    ["prod-pao-doce", "ing-ovos", 0.05],
    ["prod-pao-doce", "ing-leite", 0.02],
    ["prod-rosca", "ing-farinha", 0.2],
    ["prod-rosca", "ing-acucar", 0.08],
    ["prod-rosca", "ing-ovos", 0.2],
    ["prod-rosca", "ing-manteiga", 0.05],
    ["prod-sonho", "ing-farinha", 0.08],
    ["prod-sonho", "ing-acucar", 0.03],
    ["prod-sonho", "ing-ovos", 0.1],
    ["prod-sonho", "ing-leite", 0.02],
    ["prod-cuca-uva", "ing-farinha", 0.25],
    ["prod-cuca-uva", "ing-acucar", 0.1],
    ["prod-cuca-uva", "ing-manteiga", 0.08],
    ["prod-cuca-uva", "ing-ovos", 0.2],
    ["prod-pao-integral", "ing-farinha", 0.22],
    ["prod-pao-integral", "ing-fermento", 0.004],
    ["prod-pao-integral", "ing-sal", 0.002],
    ["prod-pao-integral", "ing-leite", 0.03],
    ["prod-torta-salgada", "ing-farinha", 0.3],
    ["prod-torta-salgada", "ing-ovos", 0.5],
    ["prod-torta-salgada", "ing-manteiga", 0.1],
    ["prod-torta-salgada", "ing-leite", 0.1],
    ["prod-coxinha", "ing-farinha", 0.05],
    ["prod-coxinha", "ing-leite", 0.02],
    ["prod-coxinha", "ing-sal", 0.002],
    ["prod-brigadeiro", "ing-acucar", 0.03],
    ["prod-brigadeiro", "ing-chocolate", 0.02],
    ["prod-brigadeiro", "ing-leite", 0.02],
  ]
  const recipes: Recipe[] = recipeInputs.map(([product_id, ingredient_id, quantity_per_unit], index) => ({
    id: `recipe-${index}`,
    product_id,
    ingredient_id,
    quantity_per_unit,
    created_at: now,
    updated_at: now,
  }))

  function orderItem(id: string, order_id: string, product_id: string, quantity: number, unit_price: number): OrderItem {
    return { id, order_id, product_id, quantity, unit_price, subtotal: Math.round(quantity * unit_price * 100) / 100, created_at: now }
  }

  const orders: Order[] = [
    { id: "order-hist-1", customer_id: "cust-mercadinho-bompreco", delivery_date: yesterday, status: "entregue", is_recurring: false, recurrence_rule: null, parent_order_id: null, production_batch_id: "bch-hist-1", receivable_id: null, total_amount: 150, notes: null, confirmed_at: yesterday, production_at: yesterday, delivered_at: yesterday, invoiced_at: null, created_at: now, updated_at: now },
    { id: "order-hist-2", customer_id: "cust-rest-sabor-caseiro", delivery_date: yesterday, status: "entregue", is_recurring: false, recurrence_rule: null, parent_order_id: null, production_batch_id: "bch-hist-1", receivable_id: null, total_amount: 120, notes: null, confirmed_at: yesterday, production_at: yesterday, delivered_at: yesterday, invoiced_at: null, created_at: now, updated_at: now },
    { id: "order-invoiced-paid", customer_id: "cust-maria-silva", delivery_date: addDaysToIsoDate(today, -5), status: "faturado", is_recurring: false, recurrence_rule: null, parent_order_id: null, production_batch_id: null, receivable_id: "rec-paid-1", total_amount: 45, notes: null, confirmed_at: addDaysToIsoDate(today, -5), production_at: null, delivered_at: addDaysToIsoDate(today, -5), invoiced_at: addDaysToIsoDate(today, -5), created_at: now, updated_at: now },
    { id: "order-invoiced-overdue", customer_id: "cust-cantina-escolar", delivery_date: addDaysToIsoDate(today, -40), status: "faturado", is_recurring: false, recurrence_rule: null, parent_order_id: null, production_batch_id: null, receivable_id: "rec-overdue-1", total_amount: 690, notes: null, confirmed_at: addDaysToIsoDate(today, -40), production_at: null, delivered_at: addDaysToIsoDate(today, -40), invoiced_at: addDaysToIsoDate(today, -40), created_at: now, updated_at: now },
    { id: "order-invoiced-partial", customer_id: "cust-rest-sabor-caseiro", delivery_date: addDaysToIsoDate(today, -8), status: "faturado", is_recurring: false, recurrence_rule: null, parent_order_id: null, production_batch_id: null, receivable_id: "rec-partial-1", total_amount: 320, notes: null, confirmed_at: addDaysToIsoDate(today, -8), production_at: null, delivered_at: addDaysToIsoDate(today, -8), invoiced_at: addDaysToIsoDate(today, -8), created_at: now, updated_at: now },
    { id: "order-confirmed-1", customer_id: "cust-mercado-vila-verde", delivery_date: tomorrow, status: "confirmado", is_recurring: false, recurrence_rule: null, parent_order_id: null, production_batch_id: null, receivable_id: null, total_amount: 360, notes: null, confirmed_at: now, production_at: null, delivered_at: null, invoiced_at: null, created_at: now, updated_at: now },
    { id: "order-confirmed-2", customer_id: "cust-hotel-pousada", delivery_date: tomorrow, status: "confirmado", is_recurring: false, recurrence_rule: null, parent_order_id: null, production_batch_id: null, receivable_id: null, total_amount: 350, notes: null, confirmed_at: now, production_at: null, delivered_at: null, invoiced_at: null, created_at: now, updated_at: now },
    { id: "order-confirmed-3", customer_id: "cust-padaria-central", delivery_date: tomorrow, status: "confirmado", is_recurring: false, recurrence_rule: null, parent_order_id: null, production_batch_id: null, receivable_id: null, total_amount: 450, notes: null, confirmed_at: now, production_at: null, delivered_at: null, invoiced_at: null, created_at: now, updated_at: now },
    { id: "order-draft-1", customer_id: "cust-ana-souza", delivery_date: addDaysToIsoDate(today, 3), status: "rascunho", is_recurring: false, recurrence_rule: null, parent_order_id: null, production_batch_id: null, receivable_id: null, total_amount: 115, notes: null, confirmed_at: null, production_at: null, delivered_at: null, invoiced_at: null, created_at: now, updated_at: now },
    { id: "order-recurring-template", customer_id: "cust-mercadinho-bompreco", delivery_date: today, status: "confirmado", is_recurring: true, recurrence_rule: { weekdays: [1, 2, 3, 4, 5], until: addDaysToIsoDate(today, 14) }, parent_order_id: null, production_batch_id: null, receivable_id: null, total_amount: 37.5, notes: "Pedido recorrente — 50 pães franceses em dias úteis", confirmed_at: now, production_at: null, delivered_at: null, invoiced_at: null, created_at: now, updated_at: now },
  ]

  const orderItems: OrderItem[] = [
    orderItem("oi-1", "order-hist-1", "prod-pao-frances", 80, 0.75),
    orderItem("oi-2", "order-hist-1", "prod-pao-doce", 20, 4.5),
    orderItem("oi-3", "order-hist-2", "prod-pao-frances", 40, 0.75),
    orderItem("oi-4", "order-hist-2", "prod-pao-doce", 20, 4.5),
    orderItem("oi-5", "order-invoiced-paid", "prod-bolo-chocolate", 1, 45),
    orderItem("oi-6", "order-invoiced-overdue", "prod-pao-frances", 500, 0.75),
    orderItem("oi-7", "order-invoiced-overdue", "prod-pao-integral", 30, 10.5),
    orderItem("oi-8", "order-invoiced-partial", "prod-croissant", 40, 6.5),
    orderItem("oi-9", "order-invoiced-partial", "prod-cafe", 15, 4),
    orderItem("oi-10", "order-confirmed-1", "prod-pao-frances", 200, 0.75),
    orderItem("oi-11", "order-confirmed-1", "prod-pao-integral", 20, 10.5),
    orderItem("oi-12", "order-confirmed-2", "prod-pao-frances", 100, 0.75),
    orderItem("oi-13", "order-confirmed-2", "prod-croissant", 30, 6.5),
    orderItem("oi-14", "order-confirmed-2", "prod-cafe", 20, 4),
    orderItem("oi-15", "order-confirmed-3", "prod-pao-doce", 60, 4.5),
    orderItem("oi-16", "order-confirmed-3", "prod-rosca", 15, 12),
    orderItem("oi-17", "order-draft-1", "prod-sonho", 10, 5.5),
    orderItem("oi-18", "order-draft-1", "prod-brigadeiro", 20, 3),
    orderItem("oi-19", "order-recurring-template", "prod-pao-frances", 50, 0.75),
  ]

  const productionBatches: ProductionBatch[] = [
    { id: "bch-hist-1", delivery_date: yesterday, status: "fechada", opened_at: yesterday, closed_at: yesterday, notes: null, created_at: now, updated_at: now },
  ]

  const batchItems: BatchItem[] = [
    { id: "bi-1", batch_id: "bch-hist-1", product_id: "prod-pao-frances", total_quantity: 120, unit: "un", created_at: now },
    { id: "bi-2", batch_id: "bch-hist-1", product_id: "prod-pao-doce", total_quantity: 40, unit: "un", created_at: now },
  ]

  const purchases: Purchase[] = [
    { id: "purchase-hist-1", supplier: "Moinho Trigo Bom", purchase_date: addDaysToIsoDate(today, -6), status: "recebido", total_amount: 299, payment_due_days: 10, notes: null, created_at: now, updated_at: now },
  ]

  const purchaseItems: PurchaseItem[] = [
    { id: "pi-1", purchase_id: "purchase-hist-1", ingredient_id: "ing-farinha", quantity: 50, unit_cost: 4.1, subtotal: 205, created_at: now },
    { id: "pi-2", purchase_id: "purchase-hist-1", ingredient_id: "ing-acucar", quantity: 20, unit_cost: 4.7, subtotal: 94, created_at: now },
  ]

  const stockMovements: StockMovement[] = [
    { id: "sm-1", ingredient_id: "ing-farinha", type: "entrada", quantity: 50, reference_type: "compra", production_batch_id: null, purchase_id: "purchase-hist-1", notes: null, created_at: now },
    { id: "sm-2", ingredient_id: "ing-acucar", type: "entrada", quantity: 20, reference_type: "compra", production_batch_id: null, purchase_id: "purchase-hist-1", notes: null, created_at: now },
    { id: "sm-3", ingredient_id: "ing-farinha", type: "saida", quantity: -10, reference_type: "remessa", production_batch_id: "bch-hist-1", purchase_id: null, notes: null, created_at: now },
    { id: "sm-4", ingredient_id: "ing-sal", type: "saida", quantity: -0.12, reference_type: "remessa", production_batch_id: "bch-hist-1", purchase_id: null, notes: null, created_at: now },
    { id: "sm-5", ingredient_id: "ing-fermento", type: "saida", quantity: -0.12, reference_type: "remessa", production_batch_id: "bch-hist-1", purchase_id: null, notes: null, created_at: now },
    { id: "sm-6", ingredient_id: "ing-acucar", type: "saida", quantity: -0.8, reference_type: "remessa", production_batch_id: "bch-hist-1", purchase_id: null, notes: null, created_at: now },
    { id: "sm-7", ingredient_id: "ing-ovos", type: "saida", quantity: -2, reference_type: "remessa", production_batch_id: "bch-hist-1", purchase_id: null, notes: null, created_at: now },
    { id: "sm-8", ingredient_id: "ing-leite", type: "saida", quantity: -0.8, reference_type: "remessa", production_batch_id: "bch-hist-1", purchase_id: null, notes: null, created_at: now },
  ]

  const receivables: Receivable[] = [
    { id: "rec-paid-1", customer_id: "cust-maria-silva", billing_type: "a_vista", amount: 45, due_date: addDaysToIsoDate(today, -5), status: "pago", issued_at: addDaysToIsoDate(today, -5), notes: null, created_at: now, updated_at: now },
    { id: "rec-overdue-1", customer_id: "cust-cantina-escolar", billing_type: "prazo", amount: 690, due_date: addDaysToIsoDate(today, -10), status: "aberto", issued_at: addDaysToIsoDate(today, -40), notes: null, created_at: now, updated_at: now },
    { id: "rec-partial-1", customer_id: "cust-rest-sabor-caseiro", billing_type: "prazo", amount: 320, due_date: addDaysToIsoDate(today, 7), status: "aberto", issued_at: addDaysToIsoDate(today, -8), notes: null, created_at: now, updated_at: now },
  ]

  const payables: Payable[] = [
    { id: "payable-purchase-1", description: "Compra de insumos — Moinho Trigo Bom", purchase_id: "purchase-hist-1", category: "insumos", amount: 299, due_date: addDaysToIsoDate(today, 4), status: "pago", issued_at: addDaysToIsoDate(today, -6), notes: null, created_at: now, updated_at: now },
    { id: "payable-manual-1", description: "Aluguel do galpão industrial", purchase_id: null, category: "aluguel", amount: 1800, due_date: addDaysToIsoDate(today, 5), status: "aberto", issued_at: today, notes: null, created_at: now, updated_at: now },
    { id: "payable-manual-2", description: "Conta de energia elétrica", purchase_id: null, category: "energia", amount: 640, due_date: addDaysToIsoDate(today, -3), status: "aberto", issued_at: addDaysToIsoDate(today, -10), notes: null, created_at: now, updated_at: now },
  ]

  const payments: Payment[] = [
    { id: "pay-1", receivable_id: "rec-paid-1", payable_id: null, amount: 45, payment_date: addDaysToIsoDate(today, -5), method: "pix", notes: null, created_at: now },
    { id: "pay-2", receivable_id: "rec-partial-1", payable_id: null, amount: 150, payment_date: addDaysToIsoDate(today, -2), method: "pix", notes: null, created_at: now },
    { id: "pay-3", receivable_id: null, payable_id: "payable-purchase-1", amount: 299, payment_date: addDaysToIsoDate(today, -1), method: "boleto", notes: null, created_at: now },
  ]

  seedIfEmpty("products", products)
  seedIfEmpty("customers", customers)
  seedIfEmpty("ingredients", ingredients)
  seedIfEmpty("recipes", recipes)
  seedIfEmpty("orders", orders)
  seedIfEmpty("order_items", orderItems)
  seedIfEmpty("production_batches", productionBatches)
  seedIfEmpty("batch_items", batchItems)
  seedIfEmpty("purchases", purchases)
  seedIfEmpty("purchase_items", purchaseItems)
  seedIfEmpty("stock_movements", stockMovements)
  seedIfEmpty("receivables", receivables)
  seedIfEmpty("payables", payables)
  seedIfEmpty("payments", payments)
}
