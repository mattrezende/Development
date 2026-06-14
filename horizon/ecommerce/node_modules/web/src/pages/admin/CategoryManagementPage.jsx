
import React, { useEffect, useState } from 'react';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout.jsx';

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const initialFormState = {
    name: '',
    description: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  
  const { toast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const result = await pb.collection('categories').getList(1, 50, { 
        sort: '-created', 
        $autoCancel: false 
      });
      setCategories(result.items);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar as categorias." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name,
        description: category.description || ''
      });
      setCurrentImage(category.image ? pb.files.getUrl(category, category.image) : null);
    } else {
      setEditingId(null);
      setFormData(initialFormState);
      setCurrentImage(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast({ variant: "destructive", title: "Arquivo inválido", description: "Por favor, selecione apenas arquivos de imagem." });
        return;
      }
      setImageFile(file);
      setCurrentImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({ variant: "destructive", title: "Erro de Validação", description: "O nome da categoria é obrigatório." });
      return;
    }

    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (editingId) {
        await pb.collection('categories').update(editingId, data, { $autoCancel: false });
        toast({ title: "Sucesso", description: "Categoria atualizada com sucesso!" });
      } else {
        await pb.collection('categories').create(data, { $autoCancel: false });
        toast({ title: "Sucesso", description: "Categoria criada com sucesso!" });
      }
      
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast({ 
        variant: "destructive", 
        title: "Erro ao salvar", 
        description: error.response?.message || "Ocorreu um erro inesperado ao salvar a categoria." 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.')) {
      try {
        await pb.collection('categories').delete(id, { $autoCancel: false });
        toast({ title: "Sucesso", description: "Categoria excluída com sucesso." });
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        toast({ variant: "destructive", title: "Erro ao excluir", description: "Não foi possível excluir a categoria." });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gerenciar Categorias</h1>
        <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Categoria *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="Ex: Hortifruti"
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
                  placeholder="Breve descrição da categoria..."
                  rows={3} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Imagem da Categoria</Label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                  {currentImage ? (
                    <div className="relative w-full aspect-video mb-4 rounded-md overflow-hidden bg-black/5 flex items-center justify-center">
                      <img src={currentImage} alt="Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma imagem selecionada</p>
                    </div>
                  )}
                  <Input 
                    id="image" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="w-full cursor-pointer" 
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {saving ? 'Salvando...' : 'Salvar Categoria'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-20 text-center">Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Descrição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Carregando categorias...</TableCell></TableRow>
              ) : categories.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhuma categoria encontrada.</TableCell></TableRow>
              ) : (
                categories.map(cat => (
                  <TableRow key={cat.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-md bg-muted overflow-hidden flex items-center justify-center border">
                        {cat.image ? (
                          <img 
                            src={pb.files.getUrl(cat, cat.image)} 
                            alt={cat.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">{cat.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground max-w-xs truncate">
                      {cat.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenModal(cat)} 
                          title="Editar"
                          className="hover:text-primary hover:bg-primary/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                          onClick={() => handleDelete(cat.id)} 
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CategoryManagementPage;
