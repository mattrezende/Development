import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';
import { statusToPtBR } from '@/lib/i18n';

const DashboardEnrollmentForm = ({ initialData, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [fetchingData, setFetchingData] = useState(true);

  const idOf = (value) => (value && typeof value === 'object' ? value.id : value) || '';

  const [formData, setFormData] = useState({
    studentId: idOf(initialData?.studentId),
    scheduleId: idOf(initialData?.scheduleId),
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'active',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ students: studentsRes }, { schedules: schedulesRes }] = await Promise.all([
          apiClient.get('/students'),
          apiClient.get('/schedules'),
        ]);

        setStudents(studentsRes);

        if (initialData) {
          setSchedules(schedulesRes);
        } else {
          setSchedules(schedulesRes.filter(s => s.availabilityStatus === 'Disponível' || !s.availabilityStatus));
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast.error('Erro ao carregar dados do formulário.');
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        studentId: idOf(initialData.studentId),
        scheduleId: idOf(initialData.scheduleId),
        enrollmentDate: initialData.enrollmentDate ? initialData.enrollmentDate.split('T')[0] : new Date().toISOString().split('T')[0],
        status: initialData.status || 'active',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studentId || !formData.scheduleId || !formData.enrollmentDate) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      if (initialData?.id) {
        await apiClient.patch(`/enrollments/${initialData.id}`, formData);
        toast.success('Matrícula atualizada com sucesso!');
      } else {
        await apiClient.post('/enrollments', formData);
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
        <Label htmlFor="studentId">Aluno *</Label>
        <Select
          value={formData.studentId}
          onValueChange={(value) => setFormData({ ...formData, studentId: value })}
          disabled={!!initialData}
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
        <Label htmlFor="scheduleId">Horário *</Label>
        <Select
          value={formData.scheduleId}
          onValueChange={(value) => setFormData({ ...formData, scheduleId: value })}
          disabled={!!initialData}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um horário" />
          </SelectTrigger>
          <SelectContent>
            {schedules.map(schedule => (
              <SelectItem key={schedule.id} value={schedule.id}>
                {statusToPtBR[schedule.dayOfWeek] || schedule.dayOfWeek} • {schedule.startTime} - {schedule.endTime}
              </SelectItem>
            ))}
            {schedules.length === 0 && (
              <SelectItem value="none" disabled>Nenhum horário disponível</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="enrollmentDate">Data da Matrícula *</Label>
        <Input
          id="enrollmentDate"
          type="date"
          required
          value={formData.enrollmentDate}
          onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
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
