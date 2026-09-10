"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { CustomerForm } from "@/components/customers/customer-form"
import { customersRepo } from "@/lib/repositories/customers.repo"
import type { CustomerFormValues } from "@/lib/validations/customer.schema"

export default function NovoClientePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(values: CustomerFormValues) {
    setSubmitting(true)
    try {
      await customersRepo.create(values)
      toast.success("Cliente criado com sucesso")
      router.push("/clientes")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar cliente")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Novo cliente</h1>
        <p className="text-muted-foreground text-sm">Cadastre um novo cliente</p>
      </div>
      <div className="max-w-2xl">
        <CustomerForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Criar cliente" />
      </div>
    </div>
  )
}
