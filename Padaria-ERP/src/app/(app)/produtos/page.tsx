"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { buildProductColumns } from "@/components/products/columns"
import { productsRepo } from "@/lib/repositories/products.repo"
import type { Product } from "@/lib/types/entities"

export default function ProdutosPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    productsRepo.list().then(setProducts)
  }, [])

  async function handleToggleActive(product: Product) {
    const updated = await productsRepo.toggleActive(product.id)
    setProducts((prev) => prev?.map((p) => (p.id === updated.id ? updated : p)) ?? null)
    toast.success(updated.is_active ? "Produto ativado" : "Produto desativado")
  }

  const columns = useMemo(() => buildProductColumns(handleToggleActive), [])

  const categoryOptions = useMemo(() => {
    const categories = new Set((products ?? []).map((p) => p.category))
    return [...categories].sort().map((c) => ({ label: c, value: c }))
  }, [products])

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Produtos</h1>
          <p className="text-muted-foreground text-sm">Cadastro de produtos da padaria</p>
        </div>
      </div>

      {products && (
        <DataTable
          columns={columns}
          data={products}
          searchColumnId="name"
          searchPlaceholder="Buscar por nome..."
          filters={[
            { columnId: "category", placeholder: "Categoria", options: categoryOptions },
            {
              columnId: "is_active",
              placeholder: "Status",
              options: [
                { label: "Ativo", value: "ativo" },
                { label: "Inativo", value: "inativo" },
              ],
            },
          ]}
          actions={
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/produtos/novo">
                <Plus className="size-4" />
                Novo produto
              </Link>
            </Button>
          }
          onRowClick={(product) => router.push(`/produtos/${product.id}`)}
        />
      )}
    </div>
  )
}
