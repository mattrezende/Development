import { z } from "zod"

export const orderItemSchema = z.object({
  product_id: z.string().min(1, "Selecione um produto"),
  quantity: z.number().min(0.001, "Informe a quantidade"),
  unit_price: z.number().min(0, "Preço não pode ser negativo"),
})

export const orderSchema = z
  .object({
    customer_id: z.string().min(1, "Selecione um cliente"),
    delivery_date: z.string().min(1, "Informe a data de entrega"),
    notes: z.string().nullable(),
    items: z.array(orderItemSchema).min(1, "Adicione pelo menos um item"),
    is_recurring: z.boolean(),
    recurrence_weekdays: z.array(z.number()),
    recurrence_until: z.string().nullable(),
  })
  .refine((data) => !data.is_recurring || data.recurrence_weekdays.length > 0, {
    message: "Selecione ao menos um dia da semana",
    path: ["recurrence_weekdays"],
  })
  .refine((data) => !data.is_recurring || !!data.recurrence_until, {
    message: "Informe até quando repetir",
    path: ["recurrence_until"],
  })

export type OrderFormValues = z.infer<typeof orderSchema>

export const weekdayCheckboxOptions = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
] as const
