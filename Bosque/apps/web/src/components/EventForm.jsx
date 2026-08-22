import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';

const EventForm = ({ initialData, onSuccess, onCancel }) => {
  const isEditMode = !!initialData;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    subtitulo: '',
    data: '',
    horario: '',
    local: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        titulo: initialData.titulo || '',
        subtitulo: initialData.subtitulo || '',
        // Extract exactly YYYY-MM-DD to avoid timezone conversion issues in the input
        data: initialData.data ? initialData.data.substring(0, 10) : '',
        horario: initialData.horario || '',
        local: initialData.local || ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send the date string exactly as YYYY-MM-DD without converting to Date object
      const payload = { ...formData };
      
      if (isEditMode) {
        await apiClient.put(`/api/eventos/${initialData.id}`, payload);
        toast.success('Evento atualizado com sucesso');
      } else {
        await apiClient.post('/api/eventos', payload);
        toast.success('Evento criado com sucesso');
      }
      
      if (!isEditMode) {
        setFormData({ titulo: '', subtitulo: '', data: '', horario: '', local: '' });
      }
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      toast.error(isEditMode ? 'Erro ao atualizar evento' : 'Erro ao criar evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="event-titulo">Título *</Label>
        <Input
          id="event-titulo"
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          required
          placeholder="Ex: Aula de Matemática Avançada"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-subtitulo">Subtítulo</Label>
        <Input
          id="event-subtitulo"
          value={formData.subtitulo}
          onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
          placeholder="Ex: Explorando conceitos de cálculo"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="event-data">Data *</Label>
          <Input
            id="event-data"
            type="date"
            value={formData.data}
            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-horario">Horário *</Label>
          <Input
            id="event-horario"
            value={formData.horario}
            onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
            required
            placeholder="Ex: 14:00 - 16:00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-local">Local *</Label>
        <Input
          id="event-local"
          value={formData.local}
          onChange={(e) => setFormData({ ...formData, local: e.target.value })}
          required
          placeholder="Ex: Sala 203, Prédio Principal"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isEditMode ? 'Atualizar Evento' : 'Criar Evento'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;