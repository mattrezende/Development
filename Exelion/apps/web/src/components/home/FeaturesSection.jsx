import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, CreditCard, BarChart, Globe, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Calendar,
    title: 'Agendamento Inteligente',
    description: 'Gerencie horários e disponibilidades com facilidade.',
  },
  {
    icon: Users,
    title: 'Gestão de Alunos',
    description: 'Mantenha informações completas e organizadas.',
  },
  {
    icon: CreditCard,
    title: 'Pagamentos Seguros',
    description: 'Integração com Mercado Pago para receber com segurança.',
  },
  {
    icon: BarChart,
    title: 'Relatórios',
    description: 'Acompanhe seu progresso e desempenho.',
  },
  {
    icon: Globe,
    title: 'Perfil Público',
    description: 'Mostre sua expertise e atraia novos alunos.',
  },
  {
    icon: MessageSquare,
    title: 'Comunicação',
    description: 'Mantenha contato direto com seus alunos.',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Recursos Completos</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">Uma suíte de ferramentas desenhada especificamente para as necessidades de professores independentes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 rounded-2xl border-border/50">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;