import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/i18n';

const EnrollmentPaymentForm = ({
  open,
  onOpenChange,
  totalAmount,
  studentName,
  studentEmail,
  teacherName,
  enrollmentType,
  quantity,
  initPoint,
}) => {
  const handlePay = () => {
    if (initPoint) {
      window.location.href = initPoint;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">Confirmar Pagamento</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-muted/40 rounded-xl p-4 border border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Aluno</span>
              <span className="font-medium text-foreground">{studentName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Professor</span>
              <span className="font-medium text-foreground">{teacherName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plano</span>
              <span className="font-medium text-foreground">
                {enrollmentType === 'avulso' ? `${quantity} aula(s) avulsa(s)` : `${quantity}x por semana`}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border/60">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-2xl font-extrabold text-primary">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Você será redirecionado ao Mercado Pago para concluir o pagamento com segurança. Um e-mail de
            confirmação será enviado para <span className="font-medium text-foreground">{studentEmail}</span>.
          </p>

          <Button className="w-full py-6 text-lg font-semibold shadow-md" disabled={!initPoint} onClick={handlePay}>
            <ExternalLink className="w-5 h-5 mr-2" />
            Pagar com Mercado Pago
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentPaymentForm;
