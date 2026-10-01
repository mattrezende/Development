"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { ProductForm } from "@/components/products/product-form"
import { RecipeEditor } from "@/components/products/recipe-editor"
import { productsRepo } from "@/lib/repositories/products.repo"
import type { Product } from "@/lib/types/entities"
import type { ProductFormValues } from "@/lib/validations/product.schema"

export default function EditarProdutoPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    productsRepo.get(params.id).then(setProduct)
  }, [params.id])

  async function handleSubmit(values: ProductFormValues) {
    setSubmitting(true)
    try {
      await productsRepo.update(params.id, values)
      toast.success("Produto atualizado com sucesso")
      router.push("/produtos")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar produto")
    } finally {
      setSubmitting(false)
    }
  }

  if (product === undefined) return null
  if (product === null) {
    return <p className="text-muted-foreground text-sm">Produto não encontrado.</p>
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Editar produto</h1>
        <p className="text-muted-foreground text-sm">{product.name}</p>
      </div>
      <div className="grid max-w-2xl gap-6">
        <ProductForm defaultValues={product} onSubmit={handleSubmit} submitting={submitting} />
        <RecipeEditor productId={product.id} productUnit={product.unit} />
      </div>
    </div>
  )
}
