import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90dvh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1697638164340-6c5fc558bdf2" 
          alt="Professor ensinando" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-950/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/80 to-background" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-20 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
            Profissionalize Sua Gestão de Aulas
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
            Exelion é a plataforma completa para professores que querem escalar seu negócio com profissionalismo, eficiência e segurança.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 text-base h-14 px-8 rounded-xl">
              <Link to="/signup">
                Comece Agora <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white text-base h-14 px-8 rounded-xl backdrop-blur-sm">
              <a href="#benefits">
                Conhecer Mais
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;