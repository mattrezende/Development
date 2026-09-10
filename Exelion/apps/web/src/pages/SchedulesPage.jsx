import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTranslation, statusToPtBR, getDayOfWeekName } from '@/lib/i18n.js';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import CalendarView from '@/components/CalendarView.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, CalendarDays, LayoutGrid } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const SchedulesPage = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [editingSchedule, setEditingSchedule] = useState(null);
  
  const [formData, setFormData] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    recurrence: 'weekly',
    availability_status: 'Disponível',
    class_type: '',
    available_slots: '',
    price: '',
    is_active: true
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const availabilityStatuses = ['Disponível', 'Reservado', 'Ocupado'];

  const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
  const reverseDayMap = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };

  useEffect(() => {
    if (currentUser?.id) {
      fetchSchedules();
    }
  }, [currentUser]);

  const fetchSchedules = async () => {
    try {
      const records = await pb.collection('schedules').getFullList({
        filter: `teacher_id="${currentUser.id}"`,
        sort: 'day_of_week,start_time',
        $autoCancel: false,
      });
      setSchedules(records);
    } catch (error) {
      console.error('Failed to fetch schedules on dashboard:', error);
      toast.error(t('schedules.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Map string day to number for database schema constraints
      const resolvedDayNum = typeof formData.day_of_week === 'string' && isNaN(Number(formData.day_of_week))
        ? dayMap[formData.day_of_week]
        : Number(formData.day_of_week);

      // Step 4: Ensure all required fields are included in the save
      const data = {
        ...formData,
        day_of_week: resolvedDayNum,
        teacher_id: currentUser.id,
        price: formData.price ? Number(formData.price) : 0,
        available_slots: formData.available_slots ? Number(formData.available_slots) : null,
        class_type: formData.class_type || '',
        is_active: formData.is_active !== false,
      };

      let response;
      if (editingSchedule) {
        response = await pb.collection('schedules').update(editingSchedule.id, data, { $autoCancel: false });
        toast.success(t('schedules.updated'));
      } else {
        response = await pb.collection('schedules').create(data, { $autoCancel: false });
        toast.success(t('schedules.created'));
      }
      
      // Step 4: Add console.log to confirm schedules are being saved
      console.log('Schedule saved successfully:', response);

      setDialogOpen(false);
      resetForm();
      fetchSchedules();
    } catch (error) {
      console.error('Schedule save error:', error);
      toast.error(error.message || 'Erro ao salvar horário');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    
    // Resolve proper string value for UI mapping
    const dayVal = typeof schedule.day_of_week === 'number' || !isNaN(Number(schedule.day_of_week))
        ? reverseDayMap[Number(schedule.day_of_week)]
        : schedule.day_of_week;

    setFormData({
      day_of_week: dayVal,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      recurrence: schedule.recurrence || 'weekly',
      availability_status: schedule.availability_status || 'Disponível',
      class_type: schedule.class_type || '',
      available_slots: schedule.available_slots || '',
      price: schedule.price || '',
      is_active: schedule.is_active !== false,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('action.confirmDelete'))) return;

    try {
      await pb.collection('schedules').delete(id, { $autoCancel: false });
      toast.success(t('schedules.deleted'));
      fetchSchedules();
    } catch (error) {
      console.error('Schedule delete error:', error);
      toast.error('Falha ao deletar horário');
    }
  };

  const resetForm = () => {
    setEditingSchedule(null);
    setFormData({
      day_of_week: '',
      start_time: '',
      end_time: '',
      recurrence: 'weekly',
      availability_status: 'Disponível',
      class_type: '',
      available_slots: '',
      price: '',
      is_active: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Disponível': return 'bg-success/10 text-success border-success/20';
      case 'Reservado': return 'bg-warning/10 text-warning border-warning/20';
      case 'Ocupado': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Disponível': return 'Disponível';
      case 'Reservado': return 'Reservado';
      case 'Ocupado': return 'Ocupado';
      default: return status;
    }
  };

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

  return (
    <>
      <Helmet>
        <title>{t('schedules.title')} - Personal</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden w-full">
          <Sidebar />
          <main className="flex-1 bg-secondary/30 overflow-y-auto w-full">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('schedules.title')}</h1>
                  <p className="text-muted-foreground mt-1">{t('schedules.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-muted p-1 rounded-lg border border-border inline-flex">
                    <Button 
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      onClick={() => setViewMode('grid')}
                      className="gap-2"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('schedules.viewGrid')}</span>
                    </Button>
                    <Button 
                      variant={viewMode === 'calendar' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      onClick={() => setViewMode('calendar')}
                      className="gap-2"
                    >
                      <CalendarDays className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('schedules.viewCalendar')}</span>
                    </Button>
                  </div>
                  <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-transform">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('schedules.add')}
                  </Button>
                </div>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      {editingSchedule ? t('action.edit') : t('schedules.add')}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="day_of_week" className="text-foreground">{t('schedules.dayOfWeek')}</Label>
                      <Select
                        value={formData.day_of_week}
                        onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}
                        required
                      >
                        <SelectTrigger className="bg-background text-foreground">
                          <SelectValue placeholder="Selecione o dia" />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek.map((day) => (
                            <SelectItem key={day} value={day}>
                              {t(statusToPtBR[day])}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_time" className="text-foreground">{t('schedules.startTime')}</Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={formData.start_time}
                          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                          required
                          className="bg-background text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_time" className="text-foreground">{t('schedules.endTime')}</Label>
                        <Input
                          id="end_time"
                          type="time"
                          value={formData.end_time}
                          onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                          required
                          className="bg-background text-foreground"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="class_type" className="text-foreground">{t('schedules.classType')}</Label>
                        <Input
                          id="class_type"
                          value={formData.class_type}
                          onChange={(e) => setFormData({ ...formData, class_type: e.target.value })}
                          placeholder="Ex: Funcional"
                          className="bg-background text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="available_slots" className="text-foreground">{t('schedules.availableSlots')}</Label>
                        <Input
                          id="available_slots"
                          type="number"
                          min="1"
                          value={formData.available_slots}
                          onChange={(e) => setFormData({ ...formData, available_slots: e.target.value })}
                          placeholder="Ilimitado se vazio"
                          className="bg-background text-foreground"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-foreground">{t('schedules.price')}</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="0.00"
                          className="bg-background text-foreground"
                        />
                      </div>
                      <div className="space-y-2 flex flex-col justify-center pt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background"
                          />
                          <span className="text-sm font-medium">{t('schedules.isActive')}</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="recurrence" className="text-foreground">{t('schedules.recurrence')}</Label>
                        <Select
                          value={formData.recurrence}
                          onValueChange={(value) => setFormData({ ...formData, recurrence: value })}
                        >
                          <SelectTrigger className="bg-background text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">{t('recurrence.weekly')}</SelectItem>
                            <SelectItem value="once">{t('recurrence.once')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="availability_status" className="text-foreground">{t('schedules.status')}</Label>
                        <Select
                          value={formData.availability_status}
                          onValueChange={(value) => setFormData({ ...formData, availability_status: value })}
                        >
                          <SelectTrigger className="bg-background text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availabilityStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {getStatusLabel(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-border">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        {t('action.cancel')}
                      </Button>
                      <Button type="submit">
                        {editingSchedule ? t('action.update') : t('action.create')}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {schedules.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border shadow-sm p-12 flex flex-col items-center justify-center text-center">
                  <CalendarDays className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t('schedules.empty')}</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">{t('schedules.emptySub')}</p>
                  <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('schedules.add')}
                  </Button>
                </div>
              ) : viewMode === 'calendar' ? (
                <CalendarView schedules={schedules} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {schedules.map((schedule) => {
                    const resolvedName = getDayOfWeekName(schedule.day_of_week);
                    return (
                      <div key={schedule.id} className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 group">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{t(statusToPtBR[resolvedName] || resolvedName)}</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {schedule.start_time} - {schedule.end_time}
                            </p>
                          </div>
                          <div className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(schedule.availability_status)}`}>
                            {getStatusLabel(schedule.availability_status)}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <span className="text-sm bg-secondary px-2.5 py-1 rounded-md text-secondary-foreground font-medium">
                            {t(statusToPtBR[schedule.recurrence])}
                          </span>
                          <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="secondary" className="w-8 h-8 rounded-lg" onClick={() => handleEdit(schedule)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="destructive" className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-0" onClick={() => handleDelete(schedule.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default SchedulesPage;