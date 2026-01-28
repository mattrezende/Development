
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ChevronRight, Star, Minus, Plus, ShoppingCart, Heart, Truck, ShieldCheck } from 'lucide-react';
import { products } from '@/data/products';
import { getRelatedProducts } from '@/utils/productUtils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/use-toast';
import ProductCard from '@/components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find(p => p.id === parseInt(id));
  const relatedProducts = product ? getRelatedProducts(products, product) : [];
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h2>
          <Link to="/products" className="text-green-600 hover:underline font-medium">
            Voltar para a loja
          </Link>
        </div>
      </div>
    );
  }

  const images = [product.image, product.image, product.image];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: "Adicionado ao carrinho!",
      description: `${quantity}x ${product.name} adicionado ao seu carrinho.`,
      className: "bg-green-50 border-green-200 text-green-900",
    });
  };

  return (
    <>
      <Helmet>
        <title>{product.name} - SuperMarket</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-sm text-gray-500 mb-8"
          >
            <Link to="/" className="hover:text-green-600 transition-colors">
              Início
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/products" className="hover:text-green-600 transition-colors">
              Produtos
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{product.name}</span>
          </motion.nav>

          {/* Product Detail */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-10 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Image Gallery */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="sticky top-24">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4 border border-gray-100">
                    <img
                      src={images[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === idx
                            ? 'border-green-500'
                            : 'border-transparent hover:border-green-200 bg-gray-50'
                        }`}
                      >
                        <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain mix-blend-multiply" />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Product Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col h-full"
              >
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-green-50 text-green-700 font-semibold rounded-full text-sm mb-4">
                    {product.category}
                  </span>

                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {product.name}
                  </h1>

                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-900 font-medium">{product.rating}</span>
                    <span className="text-gray-400 border-l border-gray-200 pl-4 ml-2">
                      {product.reviews} avaliações
                    </span>
                  </div>

                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    {product.description}
                  </p>

                  <div className="p-4 bg-gray-50 rounded-xl mb-8">
                    <div className="flex items-center space-x-4">
                      {product.discount ? (
                        <>
                          <span className="text-4xl font-bold text-gray-900">
                            R$ {(product.price * (1 - product.discount / 100)).toFixed(2)}
                          </span>
                          <span className="text-2xl text-gray-400 line-through">
                            R$ {product.price.toFixed(2)}
                          </span>
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                            -{product.discount}%
                          </span>
                        </>
                      ) : (
                        <span className="text-4xl font-bold text-gray-900">
                          R$ {product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Quantity & Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex items-center bg-gray-100 rounded-xl p-1 w-fit">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-white rounded-lg transition-all shadow-sm disabled:opacity-50"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="text-gray-900 font-bold w-12 text-center text-lg">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-3 hover:bg-white rounded-lg transition-all shadow-sm"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddToCart}
                      className="flex-1 bg-green-600 text-white py-4 px-8 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-green-600/20"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Adicionar ao Carrinho</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 bg-gray-100 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-6 h-6" />
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                       <Truck className="w-5 h-5 text-green-500" />
                       <span>Entrega em até 2h</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="w-5 h-5 text-green-500" />
                       <span>Garantia de Qualidade</span>
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div className="mt-auto border-t border-gray-100 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Especificações</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">{key}</span>
                        <span className="font-medium text-gray-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Produtos Relacionados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
