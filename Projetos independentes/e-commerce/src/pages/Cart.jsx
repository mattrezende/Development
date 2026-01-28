
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { toast } = useToast();
  const [itemToRemove, setItemToRemove] = useState(null);

  const subtotal = getCartTotal();
  // Supermarket tax logic might be different, but keeping simple for now
  const tax = 0; // Usually included in price in Brazil/Supermarkets
  const shipping = subtotal > 150 ? 0 : 15.00;
  const total = subtotal + tax + shipping;

  const handleRemove = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove);
      toast({
        title: "Item removido",
        description: "Produto removido do carrinho.",
      });
      setItemToRemove(null);
    }
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Helmet>
          <title>Carrinho - SuperMarket</title>
          <meta name="description" content="Seu carrinho de compras" />
        </Helmet>

        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-md mx-4"
          >
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Seu carrinho está vazio</h2>
            <p className="text-gray-500 mb-8">Parece que você ainda não adicionou nenhum produto. Que tal começar agora?</p>
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
              >
                Começar a Comprar
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Carrinho ({cartItems.length}) - SuperMarket</title>
        <meta name="description" content="Finalize sua compra" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 mb-8"
          >
            Seu Carrinho
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-stretch"
                  >
                    {/* Image */}
                    <Link to={`/products/${item.id}`} className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gray-50 rounded-xl p-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row justify-between mb-4">
                        <div>
                          <p className="text-xs font-semibold text-green-600 mb-1">{item.category}</p>
                          <Link to={`/products/${item.id}`}>
                            <h3 className="text-lg font-bold text-gray-900 hover:text-green-600 transition-colors">
                              {item.name}
                            </h3>
                          </Link>
                        </div>
                        <p className="text-lg font-bold text-gray-900 mt-2 sm:mt-0">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-start gap-6">
                        {/* Quantity */}
                        <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-white rounded-md transition-all shadow-sm text-gray-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-gray-900 font-bold w-6 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-white rounded-md transition-all shadow-sm text-gray-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <p className="text-sm text-gray-400">
                          R$ {item.price.toFixed(2)} un.
                        </p>
                        
                        {/* Remove Button Mobile - Visible only on small screens */}
                        <button
                          onClick={() => setItemToRemove(item.id)}
                          className="sm:hidden text-gray-400 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Remove Button Desktop */}
                    <button
                      onClick={() => setItemToRemove(item.id)}
                      className="hidden sm:block text-gray-400 hover:text-red-500 transition-colors self-center p-2 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-24"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo do Pedido</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Frete</span>
                    <span className="font-semibold text-green-600">
                      {shipping === 0 ? 'GRÁTIS' : `R$ ${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {subtotal < 150 && (
                    <div className="bg-orange-50 p-3 rounded-lg text-xs text-orange-700 flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4" />
                       Faltam R$ {(150 - subtotal).toFixed(2)} para frete grátis!
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-green-600">R$ {total.toFixed(2)}</span>
                    </div>
                    <p className="text-right text-xs text-gray-400 mt-1">ou 3x de R$ {(total/3).toFixed(2)} sem juros</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-green-600/20"
                  >
                    <span>Finalizar Compra</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                  <Link to="/products">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-white border-2 border-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                    >
                      Continuar Comprando
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={itemToRemove !== null} onOpenChange={() => setItemToRemove(null)}>
        <AlertDialogContent className="bg-white border-gray-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Remover item?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Tem certeza que deseja remover este produto do seu carrinho?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Cart;
