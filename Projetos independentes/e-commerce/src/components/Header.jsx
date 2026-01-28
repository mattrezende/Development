
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, Menu, X, User, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { categories } from '@/data/products';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar - Main Header */}
        <div className="flex items-center justify-between h-20 gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
            <div className="bg-primary p-2 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent tracking-tight">
              SuperMarket
            </span>
          </Link>

          {/* Search Bar - Centered */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full group">
              <input
                type="text"
                placeholder="O que você procura hoje?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3 pl-12 rounded-full bg-gray-100 border-2 border-transparent text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-300"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center space-x-6 flex-shrink-0">
            <div className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-green-600 cursor-pointer transition-colors">
              <User className="w-6 h-6" />
              <span className="text-sm font-medium">Entrar</span>
            </div>

            <Link to="/cart" className="relative group">
              <div className="p-3 bg-orange-50 rounded-full group-hover:bg-orange-100 transition-colors">
                <ShoppingCart className="w-6 h-6 text-orange-500" />
              </div>
              {getCartCount() > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm"
                >
                  {getCartCount()}
                </motion.span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Categories Navigation - Desktop */}
        <nav className="hidden md:flex items-center justify-between py-3 border-t border-gray-100 overflow-x-auto no-scrollbar">
          {categories.filter(c => c !== 'All').map((category) => (
            <Link
              key={category}
              to={`/products?category=${encodeURIComponent(category)}`}
              className="text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap"
            >
              {category}
            </Link>
          ))}
          <Link 
            to="/products" 
            className="text-sm font-bold text-orange-500 hover:text-orange-600 px-4 py-2 hover:bg-orange-50 rounded-full transition-colors whitespace-nowrap"
          >
            Ver Todas Ofertas
          </Link>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-6">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-xl bg-gray-100 border-transparent text-gray-800 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </form>

              {/* Mobile Categories */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Departamentos</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category}
                      to={`/products${category !== 'All' ? `?category=${encodeURIComponent(category)}` : ''}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors"
                    >
                      {category === 'All' ? 'Todos os Produtos' : category}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Account Links */}
              <div className="border-t border-gray-100 pt-4">
                <Link
                  to="/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 text-gray-600 hover:text-green-600 p-2 rounded-lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Meu Carrinho ({getCartCount()})</span>
                </Link>
                <div className="flex items-center space-x-3 text-gray-600 hover:text-green-600 p-2 rounded-lg cursor-pointer">
                  <User className="w-5 h-5" />
                  <span>Minha Conta</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
