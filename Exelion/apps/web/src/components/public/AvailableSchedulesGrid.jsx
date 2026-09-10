import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarDays, AlertCircle } from 'lucide-react';
import { getDayOfWeekName, statusToPtBR } from '@/lib/i18n.js';

const AvailableSchedulesGrid = ({ schedules, selectedSchedules, onToggleSchedule, isRequired = false }) => {
  if (!schedules || schedules.length === 0) {
    return (
      <div className="bg-muted/30 border border-border rounded-xl p-8 text-center flex flex-col items-center">
        <CalendarDays className="w-12 h-12 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground font-medium">Nenhum horário disponível no momento.</p>
        <p className="text-sm text-muted-foreground mt-2">O professor ainda não configurou horários disponíveis para matrícula.</p>
      </div>
    );
  }

  // Display order: Monday (1) to Sunday (0)
  const daysOrder = [1, 2, 3, 4, 5, 6, 0];

  const schedulesByDay = daysOrder.reduce((acc, dayNum) => {
    acc[dayNum] = schedules.filter(s => {
      const sDay = typeof s.day_of_week === 'string' && isNaN(Number(s.day_of_week)) 
        ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(s.day_of_week)
        : Number(s.day_of_week);
      return sDay === dayNum;
    });
    return acc;
  }, {});

  const hasError = isRequired && selectedSchedules.length === 0;

  return (
    <div className="space-y-4">
      {hasError && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium border border-destructive/20">
          <AlertCircle className="w-4 h-4" />
          Por favor, selecione pelo menos um horário para continuar.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {daysOrder.map(dayNum => {
          const daySchedules = schedulesByDay[dayNum];
          if (!daySchedules || daySchedules.length === 0) return null;

          const dayName = getDayOfWeekName(dayNum);
          const ptBrName = statusToPtBR[dayName] || dayName;

          return (
            <div key={dayNum} className={`bg-card rounded-xl border ${hasError ? 'border-destructive/50' : 'border-border'} shadow-sm overflow-hidden flex flex-col h-full transition-colors`}>
              <div className="bg-muted/50 px-4 py-3 border-b border-border font-semibold text-foreground text-sm uppercase tracking-wider">
                {ptBrName}
              </div>
              <div className="p-3 space-y-2 flex-1">
                {daySchedules.map(schedule => {
                  const isSelected = selectedSchedules.some(s => s.id === schedule.id);
                  const isAvailable = schedule.is_active !== false && (schedule.available_slots === undefined || schedule.available_slots === null || schedule.available_slots > 0);
                  
                  return (
                    <label 
                      key={schedule.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                        !isAvailable ? 'opacity-50 cursor-not-allowed bg-muted/20' : 'cursor-pointer'
                      } ${
                        isSelected 
                          ? 'bg-primary/5 border-primary ring-1 ring-primary shadow-sm' 
                          : isAvailable ? 'bg-background border-border hover:border-primary/50 hover:bg-muted/30' : 'border-border'
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={!isAvailable}
                        onCheckedChange={() => {
                          if (isAvailable) onToggleSchedule(schedule);
                        }}
                      />
                      <div className="flex-1 flex justify-between items-center">
                        <span className="font-medium text-foreground">
                          {schedule.start_time} - {schedule.end_time}
                        </span>
                        {!isAvailable && (
                          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                            Indisponível
                          </span>
                        )}
                      </div>
                    </label>
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

export default AvailableSchedulesGrid;