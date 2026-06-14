
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Clock, Truck, CheckCircle2, ArrowLeft, MapPin } from 'lucide-react';

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const record = await pb.collection('orders').getOne(orderId, { $autoCancel: false });
        setOrder(record);
      } catch (err) {
        console.error(err);
        setError("Pedido não encontrado ou você não tem permissão para visualizá-lo.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="container mx-auto px-4 py-24 text-center">Carregando detalhes do pedido...</div>;
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <div className="bg-destructive/10 text-destructive rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Package className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Pedido não encontrado</h2>
        <p className="text-muted-foreground mb-8">{error || "Verifique o número do pedido e tente novamente."}</p>
        <Button asChild>
          <Link to="/minhas-compras">Voltar para Minhas Compras</Link>
        </Button>
      </div>
    );
  }

  const statuses = [
    { id: 'pending', label: 'Pendente', icon: Clock },
    { id: 'processing', label: 'Em Processamento', icon: Package },
    { id: 'shipped', label: 'Enviado', icon: Truck },
    { id: 'delivered', label: 'Entregue', icon: CheckCircle2 }
  ];

  const currentStatusIndex = statuses.findIndex(s => s.id === order.status);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/minhas-compras"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Pedido #{order.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground">Realizado em {new Date(order.created).toLocaleDateString('pt-BR')} às {new Date(order.created).toLocaleTimeString('pt-BR')}</p>
        </div>
      </div>

      <Card className="mb-8 shadow-md border-none rounded-xl overflow-hidden">
        <CardContent className="p-8">
          <div className="relative flex justify-between items-center">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-500" 
              style={{ width: `${(Math.max(0, currentStatusIndex) / (statuses.length - 1)) * 100}%` }}
            ></div>
            
            {statuses.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const Icon = status.icon;
              
              return (
                <div key={status.id} className="flex flex-col items-center bg-card px-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-card transition-colors duration-300 ${
                    isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`mt-3 text-sm font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-none rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items && order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={pb.files.getUrl({ collectionId: 'products', id: item.productId }, item.image)} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Sem img</div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qtd: {item.quantity} x R$ {item.price?.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-none rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>R$ {order.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frete</span>
                <span>R$ {order.shipping_cost?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="border-t pt-3 mt-3 flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="font-bold text-xl text-primary">R$ {order.totalPrice?.toFixed(2) || '0.00'}</span>
              </div>
            </CardContent>
          </Card>

          {order.delivery_address && (
            <Card className="shadow-sm border-none rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{order.delivery_address.street}, {order.delivery_address.number}</p>
                {order.delivery_address.complement && <p>{order.delivery_address.complement}</p>}
                <p>{order.delivery_address.city} - {order.delivery_address.state}</p>
                <p>CEP: {order.delivery_address.zipcode}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
