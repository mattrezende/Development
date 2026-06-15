import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle2, Circle, Bell } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { formatDate } from '@/lib/i18n';
import { toast } from 'sonner';

const NotificationsPage = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const records = await pb.collection('notifications').getFullList({
        filter: `teacher_id="${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });
      setNotifications(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchNotifications();
  }, [currentUser]);

  const toggleRead = async (id, currentStatus) => {
    try {
      await pb.collection('notifications').update(id, { read: !currentStatus }, { $autoCancel: false });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !currentStatus } : n));
    } catch (err) {
      toast.error('Erro ao atualizar status.');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await pb.collection('notifications').delete(id, { $autoCancel: false });
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notificação removida.');
    } catch (err) {
      toast.error('Erro ao remover notificação.');
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if(unread.length === 0) return;
    
    try {
      await Promise.all(unread.map(n => 
        pb.collection('notifications').update(n.id, { read: true }, { $autoCancel: false })
      ));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('Todas marcadas como lidas.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Helmet>
        <title>Notificações - Personal</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden w-full">
          <Sidebar />
          <main className="flex-1 bg-secondary/20 overflow-y-auto p-6 md:p-8 w-full">
            <div className="w-full space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
                    <p className="text-muted-foreground mt-0.5 text-sm">Gerencie seus avisos e alertas de sistema.</p>
                  </div>
                </div>
                <Button variant="outline" onClick={markAllAsRead} disabled={notifications.filter(n=>!n.read).length === 0}>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar todas como lidas
                </Button>
              </div>

              <div className="card-elevation-1 overflow-hidden">
                {loading ? (
                  <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : notifications.length === 0 ? (
                  <div className="p-16 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-lg font-medium text-foreground">Nenhuma notificação</p>
                    <p className="text-muted-foreground">Você está em dia com todos os avisos.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`p-4 flex items-start gap-4 transition-colors hover:bg-muted/30 ${!notif.read ? 'bg-primary/5' : 'bg-card'}`}>
                        <button onClick={() => toggleRead(notif.id, notif.read)} className="mt-1 focus:outline-none shrink-0" aria-label="Marcar como lida">
                          {notif.read ? <CheckCircle2 className="w-5 h-5 text-muted-foreground" /> : <Circle className="w-5 h-5 text-primary fill-primary/20" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${!notif.read ? 'text-foreground' : 'text-foreground/80'}`}>{notif.title}</p>
                          {notif.message && <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>}
                          <p className="text-xs text-muted-foreground/60 mt-2">{formatDate(notif.created_at)}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteNotification(notif.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;