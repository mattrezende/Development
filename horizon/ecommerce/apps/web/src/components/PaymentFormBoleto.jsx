
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PaymentFormBoleto = ({ onSuccess, loading }) => {
  const { toast } = useToast();
  const mockBoletoNumber = "34191.09008 63571.277308 71444.640008 5 90000000015000";

  const handleCopy = () => {
    navigator.clipboard.writeText(mockBoletoNumber);
    toast({ title: "Copiado!", description: "Código do boleto copiado para a área de transferência." });
  };

  const handleSubmit = () => {
    onSuccess({ method: 'boleto', status: 'pending', details: { boletoNumber: mockBoletoNumber } });
  };

  return (
    <div className="space-y-4 border p-4 rounded-lg bg-card text-center">
      <div className="flex items-center justify-center gap-2 mb-2 text-primary">
        <FileText className="h-6 w-6" />
        <span className="font-medium text-lg">Boleto Bancário</span>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        O pagamento via boleto pode levar até 3 dias úteis para ser compensado.
      </p>

      <div className="bg-muted p-3 rounded flex items-center justify-between gap-2 break-all">
        <span className="font-mono text-sm">{mockBoletoNumber}</span>
        <Button variant="ghost" size="icon" onClick={handleCopy} title="Copiar código">
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      <Button onClick={handleSubmit} className="w-full mt-4" disabled={loading}>
        {loading ? 'Processando...' : 'Gerar Boleto e Finalizar'}
      </Button>
    </div>
  );
};

export default PaymentFormBoleto;
