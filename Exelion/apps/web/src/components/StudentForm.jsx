import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

const StudentForm = ({ initialData, onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        date_of_birth: initialData.date_of_birth ? initialData.date_of_birth.split('T')[0] : '',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        teacher_id: currentUser.id,
      };

      // Convert empty date string to null to avoid PocketBase validation errors
      if (!dataToSave.date_of_birth) {
        delete dataToSave.date_of_birth;
      } else {
        // Ensure date is in correct format (YYYY-MM-DD 12:00:00.000Z)
        dataToSave.date_of_birth = `${dataToSave.date_of_birth} 12:00:00.000Z`;
      }

      if (initialData?.id) {
        await pb.collection('students').update(initialData.id, dataToSave, { $autoCancel: false });
        toast.success('Aluno atualizado com sucesso!');
      } else {
        await pb.collection('students').create(dataToSave, { $autoCancel: false });
        toast.success('Aluno cadastrado com sucesso!');
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error(error.message || 'Erro ao salvar aluno. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo *</Label>
        <Input
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: João da Silva"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="joao@exemplo.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="(11) 99999-9999"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date_of_birth">Data de Nascimento</Label>
        <Input
          id="date_of_birth"
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : initialData ? 'Atualizar Aluno' : 'Cadastrar Aluno'}
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;