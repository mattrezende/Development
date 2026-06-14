
import React, { useState } from 'react';
import { GripVertical, Clock, Star, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DisciplineQueueCard = ({ discipline, totalCycleMinutes, onMoveUp, onMoveDown, isFirst, isLast, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const { name, rank, allocated_time } = discipline;
  
  const hours = Math.floor(allocated_time / 60);
  const minutes = allocated_time % 60;
  const timeString = hours > 0 
    ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    : `${minutes}m`;

  // Calculate percentage for progress bar
  const percentage = totalCycleMinutes > 0 
    ? Math.min(100, Math.round((allocated_time / totalCycleMinutes) * 100)) 
    : 0;

  const handleRemove = async () => {
    if (!onRemove) return;
    setIsRemoving(true);
    try {
      await onRemove(name);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Card className={`group hover:shadow-md transition-all duration-200 border-border/50 overflow-hidden ${isRemoving ? 'opacity-50 pointer-events-none' : ''}`}>
      <CardContent className="p-4 flex items-center gap-4">
        {/* Drag Handle / Reorder Controls */}
        <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
          <button 
            onClick={onMoveUp} 
            disabled={isFirst || isRemoving}
            className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Mover para cima"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          </button>
          <GripVertical className="w-4 h-4 opacity-50" />
          <button 
            onClick={onMoveDown} 
            disabled={isLast || isRemoving}
            className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Mover para baixo"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-base truncate">{name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs font-normal flex items-center gap-1">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  Peso {rank}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5 text-primary font-semibold">
                  <Clock className="w-4 h-4" />
                  <span>{timeString}</span>
                </div>
                <span className="text-xs text-muted-foreground">{percentage}% do ciclo</span>
              </div>
              
              {onRemove && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isRemoving}
                    >
                      {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover matéria?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover <strong>{name}</strong> deste ciclo? 
                        O tempo será redistribuído automaticamente entre as outras matérias.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          <Progress value={percentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default DisciplineQueueCard;
