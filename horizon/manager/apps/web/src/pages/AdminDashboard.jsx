
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Clock, DollarSign } from 'lucide-react';
import Header from '@/components/Header.jsx';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingTimesheets: 0,
    monthlyPayroll: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const employees = await pb.collection('employees').getFullList({ $autoCancel: false });
      const activeEmployees = employees.filter(emp => emp.status === 'active');
      
      const timesheets = await pb.collection('timesheets').getFullList({
        filter: 'status = "pending"',
        $autoCancel: false
      });

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const payroll = await pb.collection('payroll').getFullList({
        filter: `month = ${currentMonth} && year = ${currentYear}`,
        $autoCancel: false
      });

      const totalPayroll = payroll.reduce((sum, record) => sum + (record.net_salary || 0), 0);

      setStats({
        totalEmployees: employees.length,
        activeEmployees: activeEmployees.length,
        pendingTimesheets: timesheets.length,
        monthlyPayroll: totalPayroll
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total de Funcionários',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Funcionários Ativos',
      value: stats.activeEmployees,
      icon: UserCheck,
      color: 'bg-emerald-500'
    },
    {
      title: 'Pontos Pendentes',
      value: stats.pendingTimesheets,
      icon: Clock,
      color: 'bg-amber-500'
    },
    {
      title: 'Folha Mensal',
      value: `R$ ${stats.monthlyPayroll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard Admin - Sistema de Gestão de RH</title>
        <meta name="description" content="Dashboard administrativo do sistema de gestão de RH" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
            <p className="text-gray-600 mt-2">Visão geral do sistema de RH</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle>Acesso Rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href="/employees" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Gestão de Funcionários</p>
                      <p className="text-sm text-gray-600">Cadastrar e gerenciar funcionários</p>
                    </div>
                  </div>
                </a>
                <a href="/timesheets" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Aprovar Pontos</p>
                      <p className="text-sm text-gray-600">Revisar e aprovar registros de ponto</p>
                    </div>
                  </div>
                </a>
                <a href="/payroll" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Folha de Pagamento</p>
                      <p className="text-sm text-gray-600">Gerar e gerenciar folhas de pagamento</p>
                    </div>
                  </div>
                </a>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 pb-3 border-b border-gray-200">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Sistema iniciado</p>
                      <p className="text-xs text-gray-500">Pronto para uso</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 pb-3 border-b border-gray-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Dashboard carregado</p>
                      <p className="text-xs text-gray-500">Dados atualizados</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
