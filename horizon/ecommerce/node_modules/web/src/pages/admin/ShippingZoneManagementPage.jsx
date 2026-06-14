
import React, { useEffect, useState } from 'react';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout.jsx';

const ShippingZoneManagementPage = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    zip_code_start: '', zip_code_end: '', shipping_cost: ''
  });
  const { toast } = useToast();

  const fetchZones = async () => {
    try {
      const result = await pb.collection('shipping_zones').getList(1, 50, { $autoCancel: false });
      setZones(result.items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleOpenModal = (zone = null) => {
    if (zone) {
      setEditingId(zone.id);
      setFormData({
        zip_code_start: zone.zip_code_start, 
        zip_code_end: zone.zip_code_end, 
        shipping_cost: zone.shipping_cost
      });
    } else {
      setEditingId(null);
      setFormData({ zip_code_start: '', zip_code_end: '', shipping_cost: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, shipping_cost: parseFloat(formData.shipping_cost) };
      if (editingId) {
        await pb.collection('shipping_zones').update(editingId, data, { $autoCancel: false });
        toast({ title: "Zona atualizada com sucesso" });
      } else {
        await pb.collection('shipping_zones').create(data, { $autoCancel: false });
        toast({ title: "Zona criada com sucesso" });
      }
      setIsModalOpen(false);
      fetchZones();
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao salvar zona" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta zona de entrega?')) {
      try {
        await pb.collection('shipping_zones').delete(id, { $autoCancel: false });
        toast({ title: "Zona excluída com sucesso" });
        fetchZones();
      } catch (error) {
        toast({ variant: "destructive", title: "Erro ao excluir" });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Zonas de Entrega</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" /> Nova Zona
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Zona' : 'Nova Zona'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zip_code_start">CEP Inicial</Label>
                <Input id="zip_code_start" placeholder="00000000" value={formData.zip_code_start} onChange={(e) => setFormData({...formData, zip_code_start: e.target.value.replace(/\D/g, '')})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code_end">CEP Final</Label>
                <Input id="zip_code_end" placeholder="99999999" value={formData.zip_code_end} onChange={(e) => setFormData({...formData, zip_code_end: e.target.value.replace(/\D/g, '')})} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_cost">Custo de Frete (R$)</Label>
              <Input id="shipping_cost" type="number" step="0.01" value={formData.shipping_cost} onChange={(e) => setFormData({...formData, shipping_cost: e.target.value})} required />
            </div>
            <Button type="submit" className="w-full">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-card border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CEP Inicial</TableHead>
              <TableHead>CEP Final</TableHead>
              <TableHead>Custo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Carregando...</TableCell></TableRow>
            ) : zones.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Nenhuma zona encontrada.</TableCell></TableRow>
            ) : (
              zones.map(zone => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.zip_code_start}</TableCell>
                  <TableCell>{zone.zip_code_end}</TableCell>
                  <TableCell>R$ {zone.shipping_cost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(zone)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(zone.id)}>
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

export default ShippingZoneManagementPage;
