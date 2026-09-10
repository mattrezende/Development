import { z } from "zod"

export const ingredientSchema = z.object({
  name: z.string().min(2, "Informe o nome do insumo"),
  unit: z.string().min(1, "Informe a unidade"),
  minimum_stock: z.number().min(0, "Não pode ser negativo"),
  supplier: z.string().nullable(),
  is_active: z.boolean(),
})

export type IngredientFormValues = z.infer<typeof ingredientSchema>
