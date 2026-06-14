
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import pb from '@/lib/pocketbaseClient';
import { useToast } from '@/hooks/use-toast';
import { useAuthRedirect } from '@/hooks/useAuthRedirect.js';
import { useCart } from '@/contexts/CartContext.jsx';
import { useTheme } from '@/hooks/useTheme.js';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { requireAuth } = useAuthRedirect();
  const { addToCart } = useCart();
  const { themeSettings } = useTheme();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await pb.collection('products').getList(1, 8, {
          sort: '-created',
          $autoCancel: false
        });
        setProducts(result.items);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    // Check auth and redirect to login with returnTo=/ if not authenticated
    // If authenticated, it will return true and we can proceed
    const isAuth = requireAuth(null, '/');
    
    if (isAuth) {
      try {
        await addToCart(product, 1);
        toast({
          title: "Produto adicionado!",
          description: `${product.name} foi adicionado ao seu carrinho.`,
        });
        // Optionally redirect to cart immediately as requested
        requireAuth('/cart');
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível adicionar ao carrinho.",
        });
      }
    }
  };

  const heroBg = themeSettings?.hero_banner 
    ? pb.files.getUrl(themeSettings, themeSettings.hero_banner) 
    : 'https://images.unsplash.com/photo-1561329913-721c104c3846';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen bg-cover bg-center flex items-center"
        style={{ backgroundImage: `url('${heroBg}')` }}
      >
        {/* Dark Gradient Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-0" />
        
        {/* Left-aligned Content */}
        <div className="relative z-10 w-full md:w-2/3 lg:w-1/2 pl-8 md:pl-16 lg:pl-24 pr-8 py-8 md:py-16 flex flex-col text-left">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white transition-all duration-500">
            Frescor que chega <br className="hidden md:block" />
            <span className="text-primary">na sua porta</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl transition-all duration-500">
            Os melhores produtos, selecionados com carinho e entregues com rapidez. 
            Faça suas compras sem sair de casa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-start">
            <Button size="lg" asChild className="text-lg px-8 shadow-lg hover:shadow-primary/25 transition-all duration-300">
              <Link to="/categorias">Comprar Agora</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 hover:bg-white/20 border-white/20 text-white transition-all duration-300" asChild>
              <Link to="/promocoes">Ver Ofertas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Destaques da Semana</h2>
              <p className="text-muted-foreground">Produtos selecionados especialmente para você</p>
            </div>
            <Button variant="ghost" className="hidden sm:flex items-center gap-2" asChild>
              <Link to="/categorias">Ver todos <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[350px] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group overflow-hidden rounded-xl border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {product.discount > 0 && (
                      <Badge className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground">
                        -{product.discount}%
                      </Badge>
                    )}
                    {product.image ? (
                      <img 
                        src={pb.files.getUrl(product, product.image)} 
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">
                        Sem imagem
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg line-clamp-1 mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 h-10">
                      {product.description || "Sem descrição"}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-primary">
                        R$ {(product.price * (1 - (product.discount || 0) / 100)).toFixed(2)}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-sm text-muted-foreground line-through">
                          R$ {product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-5 pt-0">
                    <Button className="w-full gap-2" onClick={() => handleAddToCart(product)}>
                      <ShoppingBag className="h-4 w-4" /> Comprar Agora
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
