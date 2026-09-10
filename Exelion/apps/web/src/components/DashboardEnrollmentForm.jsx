import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { statusToPtBR } from '@/lib/i18n';

const DashboardEnrollmentForm = ({ initialData, onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [fetchingData, setFetchingData] = useState(true);

  const [formData, setFormData] = useState({
    student_id: '',
    schedule_id: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'active',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, schedulesRes] = await Promise.all([
          pb.collection('students').getFullList({
            filter: `teacher_id="${currentUser.id}"`,
            sort: 'name',
            $autoCancel: false
          }),
          pb.collection('schedules').getFullList({
            filter: `teacher_id="${currentUser.id}"`,
            sort: 'day_of_week,start_time',
            $autoCancel: false
          })
        ]);
        
        setStudents(studentsRes);
        
        // If creating new, only show available schedules. If editing, show all (so they can keep current)
        if (initialData) {
          setSchedules(schedulesRes);
        } else {
          setSchedules(schedulesRes.filter(s => s.availability_status === 'Disponível' || !s.availability_status));
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast.error('Erro ao carregar dados do formulário.');
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [currentUser.id, initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        student_id: initialData.student_id || '',
        schedule_id: initialData.schedule_id || '',
        enrollment_date: initialData.enrollment_date ? initialData.enrollment_date.split('T')[0] : new Date().toISOString().split('T')[0],
        status: initialData.status || 'active',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.student_id || !formData.schedule_id || !formData.enrollment_date) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        teacher_id: currentUser.id,
        enrollment_date: `${formData.enrollment_date} 12:00:00.000Z`
      };

      let savedEnrollment;

      if (initialData?.id) {
        // Handle status change logic for schedule availability
        const oldStatus = initialData.status;
        const newStatus = formData.status;
        
        savedEnrollment = await pb.collection('enrollments').update(initialData.id, dataToSave, { $autoCancel: false });
        
        // Update schedule availability if status changed
        if (oldStatus !== newStatus) {
          const newAvailability = newStatus === 'active' ? 'Ocupado' : 'Disponível';
          await pb.collection('schedules').update(formData.schedule_id, {
            availability_status: newAvailability
          }, { $autoCancel: false });
        }
        
        toast.success('Matrícula atualizada com sucesso!');
      } else {
        savedEnrollment = await pb.collection('enrollments').create(dataToSave, { $autoCancel: false });
        
        // Mark schedule as occupied
        if (formData.status === 'active') {
          await pb.collection('schedules').update(formData.schedule_id, {
            availability_status: 'Ocupado'
          }, { $autoCancel: false });
        }
        
        toast.success('Matrícula criada com sucesso!');
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving enrollment:', error);
      toast.error(error.message || 'Erro ao salvar matrícula.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return <div className="py-8 text-center text-muted-foreground">Carregando dados...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="student_id">Aluno *</Label>
        <Select 
          value={formData.student_id} 
          onValueChange={(value) => setFormData({ ...formData, student_id: value })}
          disabled={!!initialData} // Prevent changing student on edit
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um aluno" />
          </SelectTrigger>
          <SelectContent>
            {students.map(student => (
              <SelectItem key={student.id} value={student.id}>
                {student.name}
              </SelectItem>
            ))}
            {students.length === 0 && (
              <SelectItem value="none" disabled>Nenhum aluno cadastrado</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="schedule_id">Horário *</Label>
        <Select 
          value={formData.schedule_id} 
          onValueChange={(value) => setFormData({ ...formData, schedule_id: value })}
          disabled={!!initialData} // Prevent changing schedule on edit (simplify logic)
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um horário" />
          </SelectTrigger>
          <SelectContent>
            {schedules.map(schedule => (
              <SelectItem key={schedule.id} value={schedule.id}>
                {statusToPtBR[schedule.day_of_week] || schedule.day_of_week} • {schedule.start_time} - {schedule.end_time}
              </SelectItem>
            ))}
            {schedules.length === 0 && (
              <SelectItem value="none" disabled>Nenhum horário disponível</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="enrollment_date">Data da Matrícula *</Label>
        <Input
          id="enrollment_date"
          type="date"
          required
          value={formData.enrollment_date}
          onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : initialData ? 'Atualizar Matrícula' : 'Criar Matrícula'}
        </Button>
      </div>
    </form>
  );
};

export default DashboardEnrollmentForm;