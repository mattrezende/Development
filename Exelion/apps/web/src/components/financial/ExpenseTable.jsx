import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ExpenseTable = ({ expenses, categoriesMap, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (!expenses?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
        Nenhuma despesa encontrada para este período.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => {
            const category = categoriesMap[expense.category_id];
            return (
              <TableRow key={expense.id}>
                <TableCell>{new Date(expense.date).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  {category ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                  ) : '-'}
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={expense.description}>
                  {expense.description || '-'}
                </TableCell>
                <TableCell className="text-right font-medium text-destructive">
                  R$ {expense.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(expense)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(expense.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExpenseTable;