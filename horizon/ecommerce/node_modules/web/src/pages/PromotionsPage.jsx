
import React, { useEffect, useState } from 'react';
import pb from '@/lib/pocketbaseClient';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PromotionsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const result = await pb.collection('products').getList(1, 50, { 
          filter: 'discount > 0',
          $autoCancel: false 
        });
        setProducts(result.items);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Promoções</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-[350px] bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhuma promoção no momento.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map(product => (
            <Card key={product.id} className="group overflow-hidden rounded-xl border-none shadow-md hover:shadow-xl transition-all">
              <div className="relative aspect-square bg-muted">
                <Badge className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground">
                  -{product.discount}%
                </Badge>
                {product.image && (
                  <img 
                    src={pb.files.getUrl(product, product.image)} 
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
              <CardContent className="p-5">
                <h3 className="font-semibold text-lg line-clamp-1 mb-1">{product.name}</h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-xl font-bold text-primary">
                    R$ {(product.price * (1 - product.discount / 100)).toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-0">
                <Button className="w-full gap-2" onClick={() => toast({ title: "🚧 Em desenvolvimento" })}>
                  <ShoppingBag className="h-4 w-4" /> Adicionar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromotionsPage;
