
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import pb from '@/lib/pocketbaseClient';
import { useToast } from '@/hooks/use-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      await pb.collection('newsletter_signups').create({ email }, { $autoCancel: false });
      toast({ title: "Sucesso!", description: "Inscrição realizada com sucesso." });
      setEmail('');
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível realizar a inscrição." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">SuperMarket</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Sua melhor opção para compras online. Produtos frescos e de qualidade entregues na sua porta.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Links Úteis</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary">Sobre Nós</Link></li>
              <li><Link to="#" className="hover:text-primary">Contato</Link></li>
              <li><Link to="#" className="hover:text-primary">Política de Privacidade</Link></li>
              <li><Link to="#" className="hover:text-primary">Termos de Serviço</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> (11) 9999-9999</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> contato@supermarket.com</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> São Paulo, SP</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">Receba nossas ofertas exclusivas.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Seu e-mail" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
              />
              <Button type="submit" disabled={loading}>
                {loading ? '...' : 'Assinar'}
              </Button>
            </form>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SuperMarket. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
