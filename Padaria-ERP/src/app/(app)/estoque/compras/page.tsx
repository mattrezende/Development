"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { purchaseColumns, purchaseStatusLabel } from "@/components/stock/purchase-columns"
import { purchasesRepo } from "@/lib/repositories/purchases.repo"
import type { Purchase } from "@/lib/types/entities"

export default function ComprasPage() {
  const router = useRouter()
  const [purchases, setPurchases] = useState<Purchase[] | null>(null)

  useEffect(() => {
    purchasesRepo.list().then(setPurchases)
  }, [])

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Compras</h1>
        <p className="text-muted-foreground text-sm">Compras de insumos e recebimento</p>
      </div>

      {purchases && (
        <DataTable
          columns={purchaseColumns}
          data={purchases}
          filters={[
            {
              columnId: "status",
              placeholder: "Status",
              options: Object.entries(purchaseStatusLabel).map(([value, label]) => ({ value, label })),
            },
          ]}
          actions={
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/estoque/compras/novo">
                <Plus className="size-4" />
                Nova compra
              </Link>
            </Button>
          }
          onRowClick={(purchase) => router.push(`/estoque/compras/${purchase.id}`)}
        />
      )}
    </div>
  )
}
