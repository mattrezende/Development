
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Apple, 
  Coffee, 
  SprayCan, 
  Snowflake, 
  Milk, 
  Utensils 
} from 'lucide-react';
import { categories } from '@/data/products';

const categoryConfig = {
  'Alimentos': { icon: Utensils, color: 'bg-orange-100 text-orange-600 hover:bg-orange-200' },
  'Bebidas': { icon: Coffee, color: 'bg-blue-100 text-blue-600 hover:bg-blue-200' },
  'Higiene e Limpeza': { icon: SprayCan, color: 'bg-purple-100 text-purple-600 hover:bg-purple-200' },
  'Congelados': { icon: Snowflake, color: 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200' },
  'Frutas e Verduras': { icon: Apple, color: 'bg-green-100 text-green-600 hover:bg-green-200' },
  'Laticínios': { icon: Milk, color: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' },
};

const CategoryHighlights = () => {
  const displayCategories = categories.filter(c => c !== 'All');

  return (
    <section className="py-12 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Compre por Categoria</h2>
          <p className="text-gray-500">Encontre tudo o que você precisa</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayCategories.map((cat, index) => {
            const config = categoryConfig[cat] || { icon: Utensils, color: 'bg-gray-100 text-gray-600' };
            const Icon = config.icon;

            return (
              <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl ${config.color} transition-colors duration-300 h-full cursor-pointer shadow-sm hover:shadow-md`}
                >
                  <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-center text-sm">{cat}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryHighlights;
