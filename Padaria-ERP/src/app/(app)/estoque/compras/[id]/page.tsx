"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { purchaseStatusLabel } from "@/components/stock/purchase-columns"
import { purchasesRepo } from "@/lib/repositories/purchases.repo"
import { ingredientsRepo } from "@/lib/repositories/ingredients.repo"
import { formatCurrencyBRL, formatDateBR } from "@/lib/format"
import type { Ingredient, Purchase, PurchaseItem } from "@/lib/types/entities"

export default function CompraDetalhePage() {
  const params = useParams<{ id: string }>()
  const [purchase, setPurchase] = useState<Purchase | null | undefined>(undefined)
  const [items, setItems] = useState<PurchaseItem[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [receiving, setReceiving] = useState(false)

  const load = useCallback(async () => {
    const found = await purchasesRepo.get(params.id)
    setPurchase(found)
    if (found) {
      const [purchaseItems, allIngredients] = await Promise.all([
        purchasesRepo.listItems(found.id),
        ingredientsRepo.list(),
      ])
      setItems(purchaseItems)
      setIngredients(allIngredients)
    }
  }, [params.id])

  useEffect(() => {
    load()
  }, [load])

  async function handleReceive() {
    setReceiving(true)
    try {
      await purchasesRepo.receivePurchase(params.id)
      toast.success("Compra recebida — estoque atualizado e conta a pagar gerada")
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao receber compra")
    } finally {
      setReceiving(false)
    }
  }

  if (purchase === undefined) return null
  if (purchase === null) {
    return <p className="text-muted-foreground text-sm">Compra não encontrada.</p>
  }

  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]))

  return (
    <div className="grid max-w-3xl gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Compra</h1>
          <p className="text-muted-foreground text-sm">
            {purchase.supplier ?? "Fornecedor não informado"} — {formatDateBR(purchase.purchase_date)}
          </p>
        </div>
        <Badge variant={purchase.status === "recebido" ? "success" : "outline"}>
          {purchaseStatusLabel[purchase.status]}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Insumo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Custo unit.</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{ingredientMap.get(item.ingredient_id)?.name ?? "Insumo removido"}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrencyBRL(item.unit_cost)}</TableCell>
                    <TableCell>{formatCurrencyBRL(item.subtotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end pt-3 text-sm font-medium">
            Total: {formatCurrencyBRL(purchase.total_amount)}
          </div>
        </CardContent>
      </Card>

      {purchase.status === "pendente" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-fit" disabled={receiving}>
              Receber compra
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar recebimento da compra?</AlertDialogTitle>
              <AlertDialogDescription>
                O estoque dos insumos será atualizado, o custo médio recalculado e uma conta a pagar
                será gerada automaticamente com vencimento em {purchase.payment_due_days} dia(s).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction onClick={handleReceive}>Receber compra</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
