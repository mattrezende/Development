
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import FilterBar from '@/components/FilterBar';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import { filterProducts } from '@/utils/productUtils';
import { Loader2, ShoppingBasket } from 'lucide-react';

const ProductCatalog = () => {
  const [searchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    priceRange: [0, 100],
    sortBy: 'newest',
  });

  useEffect(() => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      const filtered = filterProducts(products, filters);
      setFilteredProducts(filtered);
      setIsLoading(false);
    }, 500);
  }, [filters]);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || 'All',
    }));
  }, [searchParams]);

  return (
    <>
      <Helmet>
        <title>Catálogo de Produtos - SuperMarket</title>
        <meta name="description" content="Navegue por nossa seleção de produtos frescos e de qualidade. Filtre por categoria, preço e mais." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Nossos Produtos
            </h1>
            <p className="text-gray-500">
              Encontramos {filteredProducts.length} itens para sua busca
            </p>
          </motion.div>

          {/* Filter Bar */}
          <FilterBar filters={filters} setFilters={setFilters} />

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-green-600">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Carregando produtos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-32 bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBasket className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Não encontramos produtos com os filtros selecionados. Tente buscar por outro termo ou limpar os filtros.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductCatalog;
