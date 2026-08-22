import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-secondary text-secondary-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="heading-section text-xl mb-4">Bosque de Francisco</h3>
            <p className="text-sm leading-relaxed">
              Um espaço dedicado ao compartilhamento de conhecimento e experiências fitoterápicas.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Links Úteis</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-sm hover:text-primary transition-colors duration-200">
                Home
              </Link>
              <Link to="/postagens" className="text-sm hover:text-primary transition-colors duration-200">
                Postagens
              </Link>
              <Link to="/login" className="text-sm hover:text-primary transition-colors duration-200">
                Login
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="flex flex-col space-y-2">
              <a href="tel:+5511999999999" className="flex items-center text-sm hover:text-primary transition-colors duration-200">
                <Phone className="w-4 h-4 mr-2" />
                (61) 98529-6703
              </a>
              <a href="mailto:sergio.amizade@gmail.com" className="flex items-center text-sm hover:text-primary transition-colors duration-200">
                 <Mail className="w-4 h-4 mr-2" />
                sergiofitoterapeuta@gmail.com
              </a>
              <a href="https://www.instagram.com/bosquedefrancisco/" className="flex items-center text-sm hover:text-primary transition-colors duration-200">
                <Mail className="w-4 h-4 mr-2" />
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center text-sm">
          <p>© 2026 Bosque de Francisco. Todos os direitos reservados. Desenvolvido por Matheus Rezende</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link to="/privacidade" className="hover:text-primary transition-colors duration-200">
              Política de Privacidade
            </Link>
            <Link to="/termos" className="hover:text-primary transition-colors duration-200">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;