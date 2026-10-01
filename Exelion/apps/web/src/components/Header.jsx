import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useMobileMenu } from '@/contexts/MobileMenuContext.jsx';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  LogOut, 
  User, 
  Settings, 
  Calendar, 
  Users, 
  BookOpen, 
  Globe, 
  X,
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  DollarSign,
  BarChart3,
  FileBarChart,
  MapPin,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const Header = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { isOpen, toggleMenu, closeMenu } = useMobileMenu();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  // Close mobile menu on route change
  useEffect(() => {
    closeMenu();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log('Header: Rendered with isOpen =', isOpen);
  }, [isOpen]);

  // Construct the public profile URL using the correct route structure
  const profileUrl = currentUser ? `/professor/${currentUser.id}` : '';

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            {isAuthenticated && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={() => {
                  console.log('Header: Hamburger button clicked');
                  toggleMenu();
                }}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            )}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img 
                src="https://horizons-cdn.hostinger.com/79d15a5a-e2fe-4545-97b7-f4514c9ae6a4/0e9fcb7b1fb58d1785056666579752e3.png" 
                alt="Exelion Logo" 
                className="h-10 w-auto"
              />
            </Link>
            {currentUser?.id && (
              <h1 className="hidden md:block text-lg font-regular tracking-tight text-foreground border-l border-border/50 pl-6">
                www.exelion.com.br/professor/{currentUser.id} 
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="hidden sm:flex">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Cadastrar</Link>
                </Button>
              </div>
            ) : (
              <TooltipProvider>
                {/* Desktop Public Profile Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="hidden sm:flex items-center gap-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-colors"
                    >
                      <a
                        href={profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        <span className="text-sm font-medium">Perfil Público</span>
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Ver perfil público</p>
                  </TooltipContent>
                </Tooltip>

                {/* Mobile Public Profile Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="sm:hidden flex items-center justify-center hover:bg-primary/10 transition-colors"
                    >
                      <a
                        href={profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-5 w-5 text-primary" />
                        <span className="sr-only">Perfil Público</span>
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Ver perfil público</p>
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-2">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary">
                        {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{currentUser?.name || 'Professor'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {currentUser?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer flex items-center">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/students" className="cursor-pointer flex items-center">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        <span>Alunos</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/enrollments" className="cursor-pointer flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Matrículas</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/schedules" className="cursor-pointer flex items-center">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        <span>Horários</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configurações</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipProvider>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay with Framer Motion for Smooth Interactions */}
      <AnimatePresence>
        {isOpen && isAuthenticated && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden" 
            onClick={() => {
              console.log('Header: Clicked outside overlay, closing menu');
              closeMenu();
            }}
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 z-50 w-4/5 max-w-sm bg-card border-r border-border p-6 shadow-2xl flex flex-col gap-6 overflow-hidden"
              onClick={e => e.stopPropagation()} // Prevent clicks inside from bubbling up
            >
              <div className="flex items-center justify-between shrink-0">
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={closeMenu}>
                  <img 
                    src="https://horizons-cdn.hostinger.com/79d15a5a-e2fe-4545-97b7-f4514c9ae6a4/0e9fcb7b1fb58d1785056666579752e3.png" 
                    alt="Exelion Logo" 
                    className="h-8 w-auto"
                  />
                </Link>
                <Button variant="ghost" size="icon" onClick={() => {
                  console.log('Header: Close button clicked');
                  closeMenu();
                }}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              
              <div className="flex flex-col space-y-1 mt-2 mb-2 px-2 border-b border-border/50 pb-6 shrink-0">
                <p className="text-base font-medium leading-none">{currentUser?.name || 'Professor'}</p>
                <p className="text-sm leading-none text-muted-foreground mt-2 break-all">
                  {currentUser?.email}
                </p>
              </div>
              
              <nav className="flex flex-col gap-6 overflow-y-auto pb-6 flex-1 hide-scrollbar">
                {/* Group 1: Principal */}
                <div className="flex flex-col gap-1">
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Principal</p>
                  <Link to="/dashboard" className={`flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-colors ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`} onClick={closeMenu}>
                    <LayoutDashboard className={`h-5 w-5 ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`} /> Dashboard
                  </Link>
                  <Link to="/schedules" className={`flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-colors ${isActive('/schedules') ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`} onClick={closeMenu}>
                    <CalendarDays className={`h-5 w-5 ${isActive('/schedules') ? 'text-primary' : 'text-muted-foreground'}`} /> Horários
                  </Link>
                  <Link to="/enrollments" className={`flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-colors ${isActive('/enrollments') ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`} onClick={closeMenu}>
                    <Users className={`h-5 w-5 ${isActive('/enrollments') ? 'text-primary' : 'text-muted-foreground'}`} /> Matrículas
                  </Link>
                  <Link to="/students" className={`flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-colors ${isActive('/students') ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`} onClick={closeMenu}>
                    <GraduationCap className={`h-5 w-5 ${isActive('/students') ? 'text-primary' : 'text-muted-foreground'}`} /> Alunos
                  </Link>
                </div>

                {/* Group 2: Gestão e Dados */}
                <div className="flex flex-col gap-1">
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Gestão e Dados</p>
                  <Link to="/financial-management" className={`flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-colors ${isActive('/financial-management') ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`} onClick={closeMenu}>
                    <DollarSign className={`h-5 w-5 ${isActive('/financial-management') ? 'text-primary' : 'text-muted-foreground'}`} /> Gestão Financeira
                  </Link>
                  <Link to="/analytics" className={`flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-colors ${isActive('/analytics') ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`} onClick={closeMenu}>
                    <BarChart3 className={`h-5 w-5 ${isActive('/analytics') ? 'text-primary' : 'text-muted-foreground'}`} /> Análises
                  </Link>
                  <Link to="/reports" className={`flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-colors ${isActive('/reports') ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`} onClick={closeMenu}>
                    <FileBarChart className={`h-5 w-5 ${isActive('/reports') ? 'text-primary' : 'text-muted-foreground'}`} /> Relatórios
                  </Link>
                </div>

                {/* Group 3: Configurações */}
                <div className="flex flex-col gap-1">
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Configurações</p>
                  <Link to="/service-areas" className={`flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-colors ${isActive('/service-areas') ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`} onClick={closeMenu}>
                    <MapPin className={`h-5 w-5 ${isActive('/service-areas') ? 'text-primary' : 'text-muted-foreground'}`} /> Faixa de CEP
                  </Link>
                  <Link to="/pricing" className={`flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-colors ${isActive('/pricing') ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`} onClick={closeMenu}>
                    <DollarSign className={`h-5 w-5 ${isActive('/pricing') ? 'text-primary' : 'text-muted-foreground'}`} /> Preços
                  </Link>
                  <Link to="/terms" className={`flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-colors ${isActive('/terms') ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`} onClick={closeMenu}>
                    <FileText className={`h-5 w-5 ${isActive('/terms') ? 'text-primary' : 'text-muted-foreground'}`} /> Termos
                  </Link>
                  <Link to="/settings" className={`flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-colors ${isActive('/settings') ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`} onClick={closeMenu}>
                    <Settings className={`h-5 w-5 ${isActive('/settings') ? 'text-primary' : 'text-muted-foreground'}`} /> Ajustes
                  </Link>
                </div>
              </nav>
              
              <div className="mt-auto pt-4 border-t border-border shrink-0">
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 px-3 py-6" onClick={handleLogout}>
                  <LogOut className="mr-3 h-5 w-5" />
                  <span className="text-base font-medium">Sair da Conta</span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;