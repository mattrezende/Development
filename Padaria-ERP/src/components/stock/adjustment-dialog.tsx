"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { stockRepo } from "@/lib/repositories/stock.repo"
import type { Ingredient } from "@/lib/types/entities"

export function AdjustmentDialog({
  ingredients,
  onRegistered,
}: {
  ingredients: Ingredient[]
  onRegistered: () => void
}) {
  const [open, setOpen] = useState(false)
  const [ingredientId, setIngredientId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setIngredientId("")
    setQuantity("")
    setNotes("")
  }

  async function handleSubmit() {
    const parsed = Number(quantity)
    if (!ingredientId || !parsed) {
      toast.error("Selecione o insumo e informe a quantidade (positiva para entrada, negativa para saída)")
      return
    }
    setSubmitting(true)
    try {
      await stockRepo.registerAdjustment({ ingredient_id: ingredientId, quantity: parsed, notes })
      toast.success("Ajuste de estoque registrado")
      reset()
      setOpen(false)
      onRegistered()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao registrar ajuste")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          Novo ajuste
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar ajuste de estoque</DialogTitle>
          <DialogDescription>
            Use valores positivos para entradas (ex: inventário encontrou mais estoque) e negativos
            para perdas/quebras.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Insumo</Label>
            <Select value={ingredientId} onValueChange={setIngredientId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o insumo" />
              </SelectTrigger>
              <SelectContent>
                {ingredients.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name} ({i.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Quantidade (use negativo para perdas)</Label>
            <Input
              type="number"
              step="0.001"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ex: -2.5 ou 10"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Observações</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Registrando..." : "Registrar ajuste"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
