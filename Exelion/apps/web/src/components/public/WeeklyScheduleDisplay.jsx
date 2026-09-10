import React from 'react';
import { formatTimeRange, getDayOfWeekName, statusToPtBR } from '@/lib/i18n.js';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Users, Tag, DollarSign, CalendarCheck, AlertCircle, RefreshCw } from 'lucide-react';

const WeeklyScheduleDisplay = ({ schedules, onBookNow, isLoading, error, onRetry }) => {
  // Step 3: Add console.log to verify schedules prop is being received
  console.log('Schedules prop:', schedules);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-md mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse shadow-sm">
              <CardContent className="p-6 h-40"></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Step 7: Display user-friendly error messages in the UI with a retry button
  if (error) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center flex flex-col items-center">
        <AlertCircle className="w-12 h-12 text-destructive/60 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Erro ao carregar horários</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">{error}</p>
        <Button variant="outline" onClick={onRetry} className="gap-2 bg-background hover:bg-muted">
          <RefreshCw className="w-4 h-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  // Step 3: Add fallback UI if schedules array is empty
  if (!schedules || schedules.length === 0) {
    return (
      <div className="bg-muted/30 border border-border rounded-2xl p-10 text-center flex flex-col items-center">
        <CalendarDays className="w-12 h-12 text-muted-foreground/40 mb-4" />
        <p className="text-foreground font-medium text-lg">Nenhum horário disponível</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          No momento, o professor não possui horários cadastrados ou com vagas abertas para agendamento.
        </p>
      </div>
    );
  }

  // Group schedules by day_of_week
  const grouped = schedules.reduce((acc, schedule) => {
    const day = schedule.day_of_week;
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {});

  // Sort days: Sunday to Saturday (0 to 6) or specific mapped values
  const sortedDays = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="space-y-8 bg-card border border-border shadow-sm p-6 sm:p-8 rounded-3xl">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="bg-primary/10 p-2 rounded-lg">
          <CalendarCheck className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-foreground">Aulas Disponíveis</h3>
      </div>
      
      <div className="space-y-10">
        {sortedDays.map(dayNum => {
          const dayName = getDayOfWeekName(dayNum);
          const ptBrName = statusToPtBR[dayName] || dayName;

          return (
            <div key={dayNum} className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                {ptBrName}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {/* Step 3: properly map over the schedules array */}
                {grouped[dayNum].map(schedule => {
                  const isAvailable = schedule.is_active !== false && 
                                      schedule.availability_status !== 'Ocupado' && 
                                      (schedule.available_slots === undefined || schedule.available_slots === null || schedule.available_slots > 0);
                  
                  return (
                    <Card 
                      key={schedule.id} 
                      className={`group transition-all duration-200 shadow-sm overflow-hidden flex flex-col ${
                        isAvailable ? 'hover:border-primary hover:shadow-md hover:-translate-y-1' : 'opacity-60 bg-muted/30'
                      }`}
                    >
                      <CardContent className="p-5 flex flex-col h-full relative">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`flex items-center font-medium ${isAvailable ? 'text-primary' : 'text-muted-foreground'}`}>
                            <Clock className="w-4 h-4 mr-2" />
                            {/* Step 3: Verify it displays start_time and end_time */}
                            {formatTimeRange(schedule.start_time, schedule.end_time)}
                          </div>
                          {/* Step 3: Verify it displays availability_status */}
                          <Badge 
                            variant={isAvailable ? "default" : "secondary"} 
                            className={isAvailable ? "bg-success/15 text-success hover:bg-success/25 border-0" : "border-0"}
                          >
                            {isAvailable ? "Disponível" : (schedule.availability_status === 'Ocupado' ? 'Esgotado' : 'Indisponível')}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2.5 mb-6 flex-1">
                          {schedule.class_type && (
                            <div className="flex items-center text-sm font-medium text-foreground">
                              <Tag className="w-4 h-4 mr-2.5 text-muted-foreground" />
                              {schedule.class_type}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="w-4 h-4 mr-2.5" />
                            {schedule.available_slots ? `${schedule.available_slots} vagas` : 'Vagas ilimitadas'}
                          </div>
                          {schedule.price > 0 && (
                            <div className="flex items-center text-sm font-semibold text-foreground">
                              <DollarSign className="w-4 h-4 mr-2.5 text-muted-foreground" />
                              R$ {schedule.price.toFixed(2)}
                            </div>
                          )}
                        </div>

                        <Button 
                          className="w-full mt-auto font-semibold" 
                          variant={isAvailable ? "default" : "secondary"}
                          disabled={!isAvailable}
                          onClick={() => onBookNow(schedule)}
                        >
                          {isAvailable ? 'Agendar Aula' : 'Indisponível'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyScheduleDisplay;