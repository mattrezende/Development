import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Button } from '@/components/ui/button';
import { FileText, FileBarChart, Users, CalendarDays, Wallet } from 'lucide-react';
import { exportToCSV, exportToPDF } from '@/lib/exportUtils.js';

const ReportsPage = () => {
  
  const reports = [
    {
      id: 'revenue',
      title: 'Relatório Mensal de Receita',
      description: 'Total por mês, divisão por plano e método de pagamento.',
      icon: Wallet,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      id: 'students',
      title: 'Relatório de Alunos',
      description: 'Alunos ativos, inativos, retenção e histórico de matrículas.',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      id: 'schedules',
      title: 'Ocupação de Horários',
      description: 'Análise de capacidade, horários mais procurados e ociosidade.',
      icon: CalendarDays,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      id: 'payments',
      title: 'Status de Pagamentos',
      description: 'Transações aprovadas, falhas, estornos e pendências ativas.',
      icon: FileBarChart,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Relatórios - Personal</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden w-full">
          <Sidebar />
          <main className="flex-1 bg-secondary/20 overflow-y-auto p-6 md:p-8 w-full">
            <div className="w-full space-y-6">
              
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Central de Relatórios</h1>
                <p className="text-muted-foreground mt-1">Gere e exporte relatórios consolidados do seu negócio.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {reports.map((report) => {
                  const Icon = report.icon;
                  return (
                    <div key={report.id} className="card-elevation-1 p-6 flex flex-col h-full group transition-all hover:shadow-md">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${report.bg}`}>
                          <Icon className={`w-6 h-6 ${report.color}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{report.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-6 flex gap-3">
                        <Button variant="secondary" className="flex-1" onClick={() => exportToCSV([], report.id + '.csv')}>
                          Gerar CSV
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => exportToPDF()}>
                          <FileText className="w-4 h-4 mr-2" /> PDF
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default ReportsPage;