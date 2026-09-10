import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import HeroSection from '@/components/home/HeroSection.jsx';
import BenefitsSection from '@/components/home/BenefitsSection.jsx';
import FeaturesSection from '@/components/home/FeaturesSection.jsx';
import ImpactSection from '@/components/home/ImpactSection.jsx';
import TestimonialsSection from '@/components/home/TestimonialsSection.jsx';
import CTASection from '@/components/home/CTASection.jsx';
import Footer from '@/components/Footer.jsx';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Exelion | Profissionalize Sua Gestão de Aulas</title>
        <meta name="description" content="Exelion é a plataforma completa para professores que querem escalar seu negócio com profissionalismo, eficiência e segurança." />
      </Helmet>
      
      <Header />
      
      <main className="flex-grow">
        <HeroSection />
        <BenefitsSection />
        <FeaturesSection />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;