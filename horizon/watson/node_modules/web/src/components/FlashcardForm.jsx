
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

const FlashcardForm = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    discipline: '',
    topic: '',
    question: '',
    answer: '',
    difficulty: 3,
  });

  useEffect(() => {
    if (isOpen) {
      fetchDisciplines();
    }
  }, [isOpen]);

  const fetchDisciplines = async () => {
    try {
      const cycles = await pb.collection('studyCycles').getFullList({
        filter: `userId = "${currentUser.id}" && status = "active"`,
        $autoCancel: false,
      });

      const allDisciplines = new Set();
      cycles.forEach((cycle) => {
        if (cycle.subjects && Array.isArray(cycle.subjects)) {
          cycle.subjects.forEach((subject) => {
            if (subject.name) allDisciplines.add(subject.name);
          });
        }
      });

      setDisciplines(Array.from(allDisciplines));
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await pb.collection('flashcards').create({
        userId: currentUser.id,
        discipline: formData.discipline,
        topic: formData.topic,
        question: formData.question,
        answer: formData.answer,
        difficulty: formData.difficulty,
        reviewCount: 0,
      }, { $autoCancel: false });

      setFormData({
        discipline: '',
        topic: '',
        question: '',
        answer: '',
        difficulty: 3,
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar flashcard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-semibold">Criar Flashcard</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="discipline">Disciplina</Label>
            <Select
              value={formData.discipline}
              onValueChange={(value) => setFormData({ ...formData, discipline: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a disciplina" />
              </SelectTrigger>
              <SelectContent>
                {disciplines.map((discipline) => (
                  <SelectItem key={discipline} value={discipline}>
                    {discipline}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Tópico</Label>
            <Input
              id="topic"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="Digite o tópico"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Pergunta</Label>
            <Textarea
              id="question"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Digite a pergunta"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Resposta</Label>
            <Textarea
              id="answer"
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Digite a resposta"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Dificuldade (1-5)</Label>
            <Input
              id="difficulty"
              type="number"
              min="1"
              max="5"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Salvando...' : 'Salvar Flashcard'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlashcardForm;
