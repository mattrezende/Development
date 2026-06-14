
import React, { useEffect, useState } from 'react';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout.jsx';

const SubcategoryManagementPage = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const initialFormState = {
    name: '',
    description: '',
    category_id: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subcategoriesRes, categoriesRes] = await Promise.all([
        pb.collection('subcategories').getList(1, 50, { 
          expand: 'category_id', 
          sort: '-created', 
          $autoCancel: false 
        }),
        pb.collection('categories').getFullList({ 
          sort: 'name', 
          $autoCancel: false 
        })
      ]);
      setSubcategories(subcategoriesRes.items);
      setCategories(categoriesRes);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ 
        variant: "destructive", 
        title: "Erro", 
        description: "Não foi possível carregar os dados." 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (subcategory = null) => {
    if (subcategory) {
      setEditingId(subcategory.id);
      setFormData({
        name: subcategory.name,
        description: subcategory.description || '',
        category_id: subcategory.category_id
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value) => {
    setFormData(prev => ({ ...prev, category_id: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category_id) {
      toast({ 
        variant: "destructive", 
        title: "Erro de Validação", 
        description: "Preencha todos os campos obrigatórios." 
      });
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id
      };

      if (editingId) {
        await pb.collection('subcategories').update(editingId, data, { $autoCancel: false });
        toast({ title: "Sucesso", description: "Subcategoria atualizada com sucesso!" });
      } else {
        await pb.collection('subcategories').create(data, { $autoCancel: false });
        toast({ title: "Sucesso", description: "Subcategoria criada com sucesso!" });
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving subcategory:", error);
      toast({ 
        variant: "destructive", 
        title: "Erro ao salvar", 
        description: error.response?.message || "Ocorreu um erro inesperado ao salvar a subcategoria." 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta subcategoria? Esta ação não pode ser desfeita.')) {
      try {
        await pb.collection('subcategories').delete(id, { $autoCancel: false });
        toast({ title: "Sucesso", description: "Subcategoria excluída com sucesso." });
        fetchData();
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        toast({ 
          variant: "destructive", 
          title: "Erro ao excluir", 
          description: "Não foi possível excluir a subcategoria." 
        });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Gerenciar Subcategorias</h1>
        <Button onClick={() => handleOpenModal()} className="shadow-md hover:shadow-lg transition-all">
          <Plus className="mr-2 h-4 w-4" /> Nova Subcategoria
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Subcategoria' : 'Nova Subcategoria'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category_id">Categoria Pai *</Label>
                <Select value={formData.category_id} onValueChange={handleCategoryChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome da Subcategoria *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="Ex: Frutas Cítricas"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  placeholder="Descrição opcional da subcategoria"
                  rows={3} 
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Subcategoria'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nome</TableHead>
              <TableHead>Categoria Pai</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Carregando subcategorias...</TableCell></TableRow>
            ) : subcategories.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhuma subcategoria encontrada.</TableCell></TableRow>
            ) : (
              subcategories.map(subcategory => (
                <TableRow key={subcategory.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{subcategory.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {subcategory.expand?.category_id?.name || 'Sem categoria'}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {subcategory.description || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(subcategory)} title="Editar" className="hover:text-primary">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(subcategory.id)} title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default SubcategoryManagementPage;
