
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ArrowRight } from 'lucide-react';

const MyPurchasesPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await pb.collection('orders').getList(1, 50, {
          filter: `userId="${currentUser.id}"`,
          sort: '-created',
          $autoCancel: false
        });
        setOrders(result.items);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchOrders();
  }, [currentUser]);

  const getStatusInfo = (status) => {
    const info = {
      pending: { color: 'bg-yellow-500', label: 'Pendente' },
      processing: { color: 'bg-blue-500', label: 'Em Processamento' },
      shipped: { color: 'bg-purple-500', label: 'Enviado' },
      delivered: { color: 'bg-green-500', label: 'Entregue' }
    };
    return info[status] || { color: 'bg-gray-500', label: status };
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Minhas Compras</h1>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-xl border border-dashed">
          <div className="bg-background rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Você ainda não fez nenhuma compra</h3>
          <p className="text-muted-foreground mb-6">Explore nossos produtos e aproveite as ofertas!</p>
          <Button asChild>
            <Link to="/categorias">Começar a Comprar</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow border-none rounded-xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      Pedido #{order.id.slice(0,8)}
                      <Badge className={`${statusInfo.color} text-white hover:${statusInfo.color} border-none`}>
                        {statusInfo.label}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Realizado em {new Date(order.created).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-muted-foreground">Total do Pedido</p>
                    <p className="text-xl font-bold text-primary">R$ {order.totalPrice?.toFixed(2) || '0.00'}</p>
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="flex -space-x-4 overflow-hidden">
                    {order.items && order.items.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="inline-block h-12 w-12 rounded-full ring-2 ring-background bg-muted overflow-hidden">
                        {item.image ? (
                          <img src={pb.files.getUrl({ collectionId: 'products', id: item.productId }, item.image)} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">Img</div>
                        )}
                      </div>
                    ))}
                    {order.items && order.items.length > 4 && (
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full ring-2 ring-background bg-muted text-xs font-medium">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                  
                  <Button asChild variant="outline" className="w-full sm:w-auto gap-2">
                    <Link to={`/track-order/${order.id}`}>
                      Acompanhar Pedido <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyPurchasesPage;
