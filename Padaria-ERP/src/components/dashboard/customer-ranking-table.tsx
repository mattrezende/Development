import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrencyBRL } from "@/lib/format"
import type { CustomerRankingRow } from "@/lib/repositories/dashboard.repo"

export function CustomerRankingTable({ data }: { data: CustomerRankingRow[] }) {
  if (data.length === 0) {
    return <p className="text-muted-foreground text-sm">Sem faturamento no período selecionado.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">#</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Pedidos</TableHead>
          <TableHead>Faturamento</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={row.customer_id}>
            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
            <TableCell className="font-medium">{row.customer_name}</TableCell>
            <TableCell>{row.orders_count}</TableCell>
            <TableCell>{formatCurrencyBRL(row.total_revenue)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
