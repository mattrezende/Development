
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Send, Plus } from 'lucide-react';
import Sidebar from '@/components/Sidebar.jsx';
import FlashcardForm from '@/components/FlashcardForm.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

const AgentePage = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFlashcardFormOpen, setIsFlashcardFormOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      const records = await pb.collection('chatHistory').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: 'timestamp',
        $autoCancel: false,
      });
      
      const formattedMessages = records.flatMap((record) => [
        { role: 'user', content: record.userMessage, timestamp: record.timestamp },
        { role: 'assistant', content: record.aiResponse, timestamp: record.timestamp },
      ]);
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Erro ao buscar histórico de chat:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      const aiResponse = `Entendi que você está perguntando sobre "${userMessage}". Como seu assistente de estudos de IA, posso ajudá-lo com resumos, explicações e criação de flashcards. Gostaria que eu criasse um flashcard para este tópico?`;

      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);

      await pb.collection('chatHistory').create({
        userId: currentUser.id,
        userMessage,
        aiResponse,
        messageType: 'question',
      }, { $autoCancel: false });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast('Falha ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Agente de IA - WATSON</title>
        <meta name="description" content="Converse com seu assistente de estudos de IA para obter ajuda e criar flashcards." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Sidebar />
        
        <main className="lg:pl-72 p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
                  Agente de IA
                </h1>
                <p className="text-muted-foreground">Seu assistente de estudos inteligente</p>
              </div>
              
              <Button onClick={() => setIsFlashcardFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Flashcard
              </Button>
            </div>

            <Card className="h-[calc(100vh-16rem)]">
              <CardHeader className="border-b border-border">
                <CardTitle>Chat</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[calc(100%-5rem)]">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <p className="text-lg mb-2">Inicie uma conversa com seu assistente de IA</p>
                      <p className="text-sm">Faça perguntas, peça resumos ou crie flashcards</p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Faça uma pergunta ou peça ajuda..."
                      disabled={loading}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={loading || !inputMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>

        <FlashcardForm
          isOpen={isFlashcardFormOpen}
          onClose={() => setIsFlashcardFormOpen(false)}
          onSuccess={() => toast('Flashcard criado com sucesso')}
        />
      </div>
    </>
  );
};

export default AgentePage;
