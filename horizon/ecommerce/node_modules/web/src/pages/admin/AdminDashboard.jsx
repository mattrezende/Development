
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Package, Users, ShoppingCart, Tags, Building, Truck, CreditCard, Palette } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ products: 0, categories: 0, users: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [p, c, u, o] = await Promise.all([
          pb.collection('products').getList(1, 1, { $autoCancel: false }),
          pb.collection('categories').getList(1, 1, { $autoCancel: false }),
          pb.collection('users').getList(1, 1, { $autoCancel: false }),
          pb.collection('orders').getList(1, 1, { $autoCancel: false })
        ]);
        setStats({
          products: p.totalItems,
          categories: c.totalItems,
          users: u.totalItems,
          orders: o.totalItems
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total de Produtos', value: stats.products, icon: Package, color: 'text-blue-500' },
    { title: 'Categorias', value: stats.categories, icon: Tags, color: 'text-green-500' },
    { title: 'Usuários', value: stats.users, icon: Users, color: 'text-purple-500' },
    { title: 'Pedidos', value: stats.orders, icon: ShoppingCart, color: 'text-orange-500' },
  ];

  const quickLinks = [
    { title: 'Gerenciar Produtos', desc: 'Adicionar ou editar produtos', href: '/admin/produtos', icon: Package },
    { title: 'Zonas de Entrega', desc: 'Configurar fretes e CEPs', href: '/admin/shipping-zones', icon: Truck },
    { title: 'Métodos de Pagamento', desc: 'Ativar PIX, Cartão, Boleto', href: '/admin/payment-methods', icon: CreditCard },
    { title: 'Aparência', desc: 'Alterar cores e logo', href: '/admin/theme-settings', icon: Palette },
    { title: 'Filiais', desc: 'Gerenciar lojas físicas', href: '/admin/branches', icon: Building },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo de volta, {currentUser?.name || currentUser?.email || 'Administrador'}! Aqui está o resumo da sua loja.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? '...' : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link, i) => (
              <Link key={i} to={link.href}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <link.icon className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                    <CardDescription>{link.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
