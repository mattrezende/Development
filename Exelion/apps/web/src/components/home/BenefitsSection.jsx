import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Zap, TrendingUp, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const benefits = [
  {
    icon: Briefcase,
    title: 'Gestão Profissional',
    description: 'Organize aulas, horários, alunos e documentos em um único lugar.',
  },
  {
    icon: Zap,
    title: 'Eficiência',
    description: 'Automatize processos e economize horas de trabalho administrativo.',
  },
  {
    icon: TrendingUp,
    title: 'Crescimento',
    description: 'Escale seu negócio de forma sustentável com ferramentas poderosas.',
  },
  {
    icon: Shield,
    title: 'Segurança',
    description: 'Seus dados e os de seus alunos estão sempre protegidos.',
  },
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-24 bg-background">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Por que escolher a Exelion?</h2>
          <p className="text-lg text-muted-foreground">Tudo que você precisa para focar no que realmente importa: ensinar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-none shadow-none bg-secondary/50 hover:bg-secondary transition-colors duration-300 rounded-2xl">
                <CardContent className="p-8 flex flex-col sm:flex-row gap-6 items-start">
                  <div className="p-4 bg-primary/10 rounded-xl shrink-0">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;