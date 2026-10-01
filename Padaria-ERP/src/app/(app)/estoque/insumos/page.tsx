"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { ingredientColumns } from "@/components/stock/ingredient-columns"
import { PurchaseSuggestionCard } from "@/components/stock/purchase-suggestion-card"
import { ingredientsRepo } from "@/lib/repositories/ingredients.repo"
import { stockRepo, type PurchaseSuggestion } from "@/lib/repositories/stock.repo"
import type { Ingredient } from "@/lib/types/entities"

export default function InsumosPage() {
  const router = useRouter()
  const [ingredients, setIngredients] = useState<Ingredient[] | null>(null)
  const [suggestions, setSuggestions] = useState<PurchaseSuggestion[] | null>(null)

  useEffect(() => {
    ingredientsRepo.list().then(setIngredients)
    stockRepo.getPurchaseSuggestions().then(setSuggestions)
  }, [])

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Insumos</h1>
        <p className="text-muted-foreground text-sm">Cadastro de insumos e controle de estoque</p>
      </div>

      {ingredients && (
        <DataTable
          columns={ingredientColumns}
          data={ingredients}
          searchColumnId="name"
          searchPlaceholder="Buscar por nome..."
          filters={[
            {
              columnId: "is_active",
              placeholder: "Status",
              options: [
                { label: "Ativo", value: "ativo" },
                { label: "Inativo", value: "inativo" },
              ],
            },
          ]}
          actions={
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/estoque/insumos/novo">
                <Plus className="size-4" />
                Novo insumo
              </Link>
            </Button>
          }
          onRowClick={(ingredient) => router.push(`/estoque/insumos/${ingredient.id}`)}
        />
      )}

      {suggestions && <PurchaseSuggestionCard suggestions={suggestions} />}
    </div>
  )
}
