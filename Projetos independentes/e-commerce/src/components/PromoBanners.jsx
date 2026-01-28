
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, ShoppingBasket, Snowflake } from 'lucide-react';
import { Link } from 'react-router-dom';

const Banner = ({ title, subtitle, color, icon: Icon, to, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className={`relative overflow-hidden rounded-2xl p-6 ${color} shadow-lg hover:shadow-xl transition-shadow duration-300 group`}
  >
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div>
        <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
        <p className="text-white/90 font-medium">{subtitle}</p>
      </div>
      
      <Link to={to} className="mt-6 inline-flex items-center text-white font-semibold group-hover:translate-x-1 transition-transform">
        Comprar Agora <ArrowRight className="ml-2 w-4 h-4" />
      </Link>
    </div>
    
    {/* Decorative background shapes */}
    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
    <div className="absolute bottom-0 right-10 w-24 h-24 rounded-full bg-black/5 blur-xl" />
  </motion.div>
);

const PromoBanners = () => {
  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Banner 
          title="Hortifruti Fresco" 
          subtitle="Direto do produtor para sua mesa com 20% OFF"
          color="bg-gradient-to-br from-green-400 to-green-600"
          icon={Leaf}
          to="/products?category=Frutas%20e%20Verduras"
          delay={0.1}
        />
        <Banner 
          title="Ofertas da Semana" 
          subtitle="Confira os melhores preços em Alimentos Básicos"
          color="bg-gradient-to-br from-orange-400 to-orange-600"
          icon={ShoppingBasket}
          to="/products?category=Alimentos"
          delay={0.2}
        />
        <Banner 
          title="Festival de Congelados" 
          subtitle="Praticidade para o seu dia a dia com preços especiais"
          color="bg-gradient-to-br from-blue-400 to-blue-600"
          icon={Snowflake}
          to="/products?category=Congelados"
          delay={0.3}
        />
      </div>
    </section>
  );
};

export default PromoBanners;
