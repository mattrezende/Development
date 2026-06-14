
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useCart } from '@/contexts/CartContext.jsx';
import { ShoppingCart, User, LogOut, Search, Menu, ShieldAlert, ChevronDown, LayoutDashboard, Package, Tags, Users, Building, Truck, CreditCard, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const { isAuthenticated, isAdmin, logout, currentUser } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  // Debug logs
  console.log('Header render - currentUser:', currentUser);
  console.log('Header render - isAdmin:', isAdmin);
  console.log('Header render - user role:', currentUser?.role);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLinks = () => (
    <>
      <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
      <Link to="/categorias" className="text-sm font-medium hover:text-primary transition-colors">Categorias</Link>
      <Link to="/promocoes" className="text-sm font-medium hover:text-primary transition-colors">Promoções</Link>
      {isAuthenticated && !isAdmin && (
        <Link to="/minhas-compras" className="text-sm font-medium hover:text-primary transition-colors">Minhas Compras</Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col gap-4 pt-10">
              <NavLinks />
              {isAdmin && (
                <>
                  <div className="h-px bg-border my-2" />
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" /> Admin Panel
                  </span>
                  <Link to="/admin/dashboard" className="text-sm font-medium text-primary">Dashboard</Link>
                  <Link to="/admin/produtos" className="text-sm font-medium text-primary">Produtos</Link>
                  <Link to="/admin/categorias" className="text-sm font-medium text-primary">Categorias</Link>
                  <Link to="/admin/usuarios" className="text-sm font-medium text-primary">Usuários</Link>
                </>
              )}
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden sm:inline-block">SuperMarket</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <NavLinks />
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="destructive" size="sm" className="text-sm font-medium flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" /> Admin Panel <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Navegação Admin</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/admin/dashboard"><LayoutDashboard className="mr-2 h-4 w-4"/> Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/admin/produtos"><Package className="mr-2 h-4 w-4"/> Produtos</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/admin/categorias"><Tags className="mr-2 h-4 w-4"/> Categorias</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/admin/usuarios"><Users className="mr-2 h-4 w-4"/> Usuários</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/admin/branches"><Building className="mr-2 h-4 w-4"/> Filiais</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/admin/shipping-zones"><Truck className="mr-2 h-4 w-4"/> Zonas de Entrega</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/admin/payment-methods"><CreditCard className="mr-2 h-4 w-4"/> Pagamentos</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/admin/theme-settings"><Palette className="mr-2 h-4 w-4"/> Tema e Aparência</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        <div className="flex items-center gap-2 flex-1 md:flex-none justify-end">
          <div className="relative hidden sm:block w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Buscar produtos..." className="pl-8 bg-muted/50" />
          </div>

          {isAuthenticated && !isAdmin && (
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground rounded-full">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAuthenticated ? (
                <>
                  <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                    {currentUser?.email}
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="cursor-pointer">Painel Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="cursor-pointer">Entrar</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/signup" className="cursor-pointer">Cadastrar</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
