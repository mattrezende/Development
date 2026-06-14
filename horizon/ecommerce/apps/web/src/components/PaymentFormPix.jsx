
import React from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PaymentFormPix = ({ onSuccess, loading }) => {
  const { toast } = useToast();
  const mockPixKey = "00020126580014br.gov.bcb.pix0136mock-pix-key-1234-5678-90ab-cdef5204000053039865802BR5903986600910.006207MOCKPIX63041234";

  const handleCopy = () => {
    navigator.clipboard.writeText(mockPixKey);
    toast({ title: "Copiado!", description: "Chave PIX copiada para a área de transferência." });
  };

  const handleSubmit = () => {
    onSuccess({ method: 'pix', status: 'pending', details: { pixKey: mockPixKey } });
  };

  return (
    <div className="space-y-4 border p-4 rounded-lg bg-card text-center flex flex-col items-center">
      <div className="flex items-center justify-center gap-2 mb-2 text-primary">
        <QrCode className="h-6 w-6" />
        <span className="font-medium text-lg">Pagamento via PIX</span>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Escaneie o QR Code ou copie a chave PIX abaixo. A aprovação é imediata.
      </p>

      <div className="w-48 h-48 bg-white p-2 rounded-lg border flex items-center justify-center mb-4">
        {/* Mock QR Code visual */}
        <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=mockpix')] bg-contain bg-no-repeat bg-center opacity-80"></div>
      </div>

      <div className="w-full bg-muted p-3 rounded flex items-center justify-between gap-2">
        <span className="font-mono text-xs truncate">{mockPixKey.substring(0, 30)}...</span>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="flex-shrink-0">
          <Copy className="h-4 w-4 mr-2" /> Copiar
        </Button>
      </div>

      <Button onClick={handleSubmit} className="w-full mt-4" disabled={loading}>
        {loading ? 'Processando...' : 'Confirmar Pagamento PIX'}
      </Button>
    </div>
  );
};

export default PaymentFormPix;
