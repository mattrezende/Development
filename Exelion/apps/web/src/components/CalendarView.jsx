import React, { useState } from 'react';
import { useTranslation, statusToPtBR } from '@/lib/i18n.js';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const CalendarView = ({ schedules }) => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    // Adjust so Monday is 0, Sunday is 6
    return day === 0 ? 6 : day - 1;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Build grid
  const grid = [];
  for (let i = 0; i < firstDay; i++) {
    grid.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    grid.push(i);
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500 text-white';
      case 'reserved': return 'bg-yellow-500 text-white';
      case 'occupied': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Maps DB days to JS Date indices (0 = Monday, 6 = Sunday adjusted)
  const dayNameMap = {
    'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6
  };

  const getSchedulesForDay = (dayNum) => {
    if (!dayNum) return [];
    const dateObj = new Date(year, month, dayNum);
    const dayOfWeekIndex = dateObj.getDay(); // 0 = Sunday
    const adjustedIndex = dayOfWeekIndex === 0 ? 6 : dayOfWeekIndex - 1; // 0 = Monday
    
    // Find schedules matching this day of week
    return schedules.filter(s => dayNameMap[s.day_of_week] === adjustedIndex);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <h2 className="text-xl font-bold capitalize">
          {t(`month.${month + 1}`)} {year}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border">
        {daysOfWeek.map(day => (
          <div key={day} className="bg-card p-3 text-center text-sm font-semibold text-muted-foreground">
            {t(statusToPtBR[day]).substring(0, 3)}
          </div>
        ))}
        
        {grid.map((dayNum, idx) => {
          const daySchedules = getSchedulesForDay(dayNum);
          
          return (
            <div key={idx} className={`bg-card min-h-[120px] p-2 ${!dayNum ? 'bg-muted/20' : 'hover:bg-accent/50 transition-colors'}`}>
              {dayNum && (
                <>
                  <div className="font-medium text-sm mb-2 text-muted-foreground">{dayNum}</div>
                  <div className="space-y-1">
                    {daySchedules.map(sch => (
                      <Popover key={sch.id}>
                        <PopoverTrigger asChild>
                          <div className={`text-xs px-2 py-1 rounded cursor-pointer truncate shadow-sm transition-transform hover:-translate-y-px ${getStatusColor(sch.availability_status)}`}>
                            {sch.start_time}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3 rounded-xl shadow-lg">
                          <div className="font-semibold mb-1">{t(statusToPtBR[sch.day_of_week])}</div>
                          <div className="text-sm text-muted-foreground mb-3">{sch.start_time} - {sch.end_time}</div>
                          <div className="flex gap-2 mb-1">
                            <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                              {t(statusToPtBR[sch.recurrence])}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(sch.availability_status)}`}>
                              {t(statusToPtBR[sch.availability_status])}
                            </span>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;