import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import apiClient from '@/lib/apiClient';

const PostModal = ({ post, isOpen, onClose }) => {
  if (!post) return null;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const getFirstImage = () => {
    if (post.imagens && post.imagens.length > 0) {
      return apiClient.imageUrl(post.imagens[0].url);
    }
    return null;
  };

  const firstImage = getFirstImage();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* 
        Using standard shadcn DialogContent but stripping default animations 
        so we can apply custom framer-motion animations inside 
      */}
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card text-card-foreground border-border rounded-2xl [&>button]:hidden">
        <DialogTitle className="sr-only">{post.titulo}</DialogTitle>
        <DialogDescription className="sr-only">Visualização completa da postagem</DialogDescription>
        
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex flex-col max-h-[85vh] overflow-y-auto w-full"
            >
              {firstImage && (
                <div className="w-full h-64 sm:h-80 md:h-[400px] overflow-hidden relative group shrink-0">
                  <img
                    src={firstImage}
                    alt={post.titulo}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  <DialogClose className="absolute top-4 right-4 bg-black/40 hover:bg-black/70 text-white rounded-full p-2.5 transition-all duration-200 backdrop-blur-sm shadow-lg z-10">
                    <X className="w-5 h-5" />
                  </DialogClose>
                </div>
              )}
              
              <div className="p-6 md:p-10 space-y-8 relative">
                {!firstImage && (
                  <DialogClose className="absolute top-6 right-6 text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-full p-2 transition-all duration-200">
                    <X className="w-5 h-5" />
                  </DialogClose>
                )}
                
                <header className="space-y-4 pr-12">
                  <h2 className="heading-display text-3xl md:text-4xl lg:text-5xl text-primary font-bold tracking-tight">
                    {post.titulo}
                  </h2>
                  
                  {post.subtitulo && (
                    <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                      {post.subtitulo}
                    </p>
                  )}
                  
                  <div className="flex items-center text-sm md:text-base text-muted-foreground space-x-2 font-medium bg-muted w-fit px-3 py-1.5 rounded-full">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </header>

                <div className="w-full h-px bg-border" />

                <div 
                  className="prose prose-neutral dark:prose-invert prose-lg max-w-none leading-relaxed whitespace-pre-wrap text-foreground/90"
                  dangerouslySetInnerHTML={{ __html: post.conteudo }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default PostModal;