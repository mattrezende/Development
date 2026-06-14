
import React, { useState, useEffect, useCallback } from 'react';
import { Shuffle, ArrowLeft, ArrowRight, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import FlashcardCard from './FlashcardCard.jsx';
import { useFlashcardReviews } from '@/hooks/useFlashcardReviews';

const FlashcardReviewer = ({ flashcards, onComplete, onClose }) => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionReviews, setSessionReviews] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  
  const { submitReview, getSessionStats } = useFlashcardReviews();

  // Initialize cards
  useEffect(() => {
    if (flashcards && flashcards.length > 0) {
      setCards([...flashcards]);
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionReviews([]);
      setShowSummary(false);
    }
  }, [flashcards]);

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(true);
  };

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150); // Small delay for flip animation
    } else {
      setShowSummary(true);
    }
  }, [currentIndex, cards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  }, [currentIndex]);

  const handlePerformanceSubmit = async (flashcardId, performance) => {
    try {
      // Save review to database
      await submitReview(flashcardId, performance);
      
      // Add to session stats
      setSessionReviews(prev => [...prev, { flashcardId, performance }]);
      
      // Move to next card
      handleNext();
    } catch (error) {
      console.error("Failed to submit review", error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showSummary) return;

      // Space or Enter to flip
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      }
      
      // Arrow keys for navigation
      if (e.code === 'ArrowLeft') {
        handlePrev();
      } else if (e.code === 'ArrowRight' && !isFlipped) {
        // Only allow skipping forward without answering if not flipped
        handleNext();
      }

      // 1-4 for performance (only when flipped)
      if (isFlipped) {
        const currentCard = cards[currentIndex];
        if (!currentCard) return;

        switch (e.key) {
          case '1': handlePerformanceSubmit(currentCard.id, 'errei'); break;
          case '2': handlePerformanceSubmit(currentCard.id, 'dificil'); break;
          case '3': handlePerformanceSubmit(currentCard.id, 'medio'); break;
          case '4': handlePerformanceSubmit(currentCard.id, 'facil'); break;
          default: break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, cards, showSummary, handleNext, handlePrev]);

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Nenhum flashcard encontrado</h3>
        <p className="text-muted-foreground mb-6">Adicione flashcards para começar a estudar.</p>
        {onClose && <Button onClick={onClose}>Voltar</Button>}
      </div>
    );
  }

  const progress = ((currentIndex) / cards.length) * 100;
  const currentCard = cards[currentIndex];
  const stats = getSessionStats(sessionReviews);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      {/* Header / Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h2 className="text-xl font-bold">Sessão de Estudo</h2>
            <p className="text-sm text-muted-foreground">
              Cartão {currentIndex + 1} de {cards.length}
            </p>
          </div>
        </div>
        
        <Button 
          variant={isShuffled ? "secondary" : "outline"} 
          size="sm" 
          onClick={handleShuffle}
          className="gap-2"
        >
          <Shuffle className="w-4 h-4" />
          <span className="hidden sm:inline">Embaralhar</span>
        </Button>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-2 mb-8" />

      {/* Flashcard Area */}
      <div className="flex-1 flex flex-col justify-center min-h-[400px] mb-8">
        {currentCard && (
          <FlashcardCard 
            flashcard={currentCard}
            isFlipped={isFlipped}
            onFlip={setIsFlipped}
            onPerformanceSubmit={handlePerformanceSubmit}
          />
        )}
      </div>

      {/* Navigation Controls (Fallback for touch/mouse) */}
      <div className="flex justify-between items-center mt-auto pt-4">
        <Button 
          variant="ghost" 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Anterior
        </Button>
        
        <span className="text-sm text-muted-foreground font-medium">
          {Math.round(progress)}% Concluído
        </span>

        <Button 
          variant="ghost" 
          onClick={handleNext}
          className="gap-2"
        >
          {currentIndex === cards.length - 1 ? 'Finalizar' : 'Pular'} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Summary Modal */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Sessão Concluída!
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">{stats.accuracy}%</div>
              <p className="text-muted-foreground font-medium">Taxa de Acerto</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[hsl(var(--perf-facil))/10] border border-[hsl(var(--perf-facil))/20] p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-[hsl(var(--perf-facil))]">{stats.facil}</div>
                <div className="text-sm font-medium text-[hsl(var(--perf-facil))]">Fácil</div>
              </div>
              <div className="bg-[hsl(var(--perf-medio))/10] border border-[hsl(var(--perf-medio))/20] p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-[hsl(var(--perf-medio))]">{stats.medio}</div>
                <div className="text-sm font-medium text-[hsl(var(--perf-medio))]">Médio</div>
              </div>
              <div className="bg-[hsl(var(--perf-dificil))/10] border border-[hsl(var(--perf-dificil))/20] p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-[hsl(var(--perf-dificil))]">{stats.dificil}</div>
                <div className="text-sm font-medium text-[hsl(var(--perf-dificil))]">Difícil</div>
              </div>
              <div className="bg-[hsl(var(--perf-errei))/10] border border-[hsl(var(--perf-errei))/20] p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-[hsl(var(--perf-errei))]">{stats.errei}</div>
                <div className="text-sm font-medium text-[hsl(var(--perf-errei))]">Errei</div>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-xl flex justify-between items-center">
              <span className="font-medium">Total Revisado:</span>
              <span className="font-bold text-lg">{stats.total} cartões</span>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => {
              setShowSummary(false);
              if (onClose) onClose();
            }} className="w-full sm:w-auto">
              Fechar
            </Button>
            <Button onClick={() => {
              setShowSummary(false);
              if (onComplete) onComplete();
            }} className="w-full sm:w-auto">
              Revisar Novamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlashcardReviewer;
