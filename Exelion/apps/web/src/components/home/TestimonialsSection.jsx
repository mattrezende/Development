import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    quote: "Exelion transformou minha forma de trabalhar. Agora tenho mais tempo para focar no que realmente importa: ensinar bem.",
    name: "Mariana Costa",
    specialty: "Professora de Inglês",
  },
  {
    quote: "A profissionalização que meu negócio precisava. Recomendo para todo professor que quer crescer.",
    name: "Rafael Silva",
    specialty: "Personal Trainer",
  },
  {
    quote: "Simples, intuitivo e poderoso. Exelion é exatamente o que eu procurava para organizar meus alunos.",
    name: "Ana Paula",
    specialty: "Professora de Música",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">O que dizem nossos professores</h2>
          <p className="text-lg text-muted-foreground">Histórias reais de profissionais que transformaram suas carreiras.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full bg-secondary/30 border-none rounded-2xl">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-foreground mb-8 flex-grow">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.specialty}</div>
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

export default TestimonialsSection;