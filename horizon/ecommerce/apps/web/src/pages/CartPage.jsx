
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Lock } from 'lucide-react';

const CartPage = () => {
  const { cartItems, loading, updateQuantity, removeFromCart, getCartSubtotal, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Authentication Check
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        <div className="bg-primary/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <Lock className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
        <p className="text-muted-foreground mb-8">
          Você precisa estar logado para acessar o carrinho e finalizar suas compras.
        </p>
        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="w-full">
            <Link to="/login?returnTo=/cart">Fazer Login</Link>
          </Button>
          <Button variant="outline" asChild size="lg" className="w-full">
            <Link to="/categorias">Continuar Comprando</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Carregando carrinho...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        <div className="bg-muted/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
        <p className="text-muted-foreground mb-8">
          Parece que você ainda não adicionou nenhum produto ao seu carrinho.
        </p>
        <Button asChild size="lg" className="w-full">
          <Link to="/categorias">Continuar Comprando</Link>
        </Button>
      </div>
    );
  }

  const subtotal = getCartSubtotal();
  const tax = subtotal * 0.10;
  const total = getCartTotal();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Meu Carrinho</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="shadow-md border-none rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Quantidade</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartItems.map((item) => {
                  const price = item.product.price * (1 - (item.product.discount || 0) / 100);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            {item.product.image ? (
                              <img 
                                src={pb.files.getUrl(item.product, item.product.image)} 
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">Sem img</div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium line-clamp-2">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">R$ {price.toFixed(2)} un</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        R$ {(price * item.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-lg border-none rounded-xl sticky top-24">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-6">Resumo do Pedido</h3>
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxas (10%)</span>
                  <span className="font-medium">R$ {tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between items-center">
                  <span className="font-bold text-base">Total</span>
                  <span className="font-bold text-2xl text-primary">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full gap-2" size="lg" onClick={() => navigate('/checkout')}>
                  Finalizar Compra <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/categorias">Continuar Comprando</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
