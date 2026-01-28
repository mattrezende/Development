
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Adicionado ao carrinho!",
      description: `${product.name} foi adicionado.`,
      className: "bg-green-50 border-green-200 text-green-900",
    });
  };

  return (
    <Link to={`/products/${product.id}`}>
      <motion.div
        whileHover={{ y: -8 }}
        className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 h-full flex flex-col"
      >
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.discount && (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              -{product.discount}% OFF
            </span>
          )}
          {product.badge && (
            <span className={cn(
              "text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm",
              product.badge === 'Novo' ? "bg-blue-500" : 
              product.badge === 'Oferta' ? "bg-orange-500" : "bg-purple-500"
            )}>
              {product.badge}
            </span>
          )}
        </div>

        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 p-4">
          <motion.img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Category */}
          <p className="text-xs font-semibold text-green-600 mb-2 uppercase tracking-wide">
            {product.category}
          </p>

          {/* Name */}
          <h3 className="text-gray-800 font-bold mb-2 line-clamp-2 text-lg group-hover:text-green-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-4">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-600">{product.rating}</span>
            <span className="text-xs text-gray-400">({product.reviews})</span>
          </div>

          <div className="mt-auto flex items-end justify-between">
            {/* Price */}
            <div>
              {product.discount ? (
                <div className="flex flex-col">
                   <span className="text-xs text-gray-400 line-through">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    R$ {(product.price * (1 - product.discount / 100)).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-xl font-bold text-gray-900">R$ {product.price.toFixed(2)}</span>
              )}
            </div>

            {/* Add Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="bg-green-100 text-green-700 p-2.5 rounded-full hover:bg-green-500 hover:text-white transition-all duration-300 shadow-sm"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
