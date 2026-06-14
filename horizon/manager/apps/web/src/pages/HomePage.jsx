
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock, DollarSign, FileText, Shield, TrendingUp } from 'lucide-react';
import Header from '@/components/Header.jsx';

const HomePage = () => {
  const features = [
    {
      icon: Users,
      title: 'Gestão de Funcionários',
      description: 'Cadastro completo de funcionários com informações detalhadas, histórico e documentação.'
    },
    {
      icon: Clock,
      title: 'Controle de Ponto',
      description: 'Sistema de registro de ponto eletrônico com aprovação de gestores e relatórios detalhados.'
    },
    {
      icon: DollarSign,
      title: 'Folha de Pagamento',
      description: 'Cálculo automático de salários, descontos (INSS, IR, FGTS) e geração de holerites em PDF.'
    },
    {
      icon: FileText,
      title: 'Relatórios Gerenciais',
      description: 'Dashboards e relatórios completos para análise de dados e tomada de decisões.'
    },
    {
      icon: Shield,
      title: 'Controle de Acesso',
      description: 'Sistema de permissões por função (Admin, Gerente, Funcionário) com segurança avançada.'
    },
    {
      icon: TrendingUp,
      title: 'Análise de Desempenho',
      description: 'Acompanhamento de métricas de RH e indicadores de performance da equipe.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Sistema de Gestão de RH - Gestão Completa de Recursos Humanos</title>
        <meta name="description" content="Sistema completo de gestão de RH com controle de funcionários, ponto eletrônico, folha de pagamento e relatórios gerenciais." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1629787155650-9ce3697dcb38)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/80 to-gray-900/70"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Sistema de Gestão de RH
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto">
              Simplifique a gestão de recursos humanos da sua empresa com nossa plataforma completa e intuitiva
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login?role=admin">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg font-semibold shadow-xl">
                  Admin Login
                </Button>
              </Link>
              <Link to="/login?role=manager">
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 py-6 text-lg font-semibold shadow-xl">
                  Manager Login
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Funcionalidades Principais</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tudo que você precisa para gerenciar seu departamento de RH de forma eficiente
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-emerald-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Pronto para começar?</h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Acesse o sistema agora e comece a gerenciar seu RH de forma mais eficiente
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login?role=admin">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-xl">
                  Acessar como Admin
                </Button>
              </Link>
              <Link to="/login?role=manager">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold">
                  Acessar como Gerente
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-8">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2026 Sistema de Gestão de RH. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
