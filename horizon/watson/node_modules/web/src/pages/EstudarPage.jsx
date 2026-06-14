
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { BookOpen, PlayCircle, BarChart3 } from 'lucide-react';
import Sidebar from '@/components/Sidebar.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import FlashcardList from '@/components/FlashcardList.jsx';
import FlashcardReviewer from '@/components/FlashcardReviewer.jsx';
import CreateFlashcardModal from '@/components/CreateFlashcardModal.jsx';
import PerformanceStats from '@/components/PerformanceStats.jsx';
import { useFlashcards } from '@/hooks/useFlashcards';

const EstudarPage = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [sessionCards, setSessionCards] = useState([]);
  
  const { 
    flashcards, 
    loading, 
    fetchFlashcards, 
    createFlashcard, 
    updateFlashcard, 
    deleteFlashcard 
  } = useFlashcards();

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const handleAddClick = () => {
    setEditingCard(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (card) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleSaveCard = async (data) => {
    if (editingCard) {
      await updateFlashcard(editingCard.id, data);
    } else {
      await createFlashcard(data);
    }
  };

  const handleDeleteCard = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este flashcard?')) {
      await deleteFlashcard(id);
    }
  };

  const handleStartSession = (cardsToReview = null) => {
    const cards = cardsToReview || flashcards;
    if (cards.length === 0) {
      alert('Adicione flashcards primeiro para iniciar uma sessão.');
      return;
    }
    setSessionCards(cards);
    setActiveTab('session');
  };

  return (
    <>
      <Helmet>
        <title>Estudar (Flashcards) - WATSON</title>
        <meta name="description" content="Revise seus flashcards e acompanhe seu desempenho." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Sidebar />
        
        <div className="content-with-sidebar">
          <main className="p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
                    Estudar
                  </h1>
                  <p className="text-muted-foreground">
                    Sistema de repetição espaçada com flashcards
                  </p>
                </div>
                
                {activeTab !== 'session' && (
                  <Button 
                    size="lg" 
                    onClick={() => handleStartSession()}
                    className="rounded-full shadow-lg shadow-primary/20"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Revisão Geral
                  </Button>
                )}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger value="list" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Meus Flashcards
                  </TabsTrigger>
                  <TabsTrigger value="session" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Sessão Ativa
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Estatísticas
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="m-0 outline-none">
                  <FlashcardList 
                    flashcards={flashcards}
                    loading={loading}
                    onAdd={handleAddClick}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteCard}
                    onStartSession={handleStartSession}
                  />
                </TabsContent>

                <TabsContent value="session" className="m-0 outline-none">
                  <div className="bg-card border border-border rounded-2xl p-6 md:p-10 shadow-sm min-h-[600px] flex items-center justify-center">
                    {sessionCards.length > 0 ? (
                      <FlashcardReviewer 
                        flashcards={sessionCards} 
                        onComplete={() => setActiveTab('stats')}
                        onClose={() => setActiveTab('list')}
                      />
                    ) : (
                      <div className="text-center">
                        <p className="text-muted-foreground mb-4">Nenhuma sessão ativa.</p>
                        <Button onClick={() => handleStartSession()}>Iniciar Revisão Geral</Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="m-0 outline-none">
                  <PerformanceStats flashcards={flashcards} />
                </TabsContent>
              </Tabs>

            </div>
          </main>
        </div>
      </div>

      <CreateFlashcardModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCard}
        initialData={editingCard}
      />
    </>
  );
};

export default EstudarPage;
