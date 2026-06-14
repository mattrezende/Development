
import React from 'react';
import { Helmet } from 'react-helmet';
import { BookOpen, Calendar, Target, GraduationCap, Bot, FileText } from 'lucide-react';
import Sidebar from '@/components/Sidebar.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const TutoriaisPage = () => {
  const tutorials = [
    {
      icon: Calendar,
      title: 'Começando com a Rotina',
      description: 'Aprenda a configurar seu cronograma semanal de estudos',
      content: 'Clique nos horários na grade semanal para criar blocos de estudo. Marque os horários como "Estudo" para tempo de estudo ou "Livre" para tempo livre. Defina a duração de cada bloco para acompanhar o total de horas semanais de estudo.',
    },
    {
      icon: Target,
      title: 'Criando Ciclos de Estudo',
      description: 'Organize suas matérias em ciclos de estudo focados',
      content: 'Crie um novo ciclo clicando em "Criar Novo Ciclo". Adicione matérias com classificações de dificuldade (1-5 estrelas) e horas de estudo estimadas. O sistema calculará o tempo total do seu ciclo automaticamente.',
    },
    {
      icon: GraduationCap,
      title: 'Usando o Modo de Estudo',
      description: 'Acompanhe suas sessões de estudo com o cronômetro integrado',
      content: 'Escolha entre "Revisão do Ciclo" para revisar as matérias do seu ciclo atual, ou "Revisão Geral" para uma revisão geral. Use os controles do cronômetro para acompanhar seu tempo de estudo e fazer pausas.',
    },
    {
      icon: Bot,
      title: 'Agente de IA',
      description: 'Obtenha ajuda e crie flashcards com Inteligência Artificial',
      content: 'Converse com o assistente de IA para fazer perguntas sobre seus materiais de estudo. Peça resumos ou explicações. Clique em "Criar Flashcard" para salvar conceitos importantes para revisão posterior.',
    },
    {
      icon: FileText,
      title: 'Caderno Digital',
      description: 'Faça e organize suas anotações de estudo',
      content: 'Crie notas com títulos, assuntos e conteúdo. Use a função de busca para encontrar notas rapidamente. Edite ou exclua notas conforme necessário. As notas são registradas automaticamente com data e hora.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Tutoriais - WATSON</title>
        <meta name="description" content="Aprenda a usar os recursos de gestão de estudos do WATSON de forma eficaz." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Sidebar />
        
        <main className="lg:pl-72 p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
                Tutoriais
              </h1>
              <p className="text-muted-foreground">Aprenda a usar o WATSON de forma eficaz</p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Bem-vindo ao WATSON</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  O WATSON é sua plataforma inteligente de gestão de estudos. Use os tutoriais abaixo para aprender como aproveitar ao máximo cada recurso. Comece configurando seu cronograma semanal na Rotina e, em seguida, crie seu primeiro ciclo de estudo para organizar suas matérias.
                </p>
              </CardContent>
            </Card>

            <Accordion type="single" collapsible className="space-y-4">
              {tutorials.map((tutorial, index) => {
                const Icon = tutorial.icon;
                return (
                  <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-2xl px-6">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{tutorial.title}</p>
                          <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-2">
                      <p className="text-muted-foreground leading-relaxed pl-16">
                        {tutorial.content}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Precisa de Mais Ajuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Se você tiver dúvidas ou precisar de assistência, tente perguntar ao Assistente de Estudos de IA na seção Agente de IA. O assistente pode fornecer ajuda e orientação personalizadas com base em suas necessidades específicas.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};

export default TutoriaisPage;
