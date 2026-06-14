
import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from './AuthContext.jsx';
import { useToast } from '@/hooks/use-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const loadCart = async () => {
    if (!currentUser) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const cartRes = await pb.collection('cart_items').getList(1, 500, {
        filter: `userId="${currentUser.id}"`,
        $autoCancel: false
      });

      const items = cartRes.items;
      if (items.length === 0) {
        setCartItems([]);
        return;
      }

      // Fetch product details for the cart items
      const productIds = items.map(i => `id="${i.productId}"`).join(' || ');
      const productsRes = await pb.collection('products').getFullList({
        filter: productIds,
        $autoCancel: false
      });

      const productsMap = {};
      productsRes.forEach(p => {
        productsMap[p.id] = p;
      });

      const mergedItems = items.map(item => ({
        ...item,
        product: productsMap[item.productId] || null
      })).filter(item => item.product); // Remove items if product was deleted

      setCartItems(mergedItems);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [currentUser]);

  const addToCart = async (product, quantity = 1) => {
    if (!currentUser) {
      toast({ title: "Atenção", description: "Faça login para adicionar itens ao carrinho." });
      return;
    }

    try {
      const existingItem = cartItems.find(item => item.productId === product.id);

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
        toast({ title: "Carrinho atualizado", description: "Quantidade do produto atualizada." });
      } else {
        const newItem = await pb.collection('cart_items').create({
          userId: currentUser.id,
          productId: product.id,
          quantity: quantity
        }, { $autoCancel: false });
        
        setCartItems([...cartItems, { ...newItem, product }]);
        toast({ title: "Adicionado ao carrinho", description: `${product.name} foi adicionado.` });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível adicionar ao carrinho." });
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await pb.collection('cart_items').delete(cartItemId, { $autoCancel: false });
      setCartItems(cartItems.filter(item => item.id !== cartItemId));
      toast({ title: "Item removido", description: "O produto foi removido do carrinho." });
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível remover o item." });
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) return;
    try {
      const updatedItem = await pb.collection('cart_items').update(cartItemId, {
        quantity
      }, { $autoCancel: false });
      
      setCartItems(cartItems.map(item => 
        item.id === cartItemId ? { ...item, quantity: updatedItem.quantity } : item
      ));
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const clearCart = async () => {
    if (!currentUser) return;
    try {
      // Delete all cart items for the user
      const promises = cartItems.map(item => 
        pb.collection('cart_items').delete(item.id, { $autoCancel: false })
      );
      await Promise.all(promises);
      setCartItems([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const getCartSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product.price * (1 - (item.product.discount || 0) / 100);
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    const tax = subtotal * 0.10; // 10% tax
    return subtotal + tax;
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartSubtotal,
    getCartTotal,
    cartCount: cartItems.reduce((count, item) => count + item.quantity, 0)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
