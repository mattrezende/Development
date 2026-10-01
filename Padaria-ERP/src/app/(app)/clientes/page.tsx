"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { customerColumns } from "@/components/customers/columns"
import { customersRepo } from "@/lib/repositories/customers.repo"
import type { Customer } from "@/lib/types/entities"

export default function ClientesPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[] | null>(null)

  useEffect(() => {
    customersRepo.list().then(setCustomers)
  }, [])

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="text-muted-foreground text-sm">Cadastro de clientes da padaria</p>
      </div>

      {customers && (
        <DataTable
          columns={customerColumns}
          data={customers}
          searchColumnId="name"
          searchPlaceholder="Buscar por nome..."
          filters={[
            {
              columnId: "payment_terms",
              placeholder: "Pagamento",
              options: [
                { label: "À vista", value: "a_vista" },
                { label: "Prazo", value: "prazo" },
                { label: "Consolidado mensal", value: "consolidado_mensal" },
              ],
            },
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
              <Link href="/clientes/novo">
                <Plus className="size-4" />
                Novo cliente
              </Link>
            </Button>
          }
          onRowClick={(customer) => router.push(`/clientes/${customer.id}`)}
        />
      )}
    </div>
  )
}
