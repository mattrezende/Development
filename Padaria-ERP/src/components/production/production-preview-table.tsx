import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatQty } from "@/lib/format"
import type { ProductionPreviewRow } from "@/lib/repositories/production.repo"

export function ProductionPreviewTable({ rows }: { rows: ProductionPreviewRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Nenhum pedido confirmado para esta data de entrega.
      </p>
    )
  }

  const totalItems = rows.reduce((sum, r) => sum + r.total_quantity, 0)

  return (
    <div className="overflow-x-auto rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Quantidade a produzir</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.product_id}>
              <TableCell className="font-medium">{row.product_name}</TableCell>
              <TableCell>{formatQty(row.total_quantity, row.unit)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="border-t px-4 py-2 text-sm text-muted-foreground">
        {rows.length} produto(s) — {totalItems.toLocaleString("pt-BR")} itens no total
      </div>
    </div>
  )
}
