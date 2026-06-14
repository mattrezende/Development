
import React, { useState, useEffect } from 'react';
import { RotateCcw, XCircle, AlertTriangle, MinusCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FlashcardCard = ({ flashcard, isFlipped, onFlip, onPerformanceSubmit, disabled }) => {
  const [localFlipped, setLocalFlipped] = useState(false);

  // Sync with parent state if provided, otherwise use local state
  const flipped = isFlipped !== undefined ? isFlipped : localFlipped;
  
  const handleFlip = () => {
    if (disabled) return;
    if (onFlip) {
      onFlip(!flipped);
    } else {
      setLocalFlipped(!localFlipped);
    }
  };

  const handlePerformance = (e, performance) => {
    e.stopPropagation();
    if (disabled) return;
    if (onPerformanceSubmit) {
      onPerformanceSubmit(flashcard.id, performance);
    }
  };

  // Reset flip state when flashcard changes
  useEffect(() => {
    if (isFlipped === undefined) {
      setLocalFlipped(false);
    }
  }, [flashcard.id, isFlipped]);

  if (!flashcard) return null;

  return (
    <div className="w-full max-w-2xl mx-auto aspect-[4/3] perspective-1000 cursor-pointer group" onClick={handleFlip}>
      <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
        
        {/* FRONT FACE */}
        <div className="flashcard-face p-8 flex flex-col items-center justify-center text-center hover:shadow-xl transition-shadow">
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-sm text-muted-foreground">
            <span className="font-medium bg-muted px-3 py-1 rounded-full">{flashcard.disciplineId}</span>
            <span>{flashcard.subject}</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center w-full">
            <h3 className="text-2xl md:text-3xl font-semibold text-balance leading-snug">
              {flashcard.question}
            </h3>
          </div>
          
          <div className="mt-auto pt-6 flex flex-col items-center text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity">
            <RotateCcw className="w-6 h-6 mb-2 animate-pulse" />
            <span className="text-sm font-medium">Clique ou pressione Espaço para virar</span>
          </div>
        </div>

        {/* BACK FACE */}
        <div className="flashcard-face flashcard-back p-8 flex flex-col">
          <div className="flex-1 flex items-center justify-center w-full overflow-y-auto mb-6">
            <div className="text-lg md:text-xl text-balance whitespace-pre-wrap">
              {flashcard.answer}
            </div>
          </div>
          
          <div className="mt-auto pt-4 border-t border-border" onClick={(e) => e.stopPropagation()}>
            <p className="text-center text-sm font-medium text-muted-foreground mb-4">
              Como você se saiu? (Use 1-4 no teclado)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                className="h-auto py-3 flex flex-col gap-1 border-[hsl(var(--perf-errei))] hover:bg-[hsl(var(--perf-errei))/10] hover:text-[hsl(var(--perf-errei))]"
                onClick={(e) => handlePerformance(e, 'errei')}
              >
                <XCircle className="w-5 h-5 text-[hsl(var(--perf-errei))]" />
                <span>Errei (1)</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-3 flex flex-col gap-1 border-[hsl(var(--perf-dificil))] hover:bg-[hsl(var(--perf-dificil))/10] hover:text-[hsl(var(--perf-dificil))]"
                onClick={(e) => handlePerformance(e, 'dificil')}
              >
                <AlertTriangle className="w-5 h-5 text-[hsl(var(--perf-dificil))]" />
                <span>Difícil (2)</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-3 flex flex-col gap-1 border-[hsl(var(--perf-medio))] hover:bg-[hsl(var(--perf-medio))/10] hover:text-[hsl(var(--perf-medio))]"
                onClick={(e) => handlePerformance(e, 'medio')}
              >
                <MinusCircle className="w-5 h-5 text-[hsl(var(--perf-medio))]" />
                <span>Médio (3)</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-3 flex flex-col gap-1 border-[hsl(var(--perf-facil))] hover:bg-[hsl(var(--perf-facil))/10] hover:text-[hsl(var(--perf-facil))]"
                onClick={(e) => handlePerformance(e, 'facil')}
              >
                <CheckCircle2 className="w-5 h-5 text-[hsl(var(--perf-facil))]" />
                <span>Fácil (4)</span>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FlashcardCard;
