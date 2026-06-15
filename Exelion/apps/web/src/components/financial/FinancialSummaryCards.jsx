import React from 'react';
import { ArrowDownRight, ArrowUpRight, DollarSign, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const FinancialSummaryCards = ({ totalExpenses, totalRevenue, netProfit, highestCategory, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-6 rounded-xl border bg-card shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Receita Total</p>
            <h3 className="text-2xl font-bold text-foreground">R$ {totalRevenue.toFixed(2)}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl border bg-card shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Despesas Totais</p>
            <h3 className="text-2xl font-bold text-foreground">R$ {totalExpenses.toFixed(2)}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5 text-destructive" />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl border bg-card shadow-sm relative overflow-hidden">
        <div className={`absolute inset-0 opacity-5 ${netProfit >= 0 ? 'bg-emerald-500' : 'bg-destructive'}`}></div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Lucro Líquido</p>
            <h3 className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
              R$ {netProfit.toFixed(2)}
            </h3>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${netProfit >= 0 ? 'bg-emerald-500/10' : 'bg-destructive/10'}`}>
            <DollarSign className={`w-5 h-5 ${netProfit >= 0 ? 'text-emerald-500' : 'text-destructive'}`} />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl border bg-card shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Maior Despesa</p>
            <h3 className="text-lg font-bold text-foreground truncate max-w-[120px]" title={highestCategory?.name || 'N/A'}>
              {highestCategory?.name || '-'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {highestCategory ? `R$ ${highestCategory.amount.toFixed(2)}` : 'R$ 0.00'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryCards;