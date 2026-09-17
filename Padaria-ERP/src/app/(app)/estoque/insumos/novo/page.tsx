"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { IngredientForm } from "@/components/stock/ingredient-form"
import { ingredientsRepo } from "@/lib/repositories/ingredients.repo"
import type { IngredientFormValues } from "@/lib/validations/ingredient.schema"

export default function NovoInsumoPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(values: IngredientFormValues) {
    setSubmitting(true)
    try {
      await ingredientsRepo.create(values)
      toast.success("Insumo criado com sucesso")
      router.push("/estoque/insumos")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar insumo")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Novo insumo</h1>
        <p className="text-muted-foreground text-sm">Cadastre um novo insumo</p>
      </div>
      <div className="max-w-2xl">
        <IngredientForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Criar insumo" />
      </div>
    </div>
  )
}
