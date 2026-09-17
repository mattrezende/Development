"use client"

import { useEffect, useState } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { financeiroRepo, type ProductMargin } from "@/lib/repositories/financeiro.repo"
import { formatCurrencyBRL } from "@/lib/format"
import { chartColors } from "@/lib/chart-colors"

export default function MargemPorProdutoPage() {
  const [margins, setMargins] = useState<ProductMargin[] | null>(null)

  useEffect(() => {
    financeiroRepo.getProductMargins().then(setMargins)
  }, [])

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Margem por Produto</h1>
        <p className="text-muted-foreground text-sm">
          Custo real (ficha técnica × custo médio dos insumos) comparado ao preço de venda
        </p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Preço de venda</TableHead>
                <TableHead>Custo estimado</TableHead>
                <TableHead>Custo real (ficha técnica)</TableHead>
                <TableHead>Margem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {margins?.length ? (
                margins.map((m) => (
                  <TableRow key={m.product_id}>
                    <TableCell className="font-medium">{m.product_name}</TableCell>
                    <TableCell>{formatCurrencyBRL(m.sale_price)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatCurrencyBRL(m.estimated_cost)}
                    </TableCell>
                    <TableCell>{m.real_cost > 0 ? formatCurrencyBRL(m.real_cost) : "sem ficha técnica"}</TableCell>
                    <TableCell>
                      {m.margin_pct !== null ? (
                        <span
                          className="font-medium"
                          style={{
                            color:
                              m.margin_pct < 20
                                ? chartColors.critical
                                : m.margin_pct < 40
                                  ? chartColors.warning
                                  : chartColors.good,
                          }}
                        >
                          {formatCurrencyBRL(m.margin_amount)} ({m.margin_pct.toFixed(1)}%)
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhum produto ativo encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
