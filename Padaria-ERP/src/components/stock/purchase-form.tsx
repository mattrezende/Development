"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { purchaseSchema, type PurchaseFormValues } from "@/lib/validations/purchase.schema"
import { formatCurrencyBRL } from "@/lib/format"
import type { Ingredient } from "@/lib/types/entities"

interface PurchaseFormProps {
  ingredients: Ingredient[]
  defaultValues?: Partial<PurchaseFormValues>
  onSubmit: (values: PurchaseFormValues) => Promise<void> | void
  submitting?: boolean
  submitLabel?: string
}

export function PurchaseForm({
  ingredients,
  defaultValues,
  onSubmit,
  submitting,
  submitLabel = "Salvar",
}: PurchaseFormProps) {
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplier: "",
      purchase_date: "",
      payment_due_days: 0,
      notes: "",
      items: [{ ingredient_id: "", quantity: 1, unit_cost: 0 }],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })
  const items = form.watch("items")
  const total = items.reduce((sum, item) => sum + item.quantity * item.unit_cost, 0)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados da compra</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchase_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da compra</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_due_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo de pagamento (dias)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} value={field.value ?? ""} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Itens da compra</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 items-end gap-2">
                <FormField
                  control={form.control}
                  name={`items.${index}.ingredient_id`}
                  render={({ field: ingredientField }) => (
                    <FormItem className="col-span-12 sm:col-span-5">
                      {index === 0 && <FormLabel>Insumo</FormLabel>}
                      <Select value={ingredientField.value} onValueChange={ingredientField.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ingredients.map((i) => (
                            <SelectItem key={i.id} value={i.id}>
                              {i.name} ({i.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field: qtyField }) => (
                    <FormItem className="col-span-5 sm:col-span-2">
                      {index === 0 && <FormLabel>Quantidade</FormLabel>}
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          min="0"
                          {...qtyField}
                          onChange={(e) => qtyField.onChange(e.target.valueAsNumber || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.unit_cost`}
                  render={({ field: costField }) => (
                    <FormItem className="col-span-5 sm:col-span-2">
                      {index === 0 && <FormLabel>Custo unit.</FormLabel>}
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...costField}
                          onChange={(e) => costField.onChange(e.target.valueAsNumber || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-1 flex h-9 items-center text-sm text-muted-foreground">
                  {formatCurrencyBRL((items[index]?.quantity || 0) * (items[index]?.unit_cost || 0))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="col-span-1"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit gap-1.5"
              onClick={() => append({ ingredient_id: "", quantity: 1, unit_cost: 0 })}
            >
              <Plus className="size-4" />
              Adicionar item
            </Button>
            <div className="flex justify-end border-t pt-3 text-sm font-medium">
              Total: {formatCurrencyBRL(total)}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Salvando..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
