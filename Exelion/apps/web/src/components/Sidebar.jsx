import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  GraduationCap,
  Wallet,
  BarChart3,
  FileBarChart,
  MapPin,
  DollarSign,
  FileText,
  Settings,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from '@/components/ui/sidebar.jsx';

const AppSidebar = () => {
  const location = useLocation();
  const { setOpenMobile, isMobile } = useSidebar();

  const menuGroups = [
    {
      title: 'Principal',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/schedules', label: 'Horários', icon: CalendarDays },
        { path: '/enrollments', label: 'Matrículas', icon: Users },
        { path: '/students', label: 'Alunos', icon: GraduationCap },
      ]
    },
    {
      title: 'Gestão e Dados',
      items: [
        { path: '/financial-management', label: 'Gestão Financeira', icon: DollarSign },
        { path: '/analytics', label: 'Análises', icon: BarChart3 },
        { path: '/reports', label: 'Relatórios', icon: FileBarChart },
      ]
    },
    {
      title: 'Configurações',
      items: [
        { path: '/service-areas', label: 'Faixa de CEP', icon: MapPin },
        { path: '/pricing', label: 'Preços', icon: DollarSign },
        { path: '/terms', label: 'Termos', icon: FileText },
        { path: '/settings', label: 'Ajustes', icon: Settings },
      ]
    }
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <Sidebar className="bg-sidebar">
      <SidebarContent>
        {/* Logo Section */}
        <div className="px-4 py-4 border-b border-border/50">
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src="https://horizons-cdn.hostinger.com/79d15a5a-e2fe-4545-97b7-f4514c9ae6a4/0e9fcb7b1fb58d1785056666579752e3.png" 
              alt="Exelion Logo" 
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {menuGroups.map((group, idx) => (
          <SidebarGroup key={idx}>
            <SidebarGroupLabel>
              {group.title}
            </SidebarGroupLabel>

            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                    >
                      <Link to={item.path} onClick={() => isMobile && setOpenMobile(false)}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;