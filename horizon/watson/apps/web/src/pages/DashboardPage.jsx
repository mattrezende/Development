
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Calendar, Clock, Target, TrendingUp } from 'lucide-react';
import Sidebar from '@/components/Sidebar.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    currentCycle: null,
    weeklyHours: 0,
    completionRate: 0,
    upcomingSessions: [],
  });

  useEffect(() => {
    if (currentUser?.id) {
      fetchDashboardData();
    }
  }, [currentUser?.id]);

  const fetchDashboardData = async () => {
    try {
      const [cycles, schedules] = await Promise.all([
        pb.collection('studyCycles').getFullList({
          filter: `userId = "${currentUser.id}" && status = "active"`,
          sort: '-createdAt',
          $autoCancel: false,
        }),
        pb.collection('studySchedule').getFullList({
          filter: `userId = "${currentUser.id}"`,
          $autoCancel: false,
        }),
      ]);

      const currentCycle = cycles[0] || null;
      
      // Filter only active study blocks
      const studySlots = schedules.filter(s => s.slotType === 'Estudo');
      
      // FIX: Each block represents exactly 0.5 hours visually, matching RotinaPage logic.
      // We ignore the DB 'duration' field here because it might be saved as 1 due to schema constraints.
      const totalWeeklyHours = studySlots.length * 0.5;

      const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
      const upcomingSessions = daysOfWeek.slice(0, 3).map(day => {
        const daySessions = studySlots.filter(s => s.dayOfWeek === day);
        return {
          day,
          sessions: daySessions.length,
          // FIX: Apply the same 0.5h per block logic to daily upcoming sessions
          hours: daySessions.length * 0.5,
        };
      });

      const completionRate = currentCycle ? 47 : 0;

      setDashboardData({
        currentCycle,
        weeklyHours: totalWeeklyHours,
        completionRate,
        upcomingSessions,
      });
    } catch (error) {
      console.error('Erro ao buscar dados do painel:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Painel - WATSON</title>
        <meta name="description" content="Seu painel de estudos com acompanhamento de progresso e próximas sessões." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Sidebar />
        
        <div className="content-with-sidebar">
          <main className="p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
                  Painel
                </h1>
                <p className="text-muted-foreground">
                  Bem-vindo de volta, {currentUser?.name || 'Estudante'}
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-16" />
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Ciclo Atual
                        </CardTitle>
                        <Target className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {dashboardData.currentCycle?.cycleName || 'Nenhum ciclo ativo'}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Horas Semanais
                        </CardTitle>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {dashboardData.weeklyHours.toFixed(1)}h
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Taxa de Conclusão
                        </CardTitle>
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {dashboardData.completionRate}%
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Sessões de Estudo
                        </CardTitle>
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {dashboardData.upcomingSessions.reduce((sum, s) => sum + s.sessions, 0)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Próximas Sessões de Estudo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {dashboardData.upcomingSessions.length > 0 ? (
                          <div className="space-y-4">
                            {dashboardData.upcomingSessions.map((session) => (
                              <div
                                key={session.day}
                                className="flex items-center justify-between p-4 bg-muted rounded-xl"
                              >
                                <div>
                                  <p className="font-medium">{session.day}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {session.sessions} sess{session.sessions !== 1 ? 'ões' : 'ão'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-semibold text-primary">
                                    {session.hours.toFixed(1)}h
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center py-8">
                            Nenhuma sessão programada
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Ciclo de Estudo Atual</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {dashboardData.currentCycle ? (
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Nome do Ciclo</p>
                              <p className="font-semibold text-lg">
                                {dashboardData.currentCycle.cycleName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Total de Horas Estimadas</p>
                              <p className="font-semibold text-lg">
                                {dashboardData.currentCycle.totalEstimatedHours || 0}h
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Matérias</p>
                              <p className="font-semibold text-lg">
                                {dashboardData.currentCycle.subjects?.length || 0}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center py-8">
                            Nenhum ciclo de estudo ativo. Crie um para começar.
                          </p>
                        )}
                      </CardContent>
                    </Card>
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

export default DashboardPage;
