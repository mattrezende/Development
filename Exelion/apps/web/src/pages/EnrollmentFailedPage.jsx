import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { XCircle, ArrowLeft, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EnrollmentFailedPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');

  return (
    <>
      <Helmet>
        <title>Pagamento Falhou - Personal</title>
      </Helmet>

      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          
          <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden text-center p-8">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-3">
              Pagamento não foi processado
            </h1>
            
            <p className="text-muted-foreground text-lg mb-6">
              Infelizmente não conseguimos confirmar o seu pagamento. O horário selecionado foi liberado novamente.
            </p>

            {reason && (
              <div className="bg-muted/50 rounded-xl p-4 mb-8 border border-border/50">
                <p className="text-sm font-medium text-foreground">Motivo:</p>
                <p className="text-sm text-muted-foreground mt-1">{reason}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button 
                size="lg" 
                onClick={() => navigate(-1)}
                className="w-full shadow-sm"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/')}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao início
              </Button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default EnrollmentFailedPage;