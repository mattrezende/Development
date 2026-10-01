"use client"

import { useCallback, useEffect, useState } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { movementColumns, movementTypeLabel, type MovementRow } from "@/components/stock/movement-columns"
import { AdjustmentDialog } from "@/components/stock/adjustment-dialog"
import { stockRepo } from "@/lib/repositories/stock.repo"
import { ingredientsRepo } from "@/lib/repositories/ingredients.repo"
import type { Ingredient } from "@/lib/types/entities"

export default function MovimentacoesPage() {
  const [rows, setRows] = useState<MovementRow[] | null>(null)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])

  const load = useCallback(async () => {
    const [movements, allIngredients] = await Promise.all([stockRepo.list(), ingredientsRepo.list()])
    const ingredientMap = new Map(allIngredients.map((i) => [i.id, i]))
    setIngredients(allIngredients)
    setRows(
      movements.map((m) => ({
        ...m,
        ingredient_name: ingredientMap.get(m.ingredient_id)?.name ?? "Insumo removido",
        ingredient_unit: ingredientMap.get(m.ingredient_id)?.unit ?? "un",
      }))
    )
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Movimentações de estoque</h1>
        <p className="text-muted-foreground text-sm">
          Histórico de entradas, saídas e ajustes de insumos
        </p>
      </div>

      {rows && (
        <DataTable
          columns={movementColumns}
          data={rows}
          searchColumnId="ingredient_name"
          searchPlaceholder="Buscar por insumo..."
          filters={[
            {
              columnId: "type",
              placeholder: "Tipo",
              options: Object.entries(movementTypeLabel).map(([value, label]) => ({ value, label })),
            },
          ]}
          actions={<AdjustmentDialog ingredients={ingredients} onRegistered={load} />}
        />
      )}
    </div>
  )
}
