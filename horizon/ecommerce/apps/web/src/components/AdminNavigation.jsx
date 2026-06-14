
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Users, Building, Truck, CreditCard, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Produtos', href: '/admin/produtos', icon: Package },
  { title: 'Categorias', href: '/admin/categorias', icon: Tags },
  { title: 'Subcategorias', href: '/admin/subcategories', icon: Tags },
  { title: 'Usuários', href: '/admin/usuarios', icon: Users },
  { title: 'Filiais', href: '/admin/branches', icon: Building },
  { title: 'Zonas de Entrega', href: '/admin/shipping-zones', icon: Truck },
  { title: 'Tipos de Entrega', href: '/admin/delivery-types', icon: Truck },
  { title: 'Pagamentos', href: '/admin/payment-methods', icon: CreditCard },
  { title: 'Tema', href: '/admin/theme-settings', icon: Palette },
];

const AdminNavigation = () => {
  const location = useLocation();

  console.log('AdminNavigation rendered');

  return (
    <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 w-full scrollbar-hide">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2.5 rounded-md transition-colors whitespace-nowrap text-sm font-medium",
              isActive 
                ? "bg-slate-800 text-white" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
            )}
          >
            <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
};

export default AdminNavigation;
