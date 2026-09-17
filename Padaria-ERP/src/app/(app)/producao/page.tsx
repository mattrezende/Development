"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ProductionPreviewTable } from "@/components/production/production-preview-table"
import { productionRepo, type ProductionPreviewRow } from "@/lib/repositories/production.repo"
import { formatDateBR, todayIsoDate, addDaysToIsoDate } from "@/lib/format"
import type { ProductionBatch } from "@/lib/types/entities"

const batchStatusLabel: Record<ProductionBatch["status"], string> = {
  aberta: "Aberta",
  fechada: "Fechada",
  cancelada: "Cancelada",
}

export default function ProducaoPage() {
  const router = useRouter()
  const [deliveryDate, setDeliveryDate] = useState(addDaysToIsoDate(todayIsoDate(), 1))
  const [preview, setPreview] = useState<ProductionPreviewRow[] | null>(null)
  const [confirmedCount, setConfirmedCount] = useState(0)
  const [batches, setBatches] = useState<
    (ProductionBatch & { productCount: number; orderCount: number })[] | null
  >(null)
  const [closing, setClosing] = useState(false)

  const loadPreview = useCallback(async (date: string) => {
    const [rows, count] = await Promise.all([
      productionRepo.previewProduction(date),
      productionRepo.countConfirmedOrders(date),
    ])
    setPreview(rows)
    setConfirmedCount(count)
  }, [])

  const loadBatches = useCallback(async () => {
    const list = await productionRepo.listBatches()
    const enriched = await Promise.all(
      list.map(async (batch) => {
        const [items, orders] = await Promise.all([
          productionRepo.listBatchItems(batch.id),
          productionRepo.listBatchOrders(batch.id),
        ])
        return { ...batch, productCount: items.length, orderCount: orders.length }
      })
    )
    setBatches(enriched)
  }, [])

  useEffect(() => {
    loadPreview(deliveryDate)
  }, [deliveryDate, loadPreview])

  useEffect(() => {
    loadBatches()
  }, [loadBatches])

  async function handleCloseBatch() {
    setClosing(true)
    try {
      const batch = await productionRepo.getOrCreateOpenBatch(deliveryDate)
      const closed = await productionRepo.closeProductionBatch(batch.id)
      toast.success("Remessa fechada com sucesso")
      router.push(`/producao/${closed.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao fechar remessa")
    } finally {
      setClosing(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Produção</h1>
        <p className="text-muted-foreground text-sm">
          Consolide os pedidos confirmados e feche a remessa de produção do dia
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prévia da remessa</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="delivery-date">Data de entrega</Label>
              <Input
                id="delivery-date"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-48"
              />
            </div>
            <p className="text-muted-foreground pb-2 text-sm">
              {confirmedCount} pedido(s) confirmado(s) para {formatDateBR(deliveryDate)}
            </p>
          </div>

          {preview && <ProductionPreviewTable rows={preview} />}

          <div className="flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={!preview || preview.length === 0 || closing}>
                  Fechar remessa
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Fechar remessa de produção?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Os pedidos confirmados para {formatDateBR(deliveryDate)} serão marcados como
                    &quot;em produção&quot; e o estoque de insumos será baixado conforme a ficha
                    técnica dos produtos. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCloseBatch}>Fechar remessa</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de remessas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Pedidos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches?.length ? (
                  batches.map((batch) => (
                    <TableRow
                      key={batch.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/producao/${batch.id}`)}
                    >
                      <TableCell>{formatDateBR(batch.delivery_date)}</TableCell>
                      <TableCell>
                        <Badge variant={batch.status === "fechada" ? "success" : "outline"}>
                          {batchStatusLabel[batch.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{batch.productCount}</TableCell>
                      <TableCell>{batch.orderCount}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                      Nenhuma remessa registrada ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
