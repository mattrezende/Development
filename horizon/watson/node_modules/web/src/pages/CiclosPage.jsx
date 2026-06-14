
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Trash2, Star, Calculator, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';
import { useTimeDistribution } from '@/hooks/useTimeDistribution';
import { useScheduleSync } from '@/hooks/useScheduleSync';
import StudyQueueDisplay from '@/components/StudyQueueDisplay.jsx';

const CiclosPage = () => {
  const { currentUser } = useAuth();
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Time Distribution Hook
  const { totalAvailableMinutes, distributeTime, recalculateTimeDistribution, refetchTotalTime } = useTimeDistribution();

  const [newCycle, setNewCycle] = useState({
    cycleName: '',
    subjects: [],
  });
  
  const [newSubject, setNewSubject] = useState({
    name: '',
    rank: 3, // Default importance rank
  });

  const fetchCycles = useCallback(async () => {
    try {
      const records = await pb.collection('studyCycles').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: '-createdAt',
        $autoCancel: false,
      });
      setCycles(records);
    } catch (error) {
      console.error('Erro ao buscar ciclos:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  // Auto-sync when schedule changes
  useScheduleSync(() => {
    fetchCycles();
    refetchTotalTime();
  });

  const handleAddSubject = () => {
    if (newSubject.name.trim()) {
      const updatedSubjects = [...newCycle.subjects, { 
        name: newSubject.name.trim(), 
        rank: newSubject.rank,
        order_in_queue: newCycle.subjects.length
      }];
      
      // Recalculate times immediately for preview
      const distributedSubjects = distributeTime(updatedSubjects);
      
      setNewCycle({
        ...newCycle,
        subjects: distributedSubjects,
      });
      setNewSubject({ name: '', rank: 3 });
    }
  };

  const handleRemoveSubject = (index) => {
    const filteredSubjects = newCycle.subjects.filter((_, i) => i !== index);
    // Recalculate times after removal
    const distributedSubjects = distributeTime(filteredSubjects);
    
    setNewCycle({
      ...newCycle,
      subjects: distributedSubjects,
    });
  };

  const handleCreateCycle = async () => {
    try {
      // Final calculation before saving to ensure accuracy
      const finalSubjects = distributeTime(newCycle.subjects);
      const totalHours = totalAvailableMinutes / 60;
      
      await pb.collection('studyCycles').create({
        userId: currentUser.id,
        cycleName: newCycle.cycleName,
        subjects: finalSubjects,
        totalCycleDuration: totalHours,
        status: 'active',
      }, { $autoCancel: false });

      toast.success('Ciclo de estudo criado com sucesso!');
      setIsCreateDialogOpen(false);
      setNewCycle({ cycleName: '', subjects: [] });
      fetchCycles();
    } catch (error) {
      console.error('Erro ao criar ciclo:', error);
      toast.error('Falha ao criar ciclo');
    }
  };

  const handleDeleteCycle = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este ciclo de estudo?')) {
      try {
        await pb.collection('studyCycles').delete(id, { $autoCancel: false });
        toast.success('Ciclo deletado');
        fetchCycles();
      } catch (error) {
        console.error('Erro ao deletar ciclo:', error);
        toast.error('Erro ao deletar ciclo');
      }
    }
  };

  const handleRecalculateActiveCycle = async (cycle) => {
    try {
      await refetchTotalTime();
      const updatedSubjects = distributeTime(cycle.subjects);
      
      await pb.collection('studyCycles').update(cycle.id, {
        subjects: updatedSubjects,
        totalCycleDuration: totalAvailableMinutes / 60
      }, { $autoCancel: false });
      
      toast.success('Tempos recalculados com base na sua rotina atual!');
      fetchCycles();
    } catch (error) {
      console.error('Erro ao recalcular:', error);
      toast.error('Erro ao recalcular tempos');
    }
  };

  const handleAddDisciplineToCycle = async (cycle, newDiscipline) => {
    try {
      // Check if discipline already exists
      if (cycle.subjects.some(s => s.name.toLowerCase() === newDiscipline.name.toLowerCase())) {
        throw new Error('Esta matéria já existe no ciclo.');
      }

      const updatedSubjects = [
        ...cycle.subjects, 
        { 
          ...newDiscipline, 
          order_in_queue: cycle.subjects.length 
        }
      ];
      
      const redistributedSubjects = recalculateTimeDistribution(updatedSubjects, totalAvailableMinutes);
      
      await pb.collection('studyCycles').update(cycle.id, {
        subjects: redistributedSubjects
      }, { $autoCancel: false });
      
      await fetchCycles();
    } catch (error) {
      console.error('Erro ao adicionar matéria ao ciclo:', error);
      throw error;
    }
  };

  const handleRemoveDisciplineFromCycle = async (cycle, disciplineName) => {
    try {
      const filteredSubjects = cycle.subjects.filter(s => s.name !== disciplineName);
      
      // Re-index order_in_queue to prevent gaps
      const reindexedSubjects = filteredSubjects.map((s, index) => ({
        ...s,
        order_in_queue: index
      }));

      const redistributedSubjects = recalculateTimeDistribution(reindexedSubjects, totalAvailableMinutes);
      
      await pb.collection('studyCycles').update(cycle.id, {
        subjects: redistributedSubjects
      }, { $autoCancel: false });
      
      await fetchCycles();
    } catch (error) {
      console.error('Erro ao remover matéria do ciclo:', error);
      throw error;
    }
  };

  const activeCycle = cycles.find(c => c.status === 'active');
  const archivedCycles = cycles.filter(c => c.status !== 'active');

  return (
    <>
      <Helmet>
        <title>Ciclos de Estudo - WATSON</title>
        <meta name="description" content="Gerencie seus ciclos de estudo com distribuição inteligente de tempo." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Sidebar />
        
        <div className="content-with-sidebar">
          <main className="p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
                    Ciclos de Estudo
                  </h1>
                  <p className="text-muted-foreground">
                    Distribuição inteligente de tempo baseada na sua rotina
                  </p>
                </div>
                
                <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                  setIsCreateDialogOpen(open);
                  if (open) refetchTotalTime(); // Ensure we have latest time when opening
                }}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="rounded-full shadow-lg shadow-primary/20">
                      <Plus className="w-5 h-5 mr-2" />
                      Novo Ciclo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">Criar Novo Ciclo</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-8 py-4">
                      {totalAvailableMinutes === 0 && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Você não tem horários de estudo definidos na sua Rotina. 
                            O tempo alocado será 0. Vá para a página de Rotina para definir seus horários.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-3">
                        <Label className="text-base">Nome do Ciclo</Label>
                        <Input
                          value={newCycle.cycleName}
                          onChange={(e) => setNewCycle({ ...newCycle, cycleName: e.target.value })}
                          placeholder="Ex: Preparação ENEM 2026"
                          className="text-lg py-6"
                        />
                      </div>

                      <div className="space-y-4 bg-muted/30 p-6 rounded-2xl border border-border/50">
                        <div>
                          <Label className="text-base mb-1 block">Adicionar Matérias</Label>
                          <p className="text-sm text-muted-foreground mb-4">
                            Defina o peso (1 a 5) para cada matéria. O sistema calculará o tempo automaticamente.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                          <div className="md:col-span-6 space-y-2">
                            <Label className="text-xs text-muted-foreground">Nome da Matéria</Label>
                            <Input
                              placeholder="Ex: Matemática"
                              value={newSubject.name}
                              onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                            />
                          </div>
                          <div className="md:col-span-4 space-y-2">
                            <Label className="text-xs text-muted-foreground">Peso / Importância (1-5)</Label>
                            <div className="flex items-center gap-2 bg-background border border-input rounded-md px-3 h-10">
                              <input
                                type="range"
                                min="1"
                                max="5"
                                step="1"
                                value={newSubject.rank}
                                onChange={(e) => setNewSubject({ ...newSubject, rank: parseInt(e.target.value) })}
                                className="flex-1 accent-primary"
                              />
                              <span className="font-bold text-primary w-4 text-center">{newSubject.rank}</span>
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <Button 
                              type="button" 
                              onClick={handleAddSubject}
                              className="w-full"
                              disabled={!newSubject.name.trim()}
                            >
                              Adicionar
                            </Button>
                          </div>
                        </div>

                        {newCycle.subjects.length > 0 && (
                          <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between text-sm font-medium text-muted-foreground px-2">
                              <span>Matéria e Peso</span>
                              <span>Tempo Calculado</span>
                            </div>
                            {newCycle.subjects.map((subject, index) => {
                              const hours = Math.floor(subject.allocated_time / 60);
                              const mins = subject.allocated_time % 60;
                              
                              return (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-background border border-border rounded-xl shadow-sm"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex bg-primary/10 px-2 py-1 rounded-md">
                                      <Star className="w-4 h-4 fill-primary text-primary mr-1" />
                                      <span className="text-xs font-bold text-primary">{subject.rank}</span>
                                    </div>
                                    <span className="font-medium">{subject.name}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm font-semibold">
                                      {hours > 0 ? `${hours}h ` : ''}{mins}m
                                    </span>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                      onClick={() => handleRemoveSubject(index)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                            
                            <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
                              <span className="text-sm font-medium text-muted-foreground">Tempo Total Distribuído:</span>
                              <span className="font-bold text-primary">
                                {Math.floor(totalAvailableMinutes / 60)}h {totalAvailableMinutes % 60}m
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter className="pt-4">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateCycle}
                        disabled={!newCycle.cycleName || newCycle.subjects.length === 0}
                      >
                        Salvar Ciclo
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {activeCycle ? (
                <div className="mb-12 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-semibold uppercase tracking-wider">
                          Ciclo Ativo
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold">{activeCycle.cycleName}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => handleRecalculateActiveCycle(activeCycle)}
                        title="Recalcular tempos com base na rotina atual"
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        Sincronizar Tempos
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteCycle(activeCycle.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Encerrar
                      </Button>
                    </div>
                  </div>

                  <StudyQueueDisplay 
                    cycle={activeCycle} 
                    onQueueUpdate={fetchCycles}
                    onAddDiscipline={handleAddDisciplineToCycle}
                    onRemoveDiscipline={handleRemoveDisciplineFromCycle}
                  />
                </div>
              ) : (
                <Card className="mb-12 border-dashed bg-muted/10">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Calculator className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Nenhum ciclo ativo</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      Crie um ciclo de estudos para que o sistema distribua seu tempo disponível automaticamente entre as matérias.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      Criar Meu Primeiro Ciclo
                    </Button>
                  </CardContent>
                </Card>
              )}

              {archivedCycles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Histórico de Ciclos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {archivedCycles.map((cycle) => (
                      <Card key={cycle.id} className="bg-muted/30 shadow-none">
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-semibold line-clamp-1">{cycle.cycleName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {cycle.subjects?.length || 0} matérias • {cycle.totalCycleDuration || 0}h
                              </p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteCycle(cycle.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {cycle.subjects?.slice(0, 3).map((sub, idx) => (
                              <span key={idx} className="text-xs bg-background border border-border px-2 py-1 rounded-md">
                                {sub.name}
                              </span>
                            ))}
                            {(cycle.subjects?.length || 0) > 3 && (
                              <span className="text-xs bg-background border border-border px-2 py-1 rounded-md text-muted-foreground">
                                +{(cycle.subjects?.length || 0) - 3}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default CiclosPage;
