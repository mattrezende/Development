import { z } from "zod"

export const weekdayOptions = [
  { value: "dom", label: "Dom" },
  { value: "seg", label: "Seg" },
  { value: "ter", label: "Ter" },
  { value: "qua", label: "Qua" },
  { value: "qui", label: "Qui" },
  { value: "sex", label: "Sex" },
  { value: "sab", label: "Sáb" },
] as const

export const customerSchema = z
  .object({
    name: z.string().min(2, "Informe o nome"),
    document: z.string().nullable(),
    document_type: z.enum(["CPF", "CNPJ"]).nullable(),
    phone: z.string().nullable(),
    address_street: z.string().nullable(),
    address_number: z.string().nullable(),
    address_neighborhood: z.string().nullable(),
    address_city: z.string().nullable(),
    address_state: z.string().nullable(),
    address_zip: z.string().nullable(),
    delivery_days: z.array(z.enum(["dom", "seg", "ter", "qua", "qui", "sex", "sab"])),
    payment_terms: z.enum(["a_vista", "prazo", "consolidado_mensal"]),
    payment_terms_days: z.number().min(0),
    is_active: z.boolean(),
  })
  .refine((data) => data.payment_terms !== "prazo" || data.payment_terms_days > 0, {
    message: "Informe os dias de prazo",
    path: ["payment_terms_days"],
  })

export type CustomerFormValues = z.infer<typeof customerSchema>
