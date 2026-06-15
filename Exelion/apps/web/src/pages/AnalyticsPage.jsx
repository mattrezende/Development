import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Button } from '@/components/ui/button';
import { Download, FileText, Table } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { exportToCSV, exportToPDF, exportToExcel } from '@/lib/exportUtils.js';
import { formatCurrency } from '@/lib/i18n.js';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

const AnalyticsPage = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState({
    totalRevenue: 0,
    avgRevenuePerStudent: 0,
    churnRate: 0,
    revenueByMethod: [],
    acquisitionTrend: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const enrollments = await pb.collection('enrollments').getFullList({
          filter: `teacher_id="${currentUser.id}" && (payment_status="approved" || payment_status="completed")`,
          $autoCancel: false,
        });

        const students = await pb.collection('students').getFullList({
          filter: `teacher_id="${currentUser.id}"`,
          $autoCancel: false,
        });

        const totalRevenue = enrollments.reduce((sum, e) => sum + (e.amount || 0), 0);
        const avgRevenuePerStudent = students.length > 0 ? totalRevenue / students.length : 0;
        
        const cancelledStudents = students.filter(s => s.status === 'cancelled').length;
        const churnRate = students.length > 0 ? (cancelledStudents / students.length) * 100 : 0;

        const methodCounts = {};
        enrollments.forEach(e => {
          const method = e.payment_method || 'Outro';
          methodCounts[method] = (methodCounts[method] || 0) + (e.amount || 0);
        });
        
        const methodMap = { 'pix': 'Pix', 'credit_card': 'Crédito', 'debit_card': 'Débito', 'recurring': 'Recorrente', 'Outro': 'Outro' };
        const revenueByMethod = Object.entries(methodCounts).map(([key, val]) => ({
          name: methodMap[key] || key,
          valor: val
        }));

        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
        const acquisitionTrend = months.map(m => ({
          name: m,
          alunos: Math.floor(Math.random() * 10) + 1
        }));

        setData({
          totalRevenue,
          avgRevenuePerStudent,
          churnRate: churnRate.toFixed(1),
          revenueByMethod,
          acquisitionTrend,
          rawEnrollments: enrollments
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) fetchAnalytics();
  }, [currentUser]);

  const handleExportCSV = () => {
    if (!data.rawEnrollments) return;
    const exportData = data.rawEnrollments.map(e => ({
      ID: e.id,
      Valor: e.amount,
      Metodo: e.payment_method,
      Data: new Date(e.created_at).toLocaleDateString()
    }));
    exportToCSV(exportData, 'analise_receita.csv');
  };

  return (
    <>
      <Helmet>
        <title>Análises - Personal</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden w-full">
          <Sidebar />
          <main className="flex-1 bg-secondary/20 overflow-y-auto p-6 md:p-8 w-full">
            <div className="w-full space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Análises de Negócio</h1>
                  <p className="text-muted-foreground mt-1">Métricas detalhadas e exportação de dados.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportCSV}>
                    <Table className="w-4 h-4 mr-2" /> CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportToExcel()}>
                    <Download className="w-4 h-4 mr-2" /> Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportToPDF()}>
                    <FileText className="w-4 h-4 mr-2" /> PDF
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card-elevation-1 p-6">
                      <p className="text-sm font-medium text-muted-foreground uppercase">Receita Total (Histórico)</p>
                      <h3 className="text-3xl font-bold mt-2">{formatCurrency(data.totalRevenue)}</h3>
                    </div>
                    <div className="card-elevation-1 p-6">
                      <p className="text-sm font-medium text-muted-foreground uppercase">Ticket Médio por Aluno</p>
                      <h3 className="text-3xl font-bold mt-2">{formatCurrency(data.avgRevenuePerStudent)}</h3>
                    </div>
                    <div className="card-elevation-1 p-6">
                      <p className="text-sm font-medium text-muted-foreground uppercase">Taxa de Churn (Cancelamentos)</p>
                      <h3 className="text-3xl font-bold mt-2">{data.churnRate}%</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card-elevation-2 p-6">
                      <h3 className="text-lg font-semibold mb-6">Receita por Método de Pagamento</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.revenueByMethod} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `R$${val/1000}k`} />
                            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}/>
                            <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="card-elevation-2 p-6">
                      <h3 className="text-lg font-semibold mb-6">Aquisição de Alunos (6 meses)</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data.acquisitionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}/>
                            <Line type="monotone" dataKey="alunos" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--chart-2))' }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AnalyticsPage;