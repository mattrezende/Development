"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { PurchaseForm } from "@/components/stock/purchase-form"
import { purchasesRepo } from "@/lib/repositories/purchases.repo"
import { ingredientsRepo } from "@/lib/repositories/ingredients.repo"
import type { Ingredient } from "@/lib/types/entities"
import type { PurchaseFormValues } from "@/lib/validations/purchase.schema"

export default function NovaCompraPage() {
  const router = useRouter()
  const [ingredients, setIngredients] = useState<Ingredient[] | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    ingredientsRepo.list().then((all) => setIngredients(all.filter((i) => i.is_active)))
  }, [])

  async function handleSubmit(values: PurchaseFormValues) {
    setSubmitting(true)
    try {
      await purchasesRepo.create(values)
      toast.success("Compra registrada com sucesso")
      router.push("/estoque/compras")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao registrar compra")
    } finally {
      setSubmitting(false)
    }
  }

  if (!ingredients) return null

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Nova compra</h1>
        <p className="text-muted-foreground text-sm">Registre uma compra de insumos</p>
      </div>
      <div className="max-w-3xl">
        <PurchaseForm
          ingredients={ingredients}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Registrar compra"
        />
      </div>
    </div>
  )
}
