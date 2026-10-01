"use client"

import { useState } from "react"
import { toast } from "sonner"
import { HandCoins } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { financeiroRepo } from "@/lib/repositories/financeiro.repo"
import { formatCurrencyBRL, todayIsoDate } from "@/lib/format"
import type { PaymentMethod } from "@/lib/types/entities"

const methodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "pix", label: "Pix" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao", label: "Cartão" },
  { value: "transferencia", label: "Transferência" },
  { value: "boleto", label: "Boleto" },
]

interface PaymentDialogProps {
  receivableId?: string
  payableId?: string
  balance: number
  onRegistered: () => void
}

export function PaymentDialog({ receivableId, payableId, balance, onRegistered }: PaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(String(balance))
  const [paymentDate, setPaymentDate] = useState(todayIsoDate())
  const [method, setMethod] = useState<PaymentMethod>("pix")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    const parsed = Number(amount)
    if (!parsed || parsed <= 0) {
      toast.error("Informe um valor válido")
      return
    }
    setSubmitting(true)
    try {
      await financeiroRepo.registerPayment({
        receivable_id: receivableId,
        payable_id: payableId,
        amount: parsed,
        payment_date: paymentDate,
        method,
      })
      toast.success("Pagamento registrado")
      setOpen(false)
      onRegistered()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao registrar pagamento")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={(e) => e.stopPropagation()}>
          <HandCoins className="size-4" />
          Baixar
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
          <DialogDescription>Saldo em aberto: {formatCurrencyBRL(balance)}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Valor</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Data do pagamento</Label>
            <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Forma de pagamento</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {methodOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Registrando..." : "Registrar pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
