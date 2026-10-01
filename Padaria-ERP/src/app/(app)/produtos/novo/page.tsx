"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ProductForm } from "@/components/products/product-form"
import { productsRepo } from "@/lib/repositories/products.repo"
import type { ProductFormValues } from "@/lib/validations/product.schema"

export default function NovoProdutoPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(values: ProductFormValues) {
    setSubmitting(true)
    try {
      await productsRepo.create(values)
      toast.success("Produto criado com sucesso")
      router.push("/produtos")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar produto")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Novo produto</h1>
        <p className="text-muted-foreground text-sm">Cadastre um novo produto da padaria</p>
      </div>
      <div className="max-w-2xl">
        <ProductForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Criar produto" />
      </div>
    </div>
  )
}
