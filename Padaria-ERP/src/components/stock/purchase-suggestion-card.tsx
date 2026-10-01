import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatQty } from "@/lib/format"
import type { PurchaseSuggestion } from "@/lib/repositories/stock.repo"

export function PurchaseSuggestionCard({ suggestions }: { suggestions: PurchaseSuggestion[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sugestão de compra</CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Estoque suficiente para os pedidos confirmados ainda não produzidos.
          </p>
        ) : (
          <ul className="grid gap-2">
            {suggestions.map((s) => (
              <li
                key={s.ingredient_id}
                className="flex items-center justify-between rounded-md border p-2 text-sm"
              >
                <span className="font-medium">{s.ingredient_name}</span>
                <span className="text-muted-foreground">
                  precisa de {formatQty(s.needed_for_planned_batches, s.unit)}, tem{" "}
                  {formatQty(s.current_stock, s.unit)} — comprar pelo menos{" "}
                  <span className="text-foreground font-medium">
                    {formatQty(s.suggested_purchase_quantity, s.unit)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
