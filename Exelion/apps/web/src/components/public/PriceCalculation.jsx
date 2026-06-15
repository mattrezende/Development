import React from 'react';
import { formatCurrency, statusToPtBR, useTranslation } from '@/lib/i18n.js';
import { Button } from '@/components/ui/button';
import { CheckCircle2, CalendarDays, DollarSign } from 'lucide-react';

const PriceCalculation = ({ 
  selectedSchedule, 
  pricingTable, 
  packageType, 
  setPackageType,
  onSubmit,
  isSubmitting,
  isValid,
  singleLessonPrice
}) => {
  const { t } = useTranslation();
  
  const applicablePricing = pricingTable.find(
    p => p.quantity === 1 && p.type === packageType
  );
  
  const price = packageType === 'avulso' 
    ? singleLessonPrice 
    : (applicablePricing ? applicablePricing.price : null);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden sticky top-8">
      <div className="p-6 border-b border-border bg-muted/20">
        <h2 className="text-xl font-bold tracking-tight">Resumo da Matrícula</h2>
        <p className="text-sm text-muted-foreground mt-1">Revise os dados antes de prosseguir</p>
      </div>

      <div className="p-6 space-y-6">
        {packageType === 'semanal' && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Horário Selecionado</h3>
            {selectedSchedule ? (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">
                    {t(statusToPtBR[selectedSchedule.day_of_week])}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {selectedSchedule.start_time} às {selectedSchedule.end_time}
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-md">
                    1x na semana
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-muted rounded-xl p-4 text-center border border-dashed border-border/60">
                <p className="text-sm text-muted-foreground">Nenhum horário selecionado.</p>
              </div>
            )}
          </div>
        )}

        {packageType === 'avulso' && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Aula Avulsa</h3>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">
                  Aula Individual
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Agendamento flexível
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Tipo de Pacote</h3>
          <div className="flex rounded-lg border border-border p-1 bg-muted/30">
            <button
              type="button"
              onClick={() => setPackageType('semanal')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                packageType === 'semanal' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Semanal
            </button>
            <button
              type="button"
              onClick={() => setPackageType('avulso')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                packageType === 'avulso' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Avulso
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex justify-between items-end mb-1">
            <h3 className="font-semibold text-foreground">Valor Total</h3>
            {price !== null && price !== undefined ? (
              <span className="text-3xl font-extrabold tracking-tight text-foreground">
                {formatCurrency(price)}
              </span>
            ) : (
              <span className="text-xl font-semibold text-muted-foreground">--</span>
            )}
          </div>
          {price !== null && price !== undefined && (
            <p className="text-sm text-right text-muted-foreground">
              {packageType === 'semanal' ? 'cobrado semanalmente' : 'pagamento único por aula'}
            </p>
          )}
          {(price === null || price === undefined) && (
            <p className="text-sm text-destructive text-right mt-1">Preço não configurado para este pacote.</p>
          )}
        </div>

        <Button 
          className="w-full py-6 text-lg shadow-md font-semibold" 
          size="lg"
          onClick={onSubmit}
          disabled={(packageType === 'semanal' && !selectedSchedule) || !isValid || isSubmitting || price === null || price === undefined}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              Processando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Confirmar Matrícula
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PriceCalculation;