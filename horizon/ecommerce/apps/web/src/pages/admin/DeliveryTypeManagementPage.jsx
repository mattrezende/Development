
import React, { useEffect, useState } from 'react';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout.jsx';

const DeliveryTypeManagementPage = () => {
  const [deliveryTypes, setDeliveryTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Delete confirmation state
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const initialFormState = {
    name: '',
    description: '',
    estimated_time: '',
    delivery_cost: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await pb.collection('delivery_types').getList(1, 50, { 
        sort: '-created', 
        $autoCancel: false 
      });
      setDeliveryTypes(res.items);
    } catch (error) {
      console.error("Error fetching delivery types:", error);
      toast({ 
        variant: "destructive", 
        title: "Erro", 
        description: "Não foi possível carregar os tipos de entrega." 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (deliveryType = null) => {
    if (deliveryType) {
      setEditingId(deliveryType.id);
      setFormData({
        name: deliveryType.name,
        description: deliveryType.description || '',
        estimated_time: deliveryType.estimated_time || '',
        delivery_cost: deliveryType.delivery_cost !== null && deliveryType.delivery_cost !== undefined 
          ? deliveryType.delivery_cost.toString() 
          : ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({ 
        variant: "destructive", 
        title: "Erro de Validação", 
        description: "O nome do tipo de entrega é obrigatório." 
      });
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        estimated_time: formData.estimated_time,
      };

      // Handle optional number field
      if (formData.delivery_cost !== '') {
        data.delivery_cost = parseFloat(formData.delivery_cost);
      } else {
        data.delivery_cost = null;
      }

      if (editingId) {
        await pb.collection('delivery_types').update(editingId, data, { $autoCancel: false });
        toast({ title: "Sucesso", description: "Tipo de entrega atualizado com sucesso!" });
      } else {
        await pb.collection('delivery_types').create(data, { $autoCancel: false });
        toast({ title: "Sucesso", description: "Tipo de entrega criado com sucesso!" });
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving delivery type:", error);
      toast({ 
        variant: "destructive", 
        title: "Erro ao salvar", 
        description: error.response?.message || "Ocorreu um erro inesperado ao salvar." 
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await pb.collection('delivery_types').delete(deleteId, { $autoCancel: false });
      toast({ title: "Sucesso", description: "Tipo de entrega excluído com sucesso." });
      fetchData();
    } catch (error) {
      console.error("Error deleting delivery type:", error);
      toast({ 
        variant: "destructive", 
        title: "Erro ao excluir", 
        description: "Não foi possível excluir o tipo de entrega." 
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <Truck className="h-8 w-8 text-primary" />
            Tipos de Entrega
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie as opções de entrega disponíveis para os clientes.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="shadow-md hover:shadow-lg transition-all">
          <Plus className="mr-2 h-4 w-4" /> Novo Tipo
        </Button>
      </div>

      {/* Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingId ? 'Editar Tipo de Entrega' : 'Novo Tipo de Entrega'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="Ex: Entrega Expressa"
                  required 
                  className="bg-background"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated_time">Tempo Estimado</Label>
                  <Input 
                    id="estimated_time" 
                    name="estimated_time" 
                    value={formData.estimated_time} 
                    onChange={handleInputChange} 
                    placeholder="Ex: 1-2 dias"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_cost">Custo (R$)</Label>
                  <Input 
                    id="delivery_cost" 
                    name="delivery_cost" 
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.delivery_cost} 
                    onChange={handleInputChange} 
                    placeholder="Ex: 15.00"
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  placeholder="Detalhes sobre este tipo de entrega..."
                  rows={3} 
                  className="bg-background resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="min-w-[120px]">
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este tipo de entrega? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Data Table */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Nome</TableHead>
              <TableHead className="font-semibold">Tempo Estimado</TableHead>
              <TableHead className="font-semibold">Custo</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Descrição</TableHead>
              <TableHead className="text-right font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p>Carregando tipos de entrega...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : deliveryTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Truck className="h-12 w-12 text-muted-foreground/30" />
                    <p>Nenhum tipo de entrega cadastrado.</p>
                    <Button variant="outline" size="sm" onClick={() => handleOpenModal()} className="mt-2">
                      Cadastrar o primeiro
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              deliveryTypes.map(type => (
                <TableRow key={type.id} className="hover:bg-muted/30 transition-colors group">
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>
                    {type.estimated_time ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {type.estimated_time}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {type.delivery_cost !== null && type.delivery_cost !== undefined ? (
                      <span className="font-medium text-primary">
                        R$ {type.delivery_cost.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Grátis / A calcular</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate hidden md:table-cell">
                    {type.description || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(type)} title="Editar" className="hover:text-primary hover:bg-primary/10 h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => confirmDelete(type.id)} title="Excluir">
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
    </AdminLayout>
  );
};

export default DeliveryTypeManagementPage;
