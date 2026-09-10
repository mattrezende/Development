import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(2, "Informe o nome do produto"),
  category: z.string().min(2, "Informe a categoria"),
  unit: z.enum(["un", "kg"]),
  sale_price: z.number().min(0, "Preço não pode ser negativo"),
  estimated_cost: z.number().min(0, "Custo não pode ser negativo"),
  is_active: z.boolean(),
})

export type ProductFormValues = z.infer<typeof productSchema>
