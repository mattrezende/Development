
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header.jsx';

const EmployeeClockIn = () => {
  const { currentUser } = useAuth();
  const [todayTimesheet, setTodayTimesheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentUser?.employee_id) {
      fetchTodayTimesheet();
    }
  }, [currentUser]);

  const fetchTodayTimesheet = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];

      const records = await pb.collection('timesheets').getFullList({
        filter: `employee_id = "${currentUser.employee_id}" && date >= "${today}" && date < "${nextDayStr}"`,
        $autoCancel: false
      });

      if (records.length > 0) {
        setTodayTimesheet(records[0]);
      }
    } catch (error) {
      console.error('Error fetching timesheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    if (!window.confirm('Confirmar registro de entrada?')) return;

    try {
      const now = new Date();
      const clockInTime = now.toTimeString().split(' ')[0].substring(0, 5);
      const today = now.toISOString().split('T')[0];

      const record = await pb.collection('timesheets').create({
        employee_id: currentUser.employee_id,
        date: today,
        clock_in: clockInTime,
        status: 'pending',
        manager_id: currentUser.id
      }, { $autoCancel: false });

      setTodayTimesheet(record);
      toast({
        title: 'Sucesso',
        description: `Entrada registrada às ${clockInTime}`
      });
    } catch (error) {
      console.error('Error clocking in:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a entrada',
        variant: 'destructive'
      });
    }
  };

  const handleClockOut = async () => {
    if (!window.confirm('Confirmar registro de saída?')) return;

    try {
      const now = new Date();
      const clockOutTime = now.toTimeString().split(' ')[0].substring(0, 5);

      await pb.collection('timesheets').update(todayTimesheet.id, {
        clock_out: clockOutTime
      }, { $autoCancel: false });

      setTodayTimesheet({ ...todayTimesheet, clock_out: clockOutTime });
      toast({
        title: 'Sucesso',
        description: `Saída registrada às ${clockOutTime}`
      });
    } catch (error) {
      console.error('Error clocking out:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a saída',
        variant: 'destructive'
      });
    }
  };

  const calculateHours = () => {
    if (!todayTimesheet?.clock_in || !todayTimesheet?.clock_out) return '0:00';
    
    const start = new Date(`2000-01-01 ${todayTimesheet.clock_in}`);
    const end = new Date(`2000-01-01 ${todayTimesheet.clock_out}`);
    const diff = end - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Registrar Ponto - Sistema de Gestão de RH</title>
        <meta name="description" content="Registre sua entrada e saída" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Registrar Ponto</h1>
              <p className="text-gray-600 mt-2">Registre sua entrada e saída</p>
            </div>

            <Card className="border border-gray-200 shadow-xl mb-6">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-emerald-600" />
                </div>
                <CardTitle className="text-4xl font-bold text-gray-900">
                  {currentTime.toLocaleTimeString('pt-BR')}
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </CardHeader>
            </Card>

            <Card className="border border-gray-200 shadow-xl mb-6">
              <CardHeader>
                <CardTitle>Status do Ponto Hoje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Entrada</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {todayTimesheet?.clock_in || '--:--'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Saída</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {todayTimesheet?.clock_out || '--:--'}
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-sm text-emerald-700 mb-1">Horas Trabalhadas Hoje</p>
                  <p className="text-3xl font-bold text-emerald-900">{calculateHours()}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                size="lg"
                onClick={handleClockIn}
                disabled={!!todayTimesheet}
                className="h-24 bg-emerald-600 hover:bg-emerald-700 text-white text-lg"
              >
                <LogIn className="w-6 h-6 mr-2" />
                Registrar Entrada
              </Button>
              <Button
                size="lg"
                onClick={handleClockOut}
                disabled={!todayTimesheet || !!todayTimesheet?.clock_out}
                className="h-24 bg-blue-600 hover:bg-blue-700 text-white text-lg"
              >
                <LogOut className="w-6 h-6 mr-2" />
                Registrar Saída
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeClockIn;
