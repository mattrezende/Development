import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const ServiceAreasPage = () => {
  const { currentUser } = useAuth();
  const [serviceAreas, setServiceAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState({
    cep_range_start: '',
    cep_range_end: '',
  });

  useEffect(() => {
    fetchServiceAreas();
  }, [currentUser]);

  const fetchServiceAreas = async () => {
    try {
      const records = await pb.collection('serviceAreas').getFullList({
        filter: `teacher_id="${currentUser.id}"`,
        sort: 'cep_range_start',
        $autoCancel: false,
      });
      setServiceAreas(records);
    } catch (error) {
      toast.error('Erro ao carregar faixas de endereço');
    } finally {
      setLoading(false);
    }
  };

  const formatCEP = (value) => {
    return value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').substring(0, 9);
  };

  const validateCEP = (cep) => {
    return /^\d{5}-\d{3}$/.test(cep) || /^\d{8}$/.test(cep);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCEP(formData.cep_range_start) || !validateCEP(formData.cep_range_end)) {
      toast.error('Formato de CEP inválido. Use 00000-000.');
      return;
    }

    try {
      const data = {
        cep_range_start: formatCEP(formData.cep_range_start),
        cep_range_end: formatCEP(formData.cep_range_end),
        teacher_id: currentUser.id,
      };

      if (editingArea) {
        await pb.collection('serviceAreas').update(editingArea.id, data, { $autoCancel: false });
        toast.success('Área atualizada com sucesso.');
      } else {
        await pb.collection('serviceAreas').create(data, { $autoCancel: false });
        toast.success('Área criada com sucesso.');
      }

      setDialogOpen(false);
      resetForm();
      fetchServiceAreas();
    } catch (error) {
      toast.error('Falha ao salvar faixa de CEP');
    }
  };

  const handleEdit = (area) => {
    setEditingArea(area);
    setFormData({
      cep_range_start: area.cep_range_start,
      cep_range_end: area.cep_range_end,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta área de atendimento?')) return;

    try {
      await pb.collection('serviceAreas').delete(id, { $autoCancel: false });
      toast.success('Área excluída com sucesso.');
      fetchServiceAreas();
    } catch (error) {
      toast.error('Erro ao excluir a área.');
    }
  };

  const resetForm = () => {
    setEditingArea(null);
    setFormData({
      cep_range_start: '',
      cep_range_end: '',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background w-full">
        <Header />
        <div className="flex w-full">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Áreas de Atendimento - Exelion</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden w-full">
          <Sidebar />
          <main className="flex-1 bg-secondary/30 overflow-y-auto w-full">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="max-w-2xl">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2 text-balance" style={{ letterSpacing: '-0.02em' }}>
                    Áreas de Atendimento
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-balance">
                    Defina as faixas de CEP onde você oferece aulas presenciais. Alunos fora dessas áreas não poderão se matricular.
                  </p>
                </div>
                <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="shadow-md w-full sm:w-auto transition-transform active:scale-[0.98]">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Área
                </Button>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                      {editingArea ? 'Editar Área de Atendimento' : 'Nova Área de Atendimento'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="cep_range_start" className="text-foreground font-medium">CEP Inicial</Label>
                      <Input
                        id="cep_range_start"
                        type="text"
                        placeholder="Ex: 01000-000"
                        value={formData.cep_range_start}
                        onChange={(e) => setFormData({ ...formData, cep_range_start: formatCEP(e.target.value) })}
                        required
                        className="bg-background text-foreground font-mono text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cep_range_end" className="text-foreground font-medium">CEP Final</Label>
                      <Input
                        id="cep_range_end"
                        type="text"
                        placeholder="Ex: 05999-999"
                        value={formData.cep_range_end}
                        onChange={(e) => setFormData({ ...formData, cep_range_end: formatCEP(e.target.value) })}
                        required
                        className="bg-background text-foreground font-mono text-base"
                      />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-border">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
                        Cancelar
                      </Button>
                      <Button type="submit" className="w-full sm:w-auto">
                        {editingArea ? 'Salvar Alterações' : 'Adicionar Área'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {serviceAreas.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border shadow-sm p-8 sm:p-12 flex flex-col items-center justify-center text-center">
                  <MapPin className="w-16 h-16 text-muted-foreground/40 mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Nenhuma área cadastrada</h3>
                  <p className="text-muted-foreground mb-8 max-w-sm text-balance">
                    Adicione faixas de CEP para definir sua região de atendimento e permitir que alunos próximos encontrem você.
                  </p>
                  <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeira Área
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {serviceAreas.map((area) => (
                    <div key={area.id} className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg text-foreground leading-tight">Faixa de Cobertura</h3>
                      </div>
                      
                      <div className="space-y-5 mb-8 relative flex-1">
                        <div className="absolute left-3.5 top-6 bottom-6 w-px bg-border"></div>
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center border-4 border-card text-xs font-bold text-secondary-foreground shadow-sm">A</div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-0.5 uppercase tracking-wider">CEP Inicial</p>
                            <div className="font-mono text-base font-medium text-foreground">{area.cep_range_start}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center border-4 border-card text-xs font-bold text-secondary-foreground shadow-sm">B</div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-0.5 uppercase tracking-wider">CEP Final</p>
                            <div className="font-mono text-base font-medium text-foreground">{area.cep_range_end}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-5 border-t border-border/60 mt-auto">
                        <Button size="sm" variant="outline" className="flex-1 bg-background hover:bg-muted" onClick={() => handleEdit(area)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" className="w-10 px-0 text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20 hover:border-destructive" onClick={() => handleDelete(area.id)} aria-label="Excluir área">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default ServiceAreasPage;