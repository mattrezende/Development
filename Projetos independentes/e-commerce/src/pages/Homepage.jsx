
import React from 'react';
import { Helmet } from 'react-helmet';
import Hero from '@/components/Hero';
import PromoBanners from '@/components/PromoBanners';
import CategoryHighlights from '@/components/CategoryHighlights';
import ProductCard from '@/components/ProductCard';
import CallToAction from '@/components/CallToAction';
import { products } from '@/data/products';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Homepage = () => {
  // Get featured products (e.g., first 4)
  const featuredProducts = products.slice(0, 4);

  return (
    <>
      <Helmet>
        <title>SuperMarket Online - Frescor e Qualidade na sua Casa</title>
        <meta name="description" content="O melhor supermercado online. Frutas frescas, verduras orgânicas, carnes e ofertas diárias com entrega rápida." />
      </Helmet>
      
      <div className="bg-gray-50 min-h-screen">
        <Hero />
        
        <PromoBanners />
        
        <CategoryHighlights />
        
        {/* Featured Products Section */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Destaques da Semana</h2>
              <p className="text-gray-500">Produtos selecionados com preços imbatíveis</p>
            </div>
            <Link to="/products" className="hidden sm:flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors">
              Ver Todos <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 sm:hidden text-center">
            <Link to="/products" className="inline-flex items-center text-green-600 font-semibold hover:text-green-700">
              Ver Todos <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Trust/Info Section */}
        <section className="bg-white py-16 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6 rounded-2xl bg-green-50">
                   <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🚛</div>
                   <h3 className="font-bold text-gray-900 mb-2">Entrega Rápida</h3>
                   <p className="text-gray-500 text-sm">Receba suas compras no mesmo dia para pedidos até as 14h.</p>
                </div>
                <div className="p-6 rounded-2xl bg-orange-50">
                   <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🥦</div>
                   <h3 className="font-bold text-gray-900 mb-2">Tudo Fresquinho</h3>
                   <p className="text-gray-500 text-sm">Selecionamos as melhores frutas e verduras para você.</p>
                </div>
                <div className="p-6 rounded-2xl bg-blue-50">
                   <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">💳</div>
                   <h3 className="font-bold text-gray-900 mb-2">Pagamento Seguro</h3>
                   <p className="text-gray-500 text-sm">Aceitamos todos os cartões e PIX com total segurança.</p>
                </div>
             </div>
          </div>
        </section>

        {/* Call To Action Banner */}
        <section className="py-16 px-4 bg-gray-900 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-green-600/10 z-0"></div>
           <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Pronto para abastecer sua despensa?</h2>
              <p className="text-gray-300 mb-8">Aproveite nossas ofertas exclusivas e frete grátis na primeira compra.</p>
              <Link to="/products">
                <button className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-colors shadow-lg shadow-green-500/30">
                  Ir para Loja
                </button>
              </Link>
           </div>
        </section>
      </div>
    </>
  );
};

export default Homepage;
