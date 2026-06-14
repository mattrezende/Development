
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Brain, Calendar, Target, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomePage = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Agendamento Inteligente',
      description: 'Construa sua rotina de estudos semanal com blocos de tempo inteligentes e rastreamento de disponibilidade.',
    },
    {
      icon: Target,
      title: 'Ciclos de Estudo',
      description: 'Organize matérias em ciclos focados com classificações de dificuldade e estimativas de tempo.',
    },
    {
      icon: BookOpen,
      title: 'Caderno Digital',
      description: 'Faça anotações, crie flashcards e organize seus materiais de estudo em um só lugar.',
    },
    {
      icon: Brain,
      title: 'Agente de IA',
      description: 'Obtenha ajuda personalizada, gere resumos e crie flashcards personalizados com Inteligência Artificial.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>WATSON - Plataforma Inteligente de Gestão de Estudos</title>
        <meta name="description" content="Transforme sua rotina de estudos com o WATSON. Agendamento inteligente, assistência com IA e ferramentas completas de aprendizado para estudantes." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary" style={{ letterSpacing: '-0.02em' }}>
                WATSON
              </h1>
            </div>
            <Link to="/login">
              <Button variant="outline">Entrar</Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="max-w-3xl">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
                Domine seus estudos com planejamento inteligente
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                O WATSON combina agendamento inteligente, assistência de IA e técnicas de estudo comprovadas para ajudar você a alcançar seus objetivos acadêmicos com eficiência.
              </p>
              <Link to="/login">
                <Button size="lg" className="gap-2 group">
                  Começar Agora
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-semibold mb-4">
                Tudo o que você precisa para estudar melhor
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Construído para estudantes que desejam otimizar seu processo de aprendizagem
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="text-xl font-semibold mb-3">{feature.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-12 md:p-16 text-center">
              <h3 className="text-3xl md:text-4xl font-semibold mb-4">
                Pronto para transformar sua rotina de estudos?
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Junte-se a estudantes que já estão aprendendo de forma mais inteligente com o WATSON
              </p>
              <Link to="/login">
                <Button size="lg" className="gap-2">
                  Comece a Aprender Hoje
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2026 WATSON. Todos os direitos reservados.
              </p>
              <div className="flex gap-6">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer">
                  Política de Privacidade
                </span>
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer">
                  Termos de Serviço
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
