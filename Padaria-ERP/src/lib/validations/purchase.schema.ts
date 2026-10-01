import { z } from "zod"

export const purchaseItemSchema = z.object({
  ingredient_id: z.string().min(1, "Selecione um insumo"),
  quantity: z.number().min(0.001, "Informe a quantidade"),
  unit_cost: z.number().min(0, "Custo não pode ser negativo"),
})

export const purchaseSchema = z.object({
  supplier: z.string().nullable(),
  purchase_date: z.string().min(1, "Informe a data da compra"),
  payment_due_days: z.number().min(0),
  notes: z.string().nullable(),
  items: z.array(purchaseItemSchema).min(1, "Adicione pelo menos um item"),
})

export type PurchaseFormValues = z.infer<typeof purchaseSchema>
