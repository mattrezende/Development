import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { formatDate, statusToPtBR } from '@/lib/i18n.js';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Users, Plus, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import DashboardEnrollmentForm from '@/components/DashboardEnrollmentForm.jsx';

const EnrollmentsPage = () => {
  const { currentUser } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState(null);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('enrollments').getFullList({
        filter: `teacher_id="${currentUser.id}"`,
        expand: 'student_id,schedule_id',
        sort: '-created_at',
        $autoCancel: false,
      });
      setEnrollments(records);
    } catch (error) {
      console.error(error);
      toast.error('Falha ao carregar matrículas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchEnrollments();
  }, [currentUser]);

  const handleAddEnrollment = () => {
    setEditingEnrollment(null);
    setIsFormOpen(true);
  };

  const handleEditEnrollment = (enrollment) => {
    setEditingEnrollment(enrollment);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (enrollment) => {
    setEnrollmentToDelete(enrollment);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!enrollmentToDelete) return;
    
    try {
      // If deleting an active enrollment, free up the schedule
      if (enrollmentToDelete.status === 'active' && enrollmentToDelete.schedule_id) {
        await pb.collection('schedules').update(enrollmentToDelete.schedule_id, {
          availability_status: 'Disponível'
        }, { $autoCancel: false });
      }

      await pb.collection('enrollments').delete(enrollmentToDelete.id, { $autoCancel: false });
      toast.success('Matrícula excluída com sucesso.');
      fetchEnrollments();
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      toast.error('Erro ao excluir matrícula.');
    } finally {
      setIsDeleteDialogOpen(false);
      setEnrollmentToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchEnrollments();
  };

  const filteredEnrollments = enrollments.filter(e => {
    if (statusFilter === 'all') return true;
    return e.status === statusFilter;
  });

  return (
    <>
      <Helmet>
        <title>Matrículas - Personal</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden w-full">
          <Sidebar />
          <main className="flex-1 bg-secondary/20 overflow-y-auto w-full">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Matrículas</h1>
                  <p className="text-muted-foreground mt-1">Gerencie as matrículas e horários dos alunos.</p>
                </div>
                <Button onClick={handleAddEnrollment}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Matrícula
                </Button>
              </div>

              <div className="mb-6">
                <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
                  <TabsList>
                    <TabsTrigger value="active">Ativas</TabsTrigger>
                    <TabsTrigger value="inactive">Inativas</TabsTrigger>
                    <TabsTrigger value="all">Todas</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredEnrollments.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border shadow-sm p-12 flex flex-col items-center justify-center text-center">
                  <Users className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma matrícula encontrada</h3>
                  <p className="text-muted-foreground">
                    {statusFilter === 'all'
                      ? 'Você ainda não possui matrículas registradas.'
                      : `Nenhuma matrícula encontrada para o status selecionado.`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 group">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg text-foreground">
                              {enrollment.expand?.student_id?.name || 'Aluno Desconhecido'}
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              enrollment.status === 'active' 
                                ? 'bg-success/10 text-success border-success/20' 
                                : 'bg-muted text-muted-foreground border-border'
                            }`}>
                              {enrollment.status === 'active' ? 'Ativa' : 'Inativa'}
                            </span>
                          </div>
                          
                          <div className="space-y-2 mt-3">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="w-4 h-4 mr-2 text-primary/70" />
                              {enrollment.expand?.schedule_id ? (
                                <span>
                                  {statusToPtBR[enrollment.expand.schedule_id.day_of_week] || enrollment.expand.schedule_id.day_of_week}, {enrollment.expand.schedule_id.start_time} - {enrollment.expand.schedule_id.end_time}
                                </span>
                              ) : (
                                'Horário não definido'
                              )}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 mr-2 text-primary/70" />
                              <span>Matriculado em: {enrollment.enrollment_date ? formatDate(enrollment.enrollment_date) : formatDate(enrollment.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col justify-end gap-2 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-4 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" onClick={() => handleEditEnrollment(enrollment)} className="flex-1 sm:flex-none">
                            <Edit2 className="w-4 h-4 mr-2 sm:mr-0" />
                            <span className="sm:hidden">Editar</span>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteClick(enrollment)} className="flex-1 sm:flex-none text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4 mr-2 sm:mr-0" />
                            <span className="sm:hidden">Excluir</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingEnrollment ? 'Editar Matrícula' : 'Nova Matrícula'}</DialogTitle>
            <DialogDescription>
              Preencha os dados da matrícula abaixo.
            </DialogDescription>
          </DialogHeader>
          <DashboardEnrollmentForm 
            initialData={editingEnrollment} 
            onSuccess={handleFormSuccess} 
            onCancel={() => setIsFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Matrícula</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta matrícula? O horário associado será liberado. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EnrollmentsPage;