import React from 'react';
import { Calendar, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import apiClient from '@/lib/apiClient';

const PostCard = ({ post, onClick, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const getPreview = (content) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText;
  };

  const getFirstImage = () => {
    if (post.imagens && post.imagens.length > 0) {
      return apiClient.imageUrl(post.imagens[0].url);
    }
    return null;
  };

  const firstImage = getFirstImage();

  return (
    <Card 
      onClick={() => onClick && onClick(post)}
      role={onClick ? "button" : "article"}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(post);
        }
      }}
      className={`h-full flex flex-col bg-card overflow-hidden transition-all duration-300 border border-border shadow-sm
        ${onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-primary/20' : ''}
      `}
    >
      {firstImage && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={firstImage}
            alt={post.titulo}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3 font-medium">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(post.createdAt)}</span>
        </div>
        <CardTitle className="heading-section text-2xl leading-snug text-balance">
          {post.titulo}
        </CardTitle>
        {post.subtitulo && (
          <p className="text-muted-foreground mt-2 font-medium text-balance">
            {post.subtitulo}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-base leading-relaxed text-foreground/80">
          {getPreview(post.conteudo)}
        </p>
      </CardContent>
      {(onEdit || onDelete) && (
        <CardFooter className="border-t border-border pt-4 flex justify-end space-x-2 mt-auto bg-muted/20">
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(post);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(post);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default PostCard;