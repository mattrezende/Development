"use client"

import type { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface DataTableFilterOption {
  label: string
  value: string
}

export interface DataTableFilter {
  columnId: string
  placeholder: string
  options: DataTableFilterOption[]
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchColumnId?: string
  searchPlaceholder?: string
  filters?: DataTableFilter[]
  actions?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  searchColumnId,
  searchPlaceholder = "Buscar...",
  filters = [],
  actions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {searchColumnId && (
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchColumnId)?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn(searchColumnId)?.setFilterValue(e.target.value)}
            className="h-9 w-full sm:w-56"
          />
        )}
        {filters.map((filter) => (
          <Select
            key={filter.columnId}
            value={(table.getColumn(filter.columnId)?.getFilterValue() as string) ?? "__all__"}
            onValueChange={(value) =>
              table.getColumn(filter.columnId)?.setFilterValue(value === "__all__" ? undefined : value)
            }
          >
            <SelectTrigger className="h-9 w-full sm:w-44">
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{filter.placeholder}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={() => table.resetColumnFilters()} className="gap-1">
            <X className="size-3.5" />
            Limpar
          </Button>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
