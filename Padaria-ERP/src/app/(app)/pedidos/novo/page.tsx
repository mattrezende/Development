"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { OrderForm } from "@/components/orders/order-form"
import { ordersRepo } from "@/lib/repositories/orders.repo"
import { customersRepo } from "@/lib/repositories/customers.repo"
import { productsRepo } from "@/lib/repositories/products.repo"
import type { Customer, Product } from "@/lib/types/entities"
import type { OrderFormValues } from "@/lib/validations/order.schema"

export default function NovoPedidoPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[] | null>(null)
  const [products, setProducts] = useState<Product[] | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    customersRepo.list().then((all) => setCustomers(all.filter((c) => c.is_active)))
    productsRepo.list().then((all) => setProducts(all.filter((p) => p.is_active)))
  }, [])

  async function handleSubmit(values: OrderFormValues) {
    setSubmitting(true)
    try {
      await ordersRepo.create({
        customer_id: values.customer_id,
        delivery_date: values.delivery_date,
        notes: values.notes,
        items: values.items,
        recurrence: values.is_recurring
          ? { weekdays: values.recurrence_weekdays, until: values.recurrence_until! }
          : null,
      })
      toast.success(
        values.is_recurring ? "Pedido recorrente criado com sucesso" : "Pedido criado com sucesso"
      )
      router.push("/pedidos")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar pedido")
    } finally {
      setSubmitting(false)
    }
  }

  if (!customers || !products) return null

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Novo pedido</h1>
        <p className="text-muted-foreground text-sm">Cadastre um novo pedido</p>
      </div>
      <div className="max-w-3xl">
        <OrderForm
          customers={customers}
          products={products}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Criar pedido"
        />
      </div>
    </div>
  )
}
