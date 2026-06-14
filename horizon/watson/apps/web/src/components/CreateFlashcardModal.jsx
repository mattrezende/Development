
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

const CreateFlashcardModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const { currentUser } = useAuth();
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    disciplineId: '',
    subject: '',
    question: '',
    answer: '',
    difficulty_level: 3
  });

  // Fetch disciplines from study cycles
  useEffect(() => {
    const fetchDisciplines = async () => {
      if (!currentUser?.id) return;
      try {
        const cycles = await pb.collection('studyCycles').getFullList({
          filter: `userId = "${currentUser.id}" && status = "active"`,
          $autoCancel: false
        });
        
        const uniqueDisciplines = new Set();
        cycles.forEach(cycle => {
          if (cycle.subjects && Array.isArray(cycle.subjects)) {
            cycle.subjects.forEach(sub => uniqueDisciplines.add(sub.name));
          }
        });
        
        setDisciplines(Array.from(uniqueDisciplines));
      } catch (error) {
        console.error("Error fetching disciplines:", error);
      }
    };
    
    if (isOpen) {
      fetchDisciplines();
    }
  }, [currentUser?.id, isOpen]);

  // Set initial data if editing
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        disciplineId: initialData.disciplineId || '',
        subject: initialData.subject || '',
        question: initialData.question || '',
        answer: initialData.answer || '',
        difficulty_level: initialData.difficulty_level || 3
      });
    } else if (isOpen && !initialData) {
      setFormData({
        disciplineId: '',
        subject: '',
        question: '',
        answer: '',
        difficulty_level: 3
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving flashcard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Flashcard' : 'Novo Flashcard'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="disciplineId">Disciplina</Label>
              <Select 
                value={formData.disciplineId} 
                onValueChange={(val) => handleChange('disciplineId', val)}
                required
              >
                <SelectTrigger id="disciplineId">
                  <SelectValue placeholder="Selecione a disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {disciplines.length > 0 ? (
                    disciplines.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="Geral">Geral</SelectItem>
                  )}
                  {/* Allow custom input fallback if needed, but Select is strict. 
                      For simplicity, we add a few defaults if empty */}
                  {disciplines.length === 0 && (
                    <>
                      <SelectItem value="Matemática">Matemática</SelectItem>
                      <SelectItem value="Português">Português</SelectItem>
                      <SelectItem value="História">História</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Assunto / Tópico</Label>
              <Input 
                id="subject" 
                placeholder="Ex: Geometria Plana" 
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                required
                className="text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Frente (Pergunta)</Label>
            <Textarea 
              id="question" 
              placeholder="Digite a pergunta ou conceito..." 
              value={formData.question}
              onChange={(e) => handleChange('question', e.target.value)}
              required
              className="min-h-[100px] text-lg resize-y text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Verso (Resposta)</Label>
            <Textarea 
              id="answer" 
              placeholder="Digite a resposta detalhada..." 
              value={formData.answer}
              onChange={(e) => handleChange('answer', e.target.value)}
              required
              className="min-h-[150px] text-base resize-y text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label>Nível de Dificuldade Inicial (1-5)</Label>
            <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-lg border border-border">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={formData.difficulty_level}
                onChange={(e) => handleChange('difficulty_level', parseInt(e.target.value))}
                className="flex-1 accent-primary"
              />
              <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary font-bold rounded-md">
                {formData.difficulty_level}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Flashcard'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFlashcardModal;
