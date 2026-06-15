import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Wallet, ArrowDownRight, ArrowUpRight, History } from 'lucide-react';

const FinancialDashboard = () => {
  return (
    <>
      <Helmet>
        <title>Financeiro - Personal</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden w-full">
          <Sidebar />
          <main className="flex-1 bg-secondary/20 overflow-y-auto p-6 md:p-8 w-full">
            <div className="w-full space-y-6">
              
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestão Financeira</h1>
                <p className="text-muted-foreground mt-1">Saldos, repasses e histórico de transações via Mercado Pago.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-elevation-3 p-6 bg-primary text-primary-foreground relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <p className="text-primary-foreground/80 font-medium uppercase text-sm mb-2">Saldo Disponível</p>
                  <h3 className="text-4xl font-extrabold">R$ 4.250,00</h3>
                  <div className="mt-6">
                    <button className="bg-background text-foreground px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-muted transition-colors">
                      Solicitar Saque
                    </button>
                  </div>
                </div>

                <div className="card-elevation-1 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-muted-foreground font-medium uppercase text-sm mb-2">A Receber (D+30)</p>
                      <h3 className="text-3xl font-bold text-foreground">R$ 1.840,00</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-warning" />
                    </div>
                  </div>
                </div>

                <div className="card-elevation-1 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-muted-foreground font-medium uppercase text-sm mb-2">Cancelados / Estornos</p>
                      <h3 className="text-3xl font-bold text-foreground">R$ 350,00</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <ArrowDownRight className="w-5 h-5 text-destructive" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-elevation-1 p-6 flex flex-col items-center justify-center min-h-[300px]">
                 <History className="w-12 h-12 text-muted-foreground/30 mb-4" />
                 <p className="text-lg font-medium text-foreground">Histórico de Transações</p>
                 <p className="text-muted-foreground text-sm mt-1">Módulo de sincronização bancária estará disponível em breve.</p>
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default FinancialDashboard;