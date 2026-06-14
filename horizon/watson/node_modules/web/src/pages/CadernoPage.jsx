
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import Sidebar from '@/components/Sidebar.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

const CadernoPage = () => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subject: '',
    tags: [],
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const records = await pb.collection('notes').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: '-createdAt',
        $autoCancel: false,
      });
      setNotes(records);
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    try {
      if (editingNote) {
        await pb.collection('notes').update(editingNote.id, {
          ...formData,
          userId: currentUser.id,
        }, { $autoCancel: false });
        toast('Nota atualizada');
      } else {
        await pb.collection('notes').create({
          ...formData,
          userId: currentUser.id,
        }, { $autoCancel: false });
        toast('Nota criada');
      }
      
      setFormData({ title: '', content: '', subject: '', tags: [] });
      setEditingNote(null);
      setIsDialogOpen(false);
      fetchNotes();
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      toast('Falha ao salvar nota');
    }
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Deletar esta nota?')) {
      try {
        await pb.collection('notes').delete(id, { $autoCancel: false });
        toast('Nota deletada');
        fetchNotes();
      } catch (error) {
        console.error('Erro ao deletar nota:', error);
      }
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      subject: note.subject || '',
      tags: note.tags || [],
    });
    setIsDialogOpen(true);
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Caderno - WATSON</title>
        <meta name="description" content="Seu caderno digital para anotações e materiais de estudo." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Sidebar />
        
        <div className="content-with-sidebar">
          <main className="p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
                    Caderno
                  </h1>
                  <p className="text-muted-foreground">Seu caderno digital</p>
                </div>
                
                <div className="flex gap-3">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar notas..."
                      className="pl-10"
                    />
                  </div>
                  
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingNote(null);
                        setFormData({ title: '', content: '', subject: '', tags: [] });
                      }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Nota
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingNote ? 'Editar Nota' : 'Criar Nota'}</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Título</Label>
                          <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Título da nota"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Assunto</Label>
                          <Input
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="Assunto ou categoria"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Conteúdo</Label>
                          <Textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Escreva suas anotações aqui..."
                            rows={10}
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button onClick={handleSaveNote} disabled={!formData.title}>
                          {editingNote ? 'Atualizar' : 'Criar'} Nota
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Carregando notas...</p>
                </div>
              ) : filteredNotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNotes.map((note) => (
                    <Card key={note.id} className="hover:shadow-lg transition-all duration-200">
                      <CardHeader>
                        <CardTitle className="flex items-start justify-between">
                          <span className="line-clamp-1">{note.title}</span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditNote(note)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardTitle>
                        {note.subject && (
                          <p className="text-sm text-muted-foreground">{note.subject}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-4 mb-4">
                          {note.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(note.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Nenhuma nota encontrada para sua busca' : 'Nenhuma nota ainda. Crie sua primeira nota para começar.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default CadernoPage;
