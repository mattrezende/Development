"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { IngredientForm } from "@/components/stock/ingredient-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ingredientsRepo } from "@/lib/repositories/ingredients.repo"
import { stockRepo } from "@/lib/repositories/stock.repo"
import { formatCurrencyBRL, formatDateTimeBR, formatQty } from "@/lib/format"
import type { Ingredient, StockMovement } from "@/lib/types/entities"
import type { IngredientFormValues } from "@/lib/validations/ingredient.schema"

const movementTypeLabel: Record<StockMovement["type"], string> = {
  entrada: "Entrada",
  saida: "Saída",
  ajuste: "Ajuste",
}

export default function EditarInsumoPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [ingredient, setIngredient] = useState<Ingredient | null | undefined>(undefined)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    ingredientsRepo.get(params.id).then(setIngredient)
    stockRepo.listByIngredient(params.id).then(setMovements)
  }, [params.id])

  async function handleSubmit(values: IngredientFormValues) {
    setSubmitting(true)
    try {
      await ingredientsRepo.update(params.id, values)
      toast.success("Insumo atualizado com sucesso")
      router.push("/estoque/insumos")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar insumo")
    } finally {
      setSubmitting(false)
    }
  }

  if (ingredient === undefined) return null
  if (ingredient === null) {
    return <p className="text-muted-foreground text-sm">Insumo não encontrado.</p>
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Editar insumo</h1>
        <p className="text-muted-foreground text-sm">
          {ingredient.name} — estoque atual: {formatQty(ingredient.current_stock, ingredient.unit)} · custo
          médio: {formatCurrencyBRL(ingredient.average_cost)}/{ingredient.unit}
        </p>
      </div>
      <div className="grid max-w-2xl gap-6">
        <IngredientForm defaultValues={ingredient} onSubmit={handleSubmit} submitting={submitting} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Movimentações recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-16 text-center text-muted-foreground">
                        Nenhuma movimentação registrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    movements.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>{formatDateTimeBR(m.created_at)}</TableCell>
                        <TableCell>{movementTypeLabel[m.type]}</TableCell>
                        <TableCell className={m.quantity < 0 ? "text-destructive" : ""}>
                          {m.quantity > 0 ? "+" : ""}
                          {formatQty(m.quantity, ingredient.unit)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
