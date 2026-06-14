
import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, Layers, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FlashcardList = ({ flashcards, loading, onAdd, onEdit, onDelete, onStartSession }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('all');

  // Extract unique disciplines for filter
  const disciplines = useMemo(() => {
    const unique = new Set(flashcards.map(f => f.disciplineId));
    return Array.from(unique).sort();
  }, [flashcards]);

  // Filter and group flashcards
  const filteredCards = useMemo(() => {
    return flashcards.filter(card => {
      const matchesSearch = 
        card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDiscipline = disciplineFilter === 'all' || card.disciplineId === disciplineFilter;
      return matchesSearch && matchesDiscipline;
    });
  }, [flashcards, searchTerm, disciplineFilter]);

  // Group by discipline -> subject
  const groupedCards = useMemo(() => {
    const groups = {};
    filteredCards.forEach(card => {
      if (!groups[card.disciplineId]) {
        groups[card.disciplineId] = {};
      }
      if (!groups[card.disciplineId][card.subject]) {
        groups[card.disciplineId][card.subject] = [];
      }
      groups[card.disciplineId][card.subject].push(card);
    });
    return groups;
  }, [filteredCards]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[200px]" />
        </div>
        {[1, 2, 3].map(i => (
          <Card key={i} className="overflow-hidden">
            <div className="bg-muted/50 p-4 border-b border-border">
              <Skeleton className="h-6 w-[150px]" />
            </div>
            <CardContent className="p-4 space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex-1 flex items-center gap-3 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar flashcards..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-foreground"
            />
          </div>
          <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas as Disciplinas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Disciplinas</SelectItem>
              {disciplines.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAdd} className="w-full sm:w-auto shadow-md shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Novo Flashcard
        </Button>
      </div>

      {/* Empty State */}
      {filteredCards.length === 0 && (
        <div className="text-center py-20 bg-muted/10 rounded-2xl border border-dashed border-border">
          <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Nenhum flashcard encontrado</h3>
          <p className="text-muted-foreground mb-6">
            {flashcards.length === 0 
              ? "Você ainda não criou nenhum flashcard." 
              : "Nenhum flashcard corresponde aos filtros atuais."}
          </p>
          {flashcards.length === 0 && (
            <Button onClick={onAdd} variant="outline">Criar o primeiro</Button>
          )}
        </div>
      )}

      {/* Grouped List */}
      <div className="space-y-8">
        {Object.entries(groupedCards).map(([discipline, subjects]) => (
          <div key={discipline} className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ letterSpacing: '-0.02em' }}>
              <div className="w-2 h-6 bg-primary rounded-full"></div>
              {discipline}
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(subjects).map(([subject, cards]) => (
                <Card key={subject} className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-muted/30 px-5 py-3 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{subject}</h3>
                      <Badge variant="secondary" className="font-normal">
                        {cards.length} {cards.length === 1 ? 'cartão' : 'cartões'}
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => onStartSession(cards)}
                    >
                      <Play className="w-4 h-4 mr-2 fill-current" />
                      Estudar Tópico
                    </Button>
                  </div>
                  
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                      {cards.map(card => (
                        <div key={card.id} className="p-5 flex flex-col sm:flex-row gap-4 hover:bg-muted/10 transition-colors group">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-base mb-1 line-clamp-2">{card.question}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{card.answer}</p>
                          </div>
                          <div className="flex items-start gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" onClick={() => onEdit(card)} className="h-8 w-8">
                              <Edit2 className="w-4 h-4 text-muted-foreground" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => onDelete(card.id)} className="h-8 w-8 hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardList;
