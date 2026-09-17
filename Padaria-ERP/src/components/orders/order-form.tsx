"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  orderSchema,
  weekdayCheckboxOptions,
  type OrderFormValues,
} from "@/lib/validations/order.schema"
import { formatCurrencyBRL } from "@/lib/format"
import type { Customer, Product } from "@/lib/types/entities"

interface OrderFormProps {
  customers: Customer[]
  products: Product[]
  defaultValues?: Partial<OrderFormValues>
  onSubmit: (values: OrderFormValues) => Promise<void> | void
  submitting?: boolean
  submitLabel?: string
  allowRecurrence?: boolean
}

export function OrderForm({
  customers,
  products,
  defaultValues,
  onSubmit,
  submitting,
  submitLabel = "Salvar",
  allowRecurrence = true,
}: OrderFormProps) {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_id: "",
      delivery_date: "",
      notes: "",
      items: [{ product_id: "", quantity: 1, unit_price: 0 }],
      is_recurring: false,
      recurrence_weekdays: [],
      recurrence_until: null,
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })
  const items = form.watch("items")
  const isRecurring = form.watch("is_recurring")
  const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  function productOptionsFor(index: number) {
    return products.filter((p) => p.is_active || p.id === items[index]?.product_id)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do pedido</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
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
              name="delivery_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de entrega</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
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
            <CardTitle className="text-base">Itens do pedido</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 items-end gap-2">
                <FormField
                  control={form.control}
                  name={`items.${index}.product_id`}
                  render={({ field: productField }) => (
                    <FormItem className="col-span-12 sm:col-span-5">
                      {index === 0 && <FormLabel>Produto</FormLabel>}
                      <Select
                        value={productField.value}
                        onValueChange={(value) => {
                          productField.onChange(value)
                          const product = products.find((p) => p.id === value)
                          if (product) form.setValue(`items.${index}.unit_price`, product.sale_price)
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productOptionsFor(index).map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
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
                  name={`items.${index}.unit_price`}
                  render={({ field: priceField }) => (
                    <FormItem className="col-span-5 sm:col-span-2">
                      {index === 0 && <FormLabel>Preço unit.</FormLabel>}
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...priceField}
                          onChange={(e) => priceField.onChange(e.target.valueAsNumber || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-1 flex h-9 items-center text-sm text-muted-foreground">
                  {formatCurrencyBRL((items[index]?.quantity || 0) * (items[index]?.unit_price || 0))}
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
              onClick={() => append({ product_id: "", quantity: 1, unit_price: 0 })}
            >
              <Plus className="size-4" />
              Adicionar item
            </Button>
            <div className="flex justify-end border-t pt-3 text-sm font-medium">
              Total: {formatCurrencyBRL(total)}
            </div>
          </CardContent>
        </Card>

        {allowRecurrence && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recorrência</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="is_recurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                    <FormLabel className="cursor-pointer">
                      Pedido recorrente (repete em dias úteis/semana)
                    </FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              {isRecurring && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="recurrence_weekdays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dias da semana</FormLabel>
                        <div className="flex flex-wrap gap-3">
                          {weekdayCheckboxOptions.map((day) => (
                            <label key={day.value} className="flex items-center gap-1.5 text-sm">
                              <Checkbox
                                checked={field.value.includes(day.value)}
                                onCheckedChange={(checked) => {
                                  field.onChange(
                                    checked
                                      ? [...field.value, day.value]
                                      : field.value.filter((d: number) => d !== day.value)
                                  )
                                }}
                              />
                              {day.label}
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="recurrence_until"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repetir até</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Salvando..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
