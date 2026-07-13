"use client"

import type { Table } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function DataTablePagination<TData>({ table }: { table: Table<TData> }) {
  const pageCount = table.getPageCount()
  if (pageCount <= 1) return null

  return (
    <div className="flex items-center justify-between px-1 py-2">
      <p className="text-muted-foreground text-sm">
        Página {table.getState().pagination.pageIndex + 1} de {pageCount} —{" "}
        {table.getFilteredRowModel().rows.length} registro(s)
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próxima
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
