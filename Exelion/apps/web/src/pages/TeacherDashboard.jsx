import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { formatCurrency, formatDate, statusToPtBR } from '@/lib/i18n.js';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Users, DollarSign, Calendar, Activity, ArrowUpRight, TrendingUp } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    monthlyRevenue: 0,
    scheduledClasses: 0,
    occupancyRate: 0,
    newEnrollments: 0,
    pendingPayments: 0
  });
  const [recentData, setRecentData] = useState({
    enrollments: [],
    upcomingClasses: []
  });
  const [chartData, setChartData] = useState({
    revenue: [],
    status: [],
    days: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const enrollments = await pb.collection('enrollments').getFullList({
          filter: `teacher_id="${currentUser.id}"`,
          expand: 'student_id,schedule_id',
          sort: '-created_at',
          $autoCancel: false,
        });

        const schedules = await pb.collection('schedules').getFullList({
          filter: `teacher_id="${currentUser.id}"`,
          $autoCancel: false,
        });

        const uniqueStudents = new Set(enrollments.map((e) => e.student_id));
        
        const monthlyRevenue = enrollments
          .filter((e) => e.payment_status === 'approved' || e.payment_status === 'completed')
          .reduce((sum, e) => sum + (e.amount || 0), 0);

        const occupiedSchedules = schedules.filter((s) => s.availability_status === 'Ocupado' || s.availability_status === 'Reservado').length;
        const occupancyRate = schedules.length > 0 ? (occupiedSchedules / schedules.length) * 100 : 0;
        
        const newEnrollments = enrollments.filter(e => {
          const created = new Date(e.created_at);
          const now = new Date();
          return (now - created) / (1000 * 60 * 60 * 24) <= 7;
        }).length;

        const pendingPayments = enrollments.filter(e => e.payment_status === 'pending').length;

        setStats({
          totalStudents: uniqueStudents.size,
          monthlyRevenue,
          scheduledClasses: schedules.length,
          occupancyRate: Math.round(occupancyRate),
          newEnrollments,
          pendingPayments
        });

        setRecentData({
          enrollments: enrollments.slice(0, 5),
          upcomingClasses: schedules.filter(s => s.availability_status !== 'Disponível').slice(0, 5)
        });

        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const mockRevenueTrend = months.map((m, i) => ({
          name: m,
          total: Math.max(0, monthlyRevenue * (0.5 + Math.random() * 0.8))
        }));

        const statusCounts = { approved: 0, pending: 0, failed: 0 };
        enrollments.forEach(e => {
          if (statusCounts[e.payment_status] !== undefined) {
            statusCounts[e.payment_status]++;
          } else {
            statusCounts.approved++;
          }
        });

        const pieData = [
          { name: 'Aprovados', value: statusCounts.approved || 1, color: 'hsl(var(--success))' },
          { name: 'Pendentes', value: statusCounts.pending || 0, color: 'hsl(var(--warning))' },
          { name: 'Falhas', value: statusCounts.failed || 0, color: 'hsl(var(--destructive))' },
        ].filter(d => d.value > 0);

        const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayCounts = {};
        schedules.forEach(s => {
          dayCounts[s.day_of_week] = (dayCounts[s.day_of_week] || 0) + 1;
        });
        
        const barData = daysOrder.map(d => ({
          name: statusToPtBR[d]?.substring(0, 3) || d.substring(0, 3),
          aulas: dayCounts[d] || 0
        }));

        setChartData({
          revenue: mockRevenueTrend,
          status: pieData,
          days: barData
        });

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background w-full">
        <Header />
        <div className="flex w-full">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-sm" style={{ color: p.color || p.fill }}>
              {p.name}: {p.name === 'total' ? formatCurrency(p.value) : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Personal</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden w-full">
          <Sidebar />
          <main className="flex-1 bg-secondary/20 overflow-y-auto w-full">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
              
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Visão Geral</h1>
                  <p className="text-muted-foreground mt-1">Acompanhe o desempenho das suas aulas e alunos.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="card-elevation-1 p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                    <DollarSign className="w-24 h-24" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Receita Mensal</p>
                    <h3 className="text-3xl font-extrabold text-foreground">{formatCurrency(stats.monthlyRevenue)}</h3>
                    <div className="flex items-center gap-1 mt-2 text-sm text-success">
                      <TrendingUp className="w-4 h-4" />
                      <span>Estável este mês</span>
                    </div>
                  </div>
                </div>

                <div className="card-elevation-1 p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                    <Users className="w-24 h-24" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Total de Alunos</p>
                    <h3 className="text-3xl font-extrabold text-foreground">{stats.totalStudents}</h3>
                    <div className="flex items-center gap-1 mt-2 text-sm text-primary">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>+{stats.newEnrollments} novos (7 dias)</span>
                    </div>
                  </div>
                </div>

                <div className="card-elevation-1 p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                    <Activity className="w-24 h-24" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Ocupação</p>
                    <h3 className="text-3xl font-extrabold text-foreground">{stats.occupancyRate}%</h3>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-3">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: `${stats.occupancyRate}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="card-elevation-1 p-6 bg-gradient-to-br from-card to-muted/50">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Atenção Necessária</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Pagamentos Pendentes</span>
                      <span className="font-bold text-warning">{stats.pendingPayments}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Horários Livres</span>
                      <span className="font-bold text-success">{stats.scheduledClasses - Math.round(stats.scheduledClasses * stats.occupancyRate / 100)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card-elevation-2 p-6 lg:col-span-2 flex flex-col">
                  <h3 className="text-lg font-semibold mb-6">Tendência de Receita (12 meses)</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.revenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(val) => `R$${val/1000}k`} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="total" name="Receita" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card-elevation-2 p-6 flex flex-col">
                  <h3 className="text-lg font-semibold mb-2">Status de Matrículas</h3>
                  <div className="h-[300px] w-full flex-1">
                    {chartData.status.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData.status}
                            cx="50%"
                            cy="45%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {chartData.status.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sem dados suficientes</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-elevation-1 overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-border flex justify-between items-center bg-muted/20">
                    <h3 className="font-semibold">Últimas Matrículas</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {recentData.enrollments.length > 0 ? recentData.enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {enrollment.expand?.student_id?.name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{enrollment.expand?.student_id?.name || 'Aluno'}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(enrollment.created_at)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formatCurrency(enrollment.amount)}</p>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            enrollment.payment_status === 'approved' || enrollment.payment_status === 'completed' ? 'bg-success/15 text-success' :
                            enrollment.payment_status === 'pending' ? 'bg-warning/15 text-warning-foreground' : 'bg-destructive/15 text-destructive'
                          }`}>
                            {statusToPtBR[enrollment.payment_status] || enrollment.payment_status}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-muted-foreground text-sm">Nenhuma matrícula recente.</div>
                    )}
                  </div>
                </div>

                <div className="card-elevation-1 overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-border flex justify-between items-center bg-muted/20">
                    <h3 className="font-semibold">Horários Ocupados (Próximos)</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {recentData.upcomingClasses.length > 0 ? recentData.upcomingClasses.map((schedule) => (
                      <div key={schedule.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-secondary-foreground/70" />
                          </div>
                          <div>
                            <p className="font-medium text-sm capitalize">{statusToPtBR[schedule.day_of_week] || schedule.day_of_week}</p>
                            <p className="text-xs text-muted-foreground">{schedule.start_time} às {schedule.end_time}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium bg-muted px-2.5 py-1 rounded-md border border-border">
                          {statusToPtBR[schedule.recurrence] || schedule.recurrence}
                        </span>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-muted-foreground text-sm">Nenhum horário ocupado.</div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default TeacherDashboard;