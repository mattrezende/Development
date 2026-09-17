"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { todayIsoDate } from "@/lib/format"

export function NewPayableDialog({ onRegistered }: { onRegistered: () => void }) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setDescription("")
    setCategory("")
    setAmount("")
    setDueDate("")
    setNotes("")
  }

  async function handleSubmit() {
    const parsedAmount = Number(amount)
    if (!description || !parsedAmount || !dueDate) {
      toast.error("Preencha descrição, valor e vencimento")
      return
    }
    setSubmitting(true)
    try {
      await financeiroRepo.createPayable({
        description,
        category: category || null,
        amount: parsedAmount,
        due_date: dueDate,
        issued_at: todayIsoDate(),
        notes: notes || null,
      })
      toast.success("Conta a pagar lançada")
      reset()
      setOpen(false)
      onRegistered()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao lançar conta a pagar")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          Nova conta a pagar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lançar conta a pagar</DialogTitle>
          <DialogDescription>Ex: aluguel, salários, contas fixas</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Descrição</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Categoria</Label>
              <Input
                placeholder="aluguel, salários..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
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
          </div>
          <div className="grid gap-1.5">
            <Label>Vencimento</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Observações</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Salvando..." : "Lançar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
