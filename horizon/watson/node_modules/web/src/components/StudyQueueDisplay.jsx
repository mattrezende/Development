
import React, { useState, useEffect } from 'react';
import { RefreshCw, ListOrdered, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DisciplineQueueCard from './DisciplineQueueCard.jsx';
import TimeAllocationChart from './TimeAllocationChart.jsx';
import AddDisciplineModal from './AddDisciplineModal.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const StudyQueueDisplay = ({ cycle, onQueueUpdate, onAddDiscipline, onRemoveDiscipline }) => {
  const [disciplines, setDisciplines] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (cycle?.subjects) {
      // Ensure subjects are sorted by order_in_queue
      const sorted = [...cycle.subjects].sort((a, b) => 
        (a.order_in_queue ?? 0) - (b.order_in_queue ?? 0)
      );
      setDisciplines(sorted);
    }
  }, [cycle]);

  const totalCycleMinutes = disciplines.reduce((sum, d) => sum + (d.allocated_time || 0), 0);
  const totalHours = Math.floor(totalCycleMinutes / 60);
  const totalMins = totalCycleMinutes % 60;

  const handleMove = async (index, direction) => {
    if (
      (direction === -1 && index === 0) || 
      (direction === 1 && index === disciplines.length - 1)
    ) return;

    const newDisciplines = [...disciplines];
    const temp = newDisciplines[index];
    newDisciplines[index] = newDisciplines[index + direction];
    newDisciplines[index + direction] = temp;

    // Update order_in_queue property
    const updatedDisciplines = newDisciplines.map((d, i) => ({
      ...d,
      order_in_queue: i
    }));

    setDisciplines(updatedDisciplines);
    
    // Save to backend
    try {
      setIsUpdating(true);
      await pb.collection('studyCycles').update(cycle.id, {
        subjects: updatedDisciplines
      }, { $autoCancel: false });
      
      if (onQueueUpdate) onQueueUpdate();
    } catch (error) {
      console.error('Error updating queue order:', error);
      toast.error('Erro ao reordenar a fila');
      // Revert on error
      setDisciplines(disciplines);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddSubmit = async (newDiscipline) => {
    if (!onAddDiscipline) return;
    
    setIsUpdating(true);
    try {
      await onAddDiscipline(cycle, newDiscipline);
      toast.success(`${newDiscipline.name} adicionada ao ciclo!`);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding discipline:', error);
      toast.error('Erro ao adicionar matéria');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveSubmit = async (disciplineName) => {
    if (!onRemoveDiscipline) return;
    
    setIsUpdating(true);
    try {
      await onRemoveDiscipline(cycle, disciplineName);
      toast.success(`${disciplineName} removida do ciclo!`);
    } catch (error) {
      console.error('Error removing discipline:', error);
      toast.error('Erro ao remover matéria');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!cycle || disciplines.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Summary & Chart */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-primary/5 border-primary/20 shadow-none">
            <CardContent className="p-6 text-center">
              <p className="text-sm font-medium text-primary mb-1">Tempo Total do Ciclo</p>
              <div className="text-4xl font-bold text-primary tracking-tight">
                {totalHours}h {totalMins > 0 ? `${totalMins}m` : ''}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Baseado na sua rotina semanal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Distribuição de Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeAllocationChart disciplines={disciplines} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Queue */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-primary" />
                <CardTitle className="text-xl">Fila de Estudos</CardTitle>
              </div>
              {isUpdating && (
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Salvando...
                </span>
              )}
            </CardHeader>
            <CardContent className="p-4 flex-1 bg-muted/10">
              <div className="space-y-3">
                {disciplines.map((discipline, index) => (
                  <DisciplineQueueCard
                    key={`${discipline.name}-${index}`}
                    discipline={discipline}
                    totalCycleMinutes={totalCycleMinutes}
                    isFirst={index === 0}
                    isLast={index === disciplines.length - 1}
                    onMoveUp={() => handleMove(index, -1)}
                    onMoveDown={() => handleMove(index, 1)}
                    onRemove={onRemoveDiscipline ? handleRemoveSubmit : undefined}
                  />
                ))}
                
                {onAddDiscipline && (
                  <Button 
                    variant="outline" 
                    className="w-full border-dashed border-2 h-14 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    onClick={() => setIsAddModalOpen(true)}
                    disabled={isUpdating}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Adicionar Matéria
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddDisciplineModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddSubmit} 
      />
    </div>
  );
};

export default StudyQueueDisplay;
