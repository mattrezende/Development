import React from 'react';
import { Calendar, Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const EventCard = ({ event, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      // Extract just the YYYY-MM-DD part to avoid timezone shifts
      const datePart = dateString.substring(0, 10);
      // parseISO with just the date part creates a local date at midnight, 
      // preventing the UTC offset from shifting it to the previous day
      const date = parseISO(datePart);
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
      <CardHeader>
        <CardTitle className="heading-section text-xl">{event.titulo}</CardTitle>
        {event.subtitulo && (
          <p className="text-muted-foreground mt-2">{event.subtitulo}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        <div className="flex items-start space-x-3">
          <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <span className="text-sm">{formatDate(event.data)}</span>
        </div>
        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <span className="text-sm">{event.horario}</span>
        </div>
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <span className="text-sm">{event.local}</span>
        </div>
      </CardContent>
      {(onEdit || onDelete) && (
        <CardFooter className="border-t border-border pt-4 flex justify-end space-x-2 mt-auto">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(event)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(event)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default EventCard;