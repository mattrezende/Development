
import React, { useEffect, useState } from 'react';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout.jsx';

const PaymentMethodManagementPage = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', type: 'card', active: true
  });
  const { toast } = useToast();

  const fetchMethods = async () => {
    try {
      const result = await pb.collection('payment_methods').getList(1, 50, { $autoCancel: false });
      setMethods(result.items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleOpenModal = (method = null) => {
    if (method) {
      setEditingId(method.id);
      setFormData({
        name: method.name, type: method.type, active: method.active
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', type: 'card', active: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await pb.collection('payment_methods').update(editingId, formData, { $autoCancel: false });
        toast({ title: "Método atualizado com sucesso" });
      } else {
        await pb.collection('payment_methods').create(formData, { $autoCancel: false });
        toast({ title: "Método criado com sucesso" });
      }
      setIsModalOpen(false);
      fetchMethods();
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao salvar método" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este método?')) {
      try {
        await pb.collection('payment_methods').delete(id, { $autoCancel: false });
        toast({ title: "Método excluído com sucesso" });
        fetchMethods();
      } catch (error) {
        toast({ variant: "destructive", title: "Erro ao excluir" });
      }
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await pb.collection('payment_methods').update(id, { active: !currentStatus }, { $autoCancel: false });
      fetchMethods();
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao atualizar status" });
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Métodos de Pagamento</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Método
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Método' : 'Novo Método'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome de Exibição</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Cartão de Crédito/Débito</SelectItem>
                  <SelectItem value="boleto">Boleto Bancário</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="active" checked={formData.active} onCheckedChange={(checked) => setFormData({...formData, active: checked})} />
              <Label htmlFor="active">Ativo</Label>
            </div>
            <Button type="submit" className="w-full">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-card border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Carregando...</TableCell></TableRow>
            ) : methods.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Nenhum método encontrado.</TableCell></TableRow>
            ) : (
              methods.map(method => (
                <TableRow key={method.id}>
                  <TableCell className="font-medium">{method.name}</TableCell>
                  <TableCell className="capitalize">{method.type}</TableCell>
                  <TableCell>
                    <Switch checked={method.active} onCheckedChange={() => toggleActive(method.id, method.active)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(method)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(method.id)}>
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

export default PaymentMethodManagementPage;
