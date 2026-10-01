import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Instagram, Twitter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
const Footer = () => {
  return <footer className="bg-slate-950 text-slate-300 py-12 border-t border-slate-800">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <img src="https://horizons-cdn.hostinger.com/79d15a5a-e2fe-4545-97b7-f4514c9ae6a4/0e9fcb7b1fb58d1785056666579752e3.png" alt="Exelion Logo" className="h-8 w-auto brightness-0 invert" />
            </Link>
            <p className="text-sm text-slate-400">
              A plataforma completa para professores que querem escalar seu negócio com profissionalismo.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Plataforma</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Entrar</Link></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Cadastrar</Link></li>
              <li><a href="#benefits" className="hover:text-white transition-colors">Benefícios</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/terms" className="hover:text-white transition-colors">Termos de Serviço</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacidade</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-slate-400 mb-4">Receba dicas para crescer seu negócio.</p>
            <form className="flex gap-2" onSubmit={e => e.preventDefault()}>
              <Input type="email" placeholder="Seu email" className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500" />
              <Button type="submit" variant="secondary">Assinar</Button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © 2026 Exelion. Todos os direitos reservados. Desenvolvido por Matheus Rezende Lopes
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;