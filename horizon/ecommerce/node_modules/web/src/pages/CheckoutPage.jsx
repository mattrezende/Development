
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, MapPin, Truck, CreditCard } from 'lucide-react';

import PaymentFormCard from '@/components/PaymentFormCard.jsx';
import PaymentFormBoleto from '@/components/PaymentFormBoleto.jsx';
import PaymentFormPix from '@/components/PaymentFormPix.jsx';

const CheckoutPage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [address, setAddress] = useState({
    street: '', number: '', complement: '', city: '', state: '', zipcode: ''
  });
  
  const { cartItems, getCartSubtotal, getCartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const subtotal = getCartSubtotal();
  const tax = subtotal * 0.10;
  const itemsTotal = subtotal + tax;
  const finalTotal = itemsTotal + shippingCost;

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const res = await pb.collection('payment_methods').getList(1, 50, {
          filter: 'active=true',
          $autoCancel: false
        });
        setPaymentMethods(res.items);
        if (res.items.length > 0) {
          setSelectedPaymentMethod(res.items[0].id);
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    };
    fetchPaymentMethods();
  }, []);

  if (cartItems.length === 0 && step === 1) {
    navigate('/cart');
    return null;
  }

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const calculateShipping = async () => {
    if (!address.zipcode || !address.street || !address.city || !address.state) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha todos os campos obrigatórios." });
      return;
    }

    setLoading(true);
    try {
      const cleanZip = address.zipcode.replace(/\D/g, '');
      const zipNum = parseInt(cleanZip, 10);

      const zonesRes = await pb.collection('shipping_zones').getList(1, 100, { $autoCancel: false });
      
      let foundCost = 25.00; // Default fallback
      for (const zone of zonesRes.items) {
        const start = parseInt(zone.zip_code_start, 10);
        const end = parseInt(zone.zip_code_end, 10);
        if (zipNum >= start && zipNum <= end) {
          foundCost = zone.shipping_cost;
          break;
        }
      }

      setShippingCost(foundCost);
      setStep(3);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Erro ao calcular frete." });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    setLoading(true);
    try {
      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image
      }));

      const selectedMethodObj = paymentMethods.find(m => m.id === selectedPaymentMethod);

      const order = await pb.collection('orders').create({
        userId: currentUser.id,
        items: orderItems,
        subtotal: itemsTotal,
        shipping_cost: shippingCost,
        totalPrice: finalTotal,
        status: 'pending',
        delivery_address: address,
        payment_method: selectedMethodObj ? selectedMethodObj.name : paymentResult.method,
        payment_status: paymentResult.status
      }, { $autoCancel: false });

      await clearCart();
      toast({ title: "Pedido Confirmado!", description: "Seu pedido foi realizado com sucesso." });
      navigate(`/track-order/${order.id}`);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível finalizar o pedido." });
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = ({ currentStep, title, icon: Icon, stepNum }) => (
    <div className={`flex flex-col items-center ${step >= stepNum ? 'text-primary' : 'text-muted-foreground'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= stepNum ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-medium hidden sm:block">{title}</span>
    </div>
  );

  const renderPaymentForm = () => {
    const method = paymentMethods.find(m => m.id === selectedPaymentMethod);
    if (!method) return null;

    switch (method.type) {
      case 'card':
        return <PaymentFormCard onSuccess={handlePaymentSuccess} loading={loading} />;
      case 'boleto':
        return <PaymentFormBoleto onSuccess={handlePaymentSuccess} loading={loading} />;
      case 'pix':
        return <PaymentFormPix onSuccess={handlePaymentSuccess} loading={loading} />;
      default:
        return <p>Método não suportado.</p>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Finalizar Compra</h1>

      <div className="flex justify-between items-center mb-12 relative px-4 sm:px-12">
        <div className="absolute left-0 top-5 w-full h-0.5 bg-muted -z-10"></div>
        <div className={`absolute left-0 top-5 h-0.5 bg-primary -z-10 transition-all duration-500`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
        
        <StepIndicator stepNum={1} currentStep={step} title="Resumo" icon={CheckCircle2} />
        <StepIndicator stepNum={2} currentStep={step} title="Endereço" icon={MapPin} />
        <StepIndicator stepNum={3} currentStep={step} title="Pagamento" icon={CreditCard} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {step === 1 && (
            <Card className="shadow-md border-none rounded-xl">
              <CardHeader>
                <CardTitle>Resumo dos Itens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-4 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                        {item.product.image && (
                          <img src={pb.files.getUrl(item.product, item.product.image)} alt={item.product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">R$ {(item.product.price * (1 - (item.product.discount || 0) / 100) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <Button className="w-full mt-6" onClick={() => setStep(2)}>Continuar para Endereço</Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="shadow-md border-none rounded-xl">
              <CardHeader>
                <CardTitle>Endereço de Entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label htmlFor="zipcode">CEP *</Label>
                    <Input id="zipcode" name="zipcode" value={address.zipcode} onChange={handleAddressChange} placeholder="00000-000" required />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input id="city" name="city" value={address.city} onChange={handleAddressChange} required />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label htmlFor="state">Estado *</Label>
                    <Input id="state" name="state" value={address.state} onChange={handleAddressChange} placeholder="SP" required />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="street">Rua/Avenida *</Label>
                    <Input id="street" name="street" value={address.street} onChange={handleAddressChange} required />
                  </div>
                  <div className="space-y-2 col-span-1">
                    <Label htmlFor="number">Número *</Label>
                    <Input id="number" name="number" value={address.number} onChange={handleAddressChange} required />
                  </div>
                  <div className="space-y-2 col-span-1">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input id="complement" name="complement" value={address.complement} onChange={handleAddressChange} placeholder="Apto 123" />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
                  <Button className="flex-1" onClick={calculateShipping} disabled={loading}>
                    {loading ? 'Calculando...' : 'Calcular Frete e Continuar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="shadow-md border-none rounded-xl">
              <CardHeader>
                <CardTitle>Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg flex items-start gap-4">
                  <Truck className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Entrega Padrão</p>
                    <p className="text-sm text-muted-foreground">
                      {address.street}, {address.number} {address.complement && `- ${address.complement}`} <br/>
                      {address.city} - {address.state}, {address.zipcode}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Selecione o Método de Pagamento</Label>
                  {paymentMethods.length > 0 ? (
                    <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {paymentMethods.map(method => (
                        <div key={method.id} className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Label htmlFor={method.id} className="cursor-pointer flex-1">{method.name}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum método de pagamento disponível.</p>
                  )}
                </div>

                {selectedPaymentMethod && (
                  <div className="mt-6">
                    {renderPaymentForm()}
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t">
                  <Button variant="outline" onClick={() => setStep(2)} disabled={loading}>Voltar</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-1">
          <Card className="shadow-lg border-none rounded-xl sticky top-24">
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxas (10%)</span>
                <span className="font-medium">R$ {tax.toFixed(2)}</span>
              </div>
              {step >= 3 && (
                <div className="flex justify-between text-primary">
                  <span>Frete</span>
                  <span className="font-medium">R$ {shippingCost.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3 mt-3 flex justify-between items-center">
                <span className="font-bold text-base">Total</span>
                <span className="font-bold text-2xl text-primary">
                  R$ {(step >= 3 ? finalTotal : itemsTotal).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
