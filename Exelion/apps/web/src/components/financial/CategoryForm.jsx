import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

const CategoryForm = ({ onCategoryCreated, initialData, onCancel }) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        color: initialData.color || '#3b82f6'
      });
    } else {
      setFormData({
        name: '',
        color: '#3b82f6'
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Creating category...');
    console.log('Teacher ID:', currentUser?.id);
    console.log('Form data:', formData);

    try {
      const dataToSave = {
        ...formData,
        teacher_id: currentUser.id
      };

      let response;
      if (initialData?.id) {
        response = await pb.collection('expense_categories').update(initialData.id, dataToSave, { $autoCancel: false });
        toast.success('Category updated successfully');
      } else {
        response = await pb.collection('expense_categories').create(dataToSave, { $autoCancel: false });
        toast.success('Category created successfully');
      }

      console.log('PocketBase response:', response);

      // Clear form fields after successful save
      setFormData({
        name: '',
        color: '#3b82f6'
      });

      if (onCategoryCreated) {
        onCategoryCreated();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to create category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Categoria</Label>
        <Input 
          id="name" 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required 
          placeholder="Ex: Equipamentos"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Cor</Label>
        <div className="flex gap-3 items-center">
          <Input 
            id="color" 
            type="color" 
            value={formData.color}
            onChange={(e) => setFormData({...formData, color: e.target.value})}
            className="w-16 h-10 p-1 cursor-pointer"
          />
          <span className="text-sm text-muted-foreground font-mono uppercase">{formData.color}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : (initialData ? 'Atualizar Categoria' : 'Adicionar Categoria')}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;