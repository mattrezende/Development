
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, LogOut, LayoutDashboard, Users, Clock, DollarSign, FileText } from 'lucide-react';

const Header = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Sistema de Gestão de RH</span>
          </Link>

          <nav className="flex items-center space-x-6">
            {!isAuthenticated && (
              <>
                <Link to="/login?role=admin" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
                  Admin Login
                </Link>
                <Link to="/login?role=manager" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
                  Manager Login
                </Link>
              </>
            )}

            {isAuthenticated && currentUser?.role === 'admin' && (
              <>
                <Link to="/admin-dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-emerald-600 transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/employees" className="flex items-center space-x-1 text-gray-700 hover:text-emerald-600 transition-colors">
                  <Users className="w-4 h-4" />
                  <span>Funcionários</span>
                </Link>
                <Link to="/timesheets" className="flex items-center space-x-1 text-gray-700 hover:text-emerald-600 transition-colors">
                  <Clock className="w-4 h-4" />
                  <span>Ponto</span>
                </Link>
                <Link to="/payroll" className="flex items-center space-x-1 text-gray-700 hover:text-emerald-600 transition-colors">
                  <DollarSign className="w-4 h-4" />
                  <span>Folha de Pagamento</span>
                </Link>
              </>
            )}

            {isAuthenticated && currentUser?.role === 'manager' && (
              <>
                <Link to="/manager-dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-emerald-600 transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/manager-timesheets" className="flex items-center space-x-1 text-gray-700 hover:text-emerald-600 transition-colors">
                  <Clock className="w-4 h-4" />
                  <span>Aprovar Ponto</span>
                </Link>
              </>
            )}

            {isAuthenticated && !currentUser?.role && (
              <Link to="/clock-in" className="flex items-center space-x-1 text-gray-700 hover:text-emerald-600 transition-colors">
                <Clock className="w-4 h-4" />
                <span>Registrar Ponto</span>
              </Link>
            )}

            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{currentUser?.name || currentUser?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
