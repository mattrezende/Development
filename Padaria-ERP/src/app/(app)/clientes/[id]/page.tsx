"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { CustomerForm } from "@/components/customers/customer-form"
import { OrderHistoryTable } from "@/components/customers/order-history-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { customersRepo } from "@/lib/repositories/customers.repo"
import type { Customer, Order } from "@/lib/types/entities"
import type { CustomerFormValues } from "@/lib/validations/customer.schema"

export default function EditarClientePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<Customer | null | undefined>(undefined)
  const [orders, setOrders] = useState<Order[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    customersRepo.get(params.id).then(setCustomer)
    customersRepo.getOrderHistory(params.id).then(setOrders)
  }, [params.id])

  async function handleSubmit(values: CustomerFormValues) {
    setSubmitting(true)
    try {
      await customersRepo.update(params.id, values)
      toast.success("Cliente atualizado com sucesso")
      router.push("/clientes")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar cliente")
    } finally {
      setSubmitting(false)
    }
  }

  if (customer === undefined) return null
  if (customer === null) {
    return <p className="text-muted-foreground text-sm">Cliente não encontrado.</p>
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Editar cliente</h1>
        <p className="text-muted-foreground text-sm">{customer.name}</p>
      </div>
      <div className="grid max-w-2xl gap-6">
        <CustomerForm defaultValues={customer} onSubmit={handleSubmit} submitting={submitting} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Histórico de pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderHistoryTable orders={orders} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
