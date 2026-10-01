import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatQty } from "@/lib/format"
import type { Ingredient } from "@/lib/types/entities"

export function LowStockAlertCard({ ingredients }: { ingredients: Ingredient[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Estoque abaixo do mínimo</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {ingredients.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum insumo abaixo do estoque mínimo.</p>
        ) : (
          ingredients.map((ingredient) => {
            const isCritical = ingredient.current_stock <= 0
            return (
              <Link
                key={ingredient.id}
                href="/estoque/insumos"
                className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm hover:bg-muted"
              >
                <span className="font-medium">{ingredient.name}</span>
                <Badge variant={isCritical ? "critical" : "warning"}>
                  {isCritical ? "Crítico" : "Baixo"} · {formatQty(ingredient.current_stock, ingredient.unit)}
                </Badge>
              </Link>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
