
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COMMON_SUBJECTS = [
  'Matemática',
  'Português',
  'História',
  'Geografia',
  'Física',
  'Química',
  'Biologia',
  'Inglês',
  'Redação',
  'Informática',
  'Direito Constitucional',
  'Direito Administrativo',
  'Raciocínio Lógico',
  'Outra'
];

const AddDisciplineModal = ({ isOpen, onClose, onAdd }) => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [rank, setRank] = useState(3);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const finalName = selectedSubject === 'Outra' ? customSubject.trim() : selectedSubject;

    if (!finalName) {
      setError('Por favor, selecione ou digite o nome da matéria.');
      return;
    }

    if (rank < 1 || rank > 5) {
      setError('O peso deve ser entre 1 e 5.');
      return;
    }

    onAdd({ name: finalName, rank: Number(rank) });
    resetForm();
  };

  const resetForm = () => {
    setSelectedSubject('');
    setCustomSubject('');
    setRank(3);
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetForm()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Matéria</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Matéria</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger id="subject" className={!selectedSubject ? "text-muted-foreground" : ""}>
                  <SelectValue placeholder="Selecione uma matéria" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSubject === 'Outra' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="customSubject">Nome da Matéria</Label>
                <Input
                  id="customSubject"
                  placeholder="Digite o nome da matéria"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="text-foreground"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="rank">Peso / Importância (1-5)</Label>
              <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-lg border border-border">
                <input
                  id="rank"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={rank}
                  onChange={(e) => setRank(parseInt(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary font-bold rounded-md">
                  {rank}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                1 = Menor prioridade, 5 = Maior prioridade
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button type="submit">
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDisciplineModal;
