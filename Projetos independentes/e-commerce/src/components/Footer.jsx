
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, ShoppingBag } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Inscrito!",
        description: "Obrigado por assinar nossa newsletter de ofertas.",
        className: "bg-green-50 border-green-200 text-green-900",
      });
      setEmail('');
    } else {
      toast({
        title: "Email inválido",
        description: "Por favor insira um email válido.",
        variant: "destructive",
      });
    }
  };

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4 group">
              <div className="bg-green-500 p-2 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                SuperMarket
              </span>
            </Link>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Qualidade, frescor e economia. Seu supermercado online favorito com entrega no conforto da sua casa.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors p-2 hover:bg-green-50 rounded-full">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors p-2 hover:bg-green-50 rounded-full">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors p-2 hover:bg-green-50 rounded-full">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors p-2 hover:bg-green-50 rounded-full">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-900 font-bold mb-6">Departamentos</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/products?category=Frutas%20e%20Verduras" className="text-gray-500 hover:text-green-600 text-sm transition-colors">
                  Hortifruti
                </Link>
              </li>
              <li>
                <Link to="/products?category=Alimentos" className="text-gray-500 hover:text-green-600 text-sm transition-colors">
                  Mercearia
                </Link>
              </li>
              <li>
                <Link to="/products?category=Bebidas" className="text-gray-500 hover:text-green-600 text-sm transition-colors">
                  Bebidas
                </Link>
              </li>
              <li>
                <Link to="/products?category=Laticínios" className="text-gray-500 hover:text-green-600 text-sm transition-colors">
                  Laticínios
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-gray-900 font-bold mb-6">Ajuda</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-500 hover:text-green-600 text-sm transition-colors">
                  Rastrear Pedido
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-green-600 text-sm transition-colors">
                  Política de Entrega
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-green-600 text-sm transition-colors">
                  Trocas e Devoluções
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-green-600 text-sm transition-colors">
                  Fale Conosco
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-gray-900 font-bold mb-6">Ofertas Exclusivas</h4>
            <p className="text-gray-500 text-sm mb-4">
              Cadastre-se para receber as melhores ofertas da semana.
            </p>
            <form onSubmit={handleSubscribe}>
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor email"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Inscrever-se
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-100 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 SuperMarket. Todos os direitos reservados.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">Aceitamos:</span>
              <div className="flex space-x-2">
                {['Visa', 'Mastercard', 'Elo', 'Pix'].map((method) => (
                  <div
                    key={method}
                    className="px-3 py-1 bg-gray-50 border border-gray-100 rounded text-xs text-gray-500 font-medium"
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
