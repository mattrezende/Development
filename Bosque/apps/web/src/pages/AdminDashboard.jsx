import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, FileText, Plus, RefreshCw } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import EventCard from '@/components/EventCard.jsx';
import PostCard from '@/components/PostCard.jsx';
import EventForm from '@/components/EventForm.jsx';
import PostForm from '@/components/PostForm.jsx';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.jsx';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';

const AdminDashboard = () => {
  // Data states
  const [eventos, setEventos] = useState([]);
  const [postagens, setPostagens] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Form states
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const [isPostSheetOpen, setIsPostSheetOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'evento' | 'postagem', id: string, name: string }
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEventos = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const records = await apiClient.get('/api/eventos?sort=-data');
      setEventos(records);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  const fetchPostagens = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const records = await apiClient.get('/api/postagens?sort=-createdAt');
      setPostagens(records);
    } catch (error) {
      console.error('Erro ao carregar postagens:', error);
      toast.error('Erro ao carregar postagens');
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    fetchEventos();
    fetchPostagens();
  }, [fetchEventos, fetchPostagens]);

  // Event Handlers
  const handleOpenEventForm = (event = null) => {
    setSelectedEvent(event);
    setIsEventSheetOpen(true);
  };

  const handleOpenPostForm = (post = null) => {
    setSelectedPost(post);
    setIsPostSheetOpen(true);
  };

  const handleDeleteClick = (type, item) => {
    setItemToDelete({
      type,
      id: item.id,
      name: item.titulo
    });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      const resource = itemToDelete.type === 'evento' ? 'eventos' : 'postagens';
      await apiClient.del(`/api/${resource}/${itemToDelete.id}`);
      toast.success(`${itemToDelete.type === 'evento' ? 'Evento' : 'Postagem'} excluído(a) com sucesso`);
      
      if (itemToDelete.type === 'evento') {
        fetchEventos();
      } else {
        fetchPostagens();
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir o item');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Painel Administrativo - Bosque de Francisco</title>
        <meta name="description" content="Gerencie eventos e postagens da Sala Documentada." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h1 className="heading-display text-4xl">Painel Administrativo</h1>
              </div>

              <Tabs defaultValue="eventos" className="space-y-8">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="eventos">
                    <Calendar className="w-4 h-4 mr-2" />
                    Eventos
                  </TabsTrigger>
                  <TabsTrigger value="postagens">
                    <FileText className="w-4 h-4 mr-2" />
                    Postagens
                  </TabsTrigger>
                </TabsList>

                {/* EVENTOS TAB */}
                <TabsContent value="eventos" className="space-y-6">
                  <div className="flex justify-between items-center bg-card p-4 rounded-lg shadow-sm border border-border">
                    <h2 className="heading-section text-xl">Gerenciar Eventos</h2>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" onClick={fetchEventos} disabled={loadingEvents}>
                        <RefreshCw className={`w-4 h-4 ${loadingEvents ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button onClick={() => handleOpenEventForm()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Evento
                      </Button>
                    </div>
                  </div>

                  {loadingEvents ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-muted rounded-xl animate-pulse"></div>
                      ))}
                    </div>
                  ) : eventos.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-xl border border-border border-dashed">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground text-lg">Nenhum evento cadastrado.</p>
                      <Button variant="link" onClick={() => handleOpenEventForm()} className="mt-2">
                        Criar o primeiro evento
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {eventos.map(evento => (
                        <EventCard 
                          key={evento.id} 
                          event={evento} 
                          onEdit={handleOpenEventForm}
                          onDelete={(e) => handleDeleteClick('evento', e)}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* POSTAGENS TAB */}
                <TabsContent value="postagens" className="space-y-6">
                  <div className="flex justify-between items-center bg-card p-4 rounded-lg shadow-sm border border-border">
                    <h2 className="heading-section text-xl">Gerenciar Postagens</h2>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" onClick={fetchPostagens} disabled={loadingPosts}>
                        <RefreshCw className={`w-4 h-4 ${loadingPosts ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button onClick={() => handleOpenPostForm()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Postagem
                      </Button>
                    </div>
                  </div>

                  {loadingPosts ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-80 bg-muted rounded-xl animate-pulse"></div>
                      ))}
                    </div>
                  ) : postagens.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-xl border border-border border-dashed">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground text-lg">Nenhuma postagem cadastrada.</p>
                      <Button variant="link" onClick={() => handleOpenPostForm()} className="mt-2">
                        Criar a primeira postagem
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {postagens.map(post => (
                        <PostCard 
                          key={post.id} 
                          post={post} 
                          onEdit={handleOpenPostForm}
                          onDelete={(p) => handleDeleteClick('postagem', p)}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Event Form Sheet */}
      <Sheet open={isEventSheetOpen} onOpenChange={(open) => {
        setIsEventSheetOpen(open);
        if (!open) setSelectedEvent(null);
      }}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{selectedEvent ? 'Editar Evento' : 'Novo Evento'}</SheetTitle>
            <SheetDescription>
              {selectedEvent ? 'Atualize os detalhes do evento abaixo.' : 'Preencha os dados para criar um novo evento.'}
            </SheetDescription>
          </SheetHeader>
          <EventForm 
            initialData={selectedEvent} 
            onSuccess={() => {
              setIsEventSheetOpen(false);
              fetchEventos();
            }}
            onCancel={() => setIsEventSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Post Form Sheet */}
      <Sheet open={isPostSheetOpen} onOpenChange={(open) => {
        setIsPostSheetOpen(open);
        if (!open) setSelectedPost(null);
      }}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{selectedPost ? 'Editar Postagem' : 'Nova Postagem'}</SheetTitle>
            <SheetDescription>
              {selectedPost ? 'Atualize o conteúdo da postagem abaixo.' : 'Crie um novo artigo ou conteúdo educacional.'}
            </SheetDescription>
          </SheetHeader>
          <PostForm 
            initialData={selectedPost} 
            onSuccess={() => {
              setIsPostSheetOpen(false);
              fetchPostagens();
            }}
            onCancel={() => setIsPostSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog 
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir "${itemToDelete?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default AdminDashboard;