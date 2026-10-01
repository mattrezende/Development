"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { recipesRepo } from "@/lib/repositories/recipes.repo"
import { ingredientsRepo } from "@/lib/repositories/ingredients.repo"
import { formatQty } from "@/lib/format"
import type { Ingredient, Recipe, Unit } from "@/lib/types/entities"

export function RecipeEditor({ productId, productUnit }: { productId: string; productUnit: Unit }) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [newIngredientId, setNewIngredientId] = useState("")
  const [newQuantity, setNewQuantity] = useState(0)

  async function load() {
    const [productRecipes, allIngredients] = await Promise.all([
      recipesRepo.listByProduct(productId),
      ingredientsRepo.list(),
    ])
    setRecipes(productRecipes)
    setIngredients(allIngredients)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]))
  const availableIngredients = ingredients.filter(
    (i) => !recipes.some((r) => r.ingredient_id === i.id)
  )

  async function handleAdd() {
    if (!newIngredientId || newQuantity <= 0) {
      toast.error("Selecione um insumo e informe a quantidade")
      return
    }
    await recipesRepo.upsert({
      product_id: productId,
      ingredient_id: newIngredientId,
      quantity_per_unit: newQuantity,
    })
    setNewIngredientId("")
    setNewQuantity(0)
    await load()
    toast.success("Insumo adicionado à ficha técnica")
  }

  async function handleUpdateQuantity(ingredientId: string, quantity: number) {
    if (quantity <= 0) return
    await recipesRepo.upsert({ product_id: productId, ingredient_id: ingredientId, quantity_per_unit: quantity })
    await load()
  }

  async function handleRemove(recipeId: string) {
    await recipesRepo.remove(recipeId)
    await load()
    toast.success("Insumo removido da ficha técnica")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ficha técnica</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Insumo</TableHead>
                <TableHead>Quantidade por {productUnit === "kg" ? "kg" : "unidade"} produzida</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-16 text-center text-muted-foreground">
                    Nenhum insumo cadastrado nesta ficha técnica.
                  </TableCell>
                </TableRow>
              ) : (
                recipes.map((recipe) => {
                  const ingredient = ingredientMap.get(recipe.ingredient_id)
                  return (
                    <TableRow key={recipe.id}>
                      <TableCell className="font-medium">
                        {ingredient?.name ?? "Insumo removido"}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.0001"
                          min="0"
                          defaultValue={recipe.quantity_per_unit}
                          className="w-32"
                          onBlur={(e) =>
                            handleUpdateQuantity(recipe.ingredient_id, e.target.valueAsNumber || 0)
                          }
                        />
                        {ingredient && (
                          <span className="text-muted-foreground ml-2 text-xs">{ingredient.unit}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRemove(recipe.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="grid gap-1.5">
            <Select value={newIngredientId} onValueChange={setNewIngredientId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Selecione um insumo" />
              </SelectTrigger>
              <SelectContent>
                {availableIngredients.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name} ({i.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            type="number"
            step="0.0001"
            min="0"
            placeholder="Quantidade"
            className="w-32"
            value={newQuantity || ""}
            onChange={(e) => setNewQuantity(e.target.valueAsNumber || 0)}
          />
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handleAdd}>
            <Plus className="size-4" />
            Adicionar
          </Button>
        </div>
        {recipes.length > 0 && ingredients.length > 0 && (
          <p className="text-muted-foreground text-xs">
            Exemplo: para {formatQty(1, productUnit)} produzida, consome-se{" "}
            {recipes
              .map((r) => `${formatQty(r.quantity_per_unit, ingredientMap.get(r.ingredient_id)?.unit ?? "")} de ${ingredientMap.get(r.ingredient_id)?.name ?? ""}`)
              .join(", ")}
            .
          </p>
        )}
      </CardContent>
    </Card>
  )
}
