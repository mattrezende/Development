import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext.jsx';

const Header = ({ onSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const scrollToSection = (id) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="https://horizons-cdn.hostinger.com/8c0f2a8e-86dd-4112-aab2-72151784c3a3/236ffff201603e95e774f812ed8d0e64.png" 
              alt="Bosque de Francisco logo" 
              className="h-9 md:h-12 w-auto object-contain"
            />
            <span className="heading-display text-2xl text-primary">Bosque de Francisco</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-foreground hover:text-primary transition-colors duration-200"
            >
              Home
            </Link>
            <button 
              onClick={() => scrollToSection('proximas-aulas')} 
              className="text-foreground hover:text-primary transition-colors duration-200"
            >
              Eventos
            </button>
            <Link 
              to="/postagens" 
              className="text-foreground hover:text-primary transition-colors duration-200"
            >
              Postagens
            </Link>
            {isAuthenticated && (
              <Link 
                to="/admin" 
                className="text-foreground hover:text-primary transition-colors duration-200"
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {onSearch && (
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar postagens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </form>
            )}
            {isAuthenticated ? (
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-foreground hover:text-primary transition-colors duration-200"
              >
                Home
              </Link>
              <button 
                onClick={() => scrollToSection('proximas-aulas')} 
                className="text-left text-foreground hover:text-primary transition-colors duration-200"
              >
                Próximas Aulas
              </button>
              <Link 
                to="/postagens" 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-foreground hover:text-primary transition-colors duration-200"
              >
                Postagens
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/admin" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="text-foreground hover:text-primary transition-colors duration-200"
                >
                  Admin
                </Link>
              )}
              {onSearch && (
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar postagens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </form>
              )}
              {isAuthenticated ? (
                <Button onClick={handleLogout} variant="outline" size="sm" className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/login">Login</Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;