
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard } from 'lucide-react';

const PaymentFormCard = ({ onSuccess, loading }) => {
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: ''
  });

  const handleChange = (e) => {
    setCardData({ ...cardData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock Stripe processing
    onSuccess({ method: 'card', status: 'completed', details: cardData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4 text-primary">
        <CreditCard className="h-5 w-5" />
        <span className="font-medium">Cartão de Crédito</span>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="number">Número do Cartão</Label>
        <Input 
          id="number" name="number" 
          placeholder="0000 0000 0000 0000" 
          value={cardData.number} onChange={handleChange} required 
          maxLength={19}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">Nome no Cartão</Label>
        <Input 
          id="name" name="name" 
          placeholder="NOME IMPRESSO NO CARTÃO" 
          value={cardData.name} onChange={handleChange} required 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiry">Validade (MM/AA)</Label>
          <Input 
            id="expiry" name="expiry" 
            placeholder="MM/AA" 
            value={cardData.expiry} onChange={handleChange} required 
            maxLength={5}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvc">CVC</Label>
          <Input 
            id="cvc" name="cvc" 
            placeholder="123" 
            value={cardData.cvc} onChange={handleChange} required 
            maxLength={4}
          />
        </div>
      </div>

      <Button type="submit" className="w-full mt-4" disabled={loading}>
        {loading ? 'Processando...' : 'Pagar com Cartão'}
      </Button>
    </form>
  );
};

export default PaymentFormCard;
