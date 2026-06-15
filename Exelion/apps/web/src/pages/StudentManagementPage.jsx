import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Mail, Phone, CalendarDays, Plus, Edit2, Trash2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { formatDate } from '@/lib/i18n';
import { toast } from 'sonner';
import StudentForm from '@/components/StudentForm.jsx';

const StudentManagementPage = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('students').getFullList({
        filter: `teacher_id="${currentUser.id}"`,
        sort: '-created_at',
        $autoCancel: false
      });
      setStudents(records);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar alunos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchStudents();
  }, [currentUser]);

  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    
    try {
      await pb.collection('students').delete(studentToDelete.id, { $autoCancel: false });
      toast.success('Aluno excluído com sucesso.');
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Erro ao excluir aluno.');
    } finally {
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchStudents();
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Gestão de Alunos - Personal</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden w-full">
          <Sidebar />
          <main className="flex-1 bg-secondary/20 overflow-y-auto p-6 md:p-8 w-full">
            <div className="w-full space-y-6 max-w-7xl mx-auto">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
                  <p className="text-muted-foreground mt-1">Gerencie a base de clientes e perfis.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar por nome ou email..." 
                      className="pl-9 bg-card"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddStudent} className="shrink-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Aluno
                  </Button>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/40 text-muted-foreground uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-6 py-4">Aluno</th>
                        <th className="px-6 py-4">Contato</th>
                        <th className="px-6 py-4">Nascimento</th>
                        <th className="px-6 py-4">Data de Entrada</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {loading ? (
                        <tr><td colSpan="5" className="p-8 text-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                      ) : filteredStudents.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center text-muted-foreground">Nenhum aluno encontrado.</td></tr>
                      ) : (
                        filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-muted/20 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                  {student.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">{student.name}</div>
                                  <div className="text-xs text-muted-foreground">ID: {student.id.substring(0,8)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Mail className="w-3.5 h-3.5" /> <span className="truncate max-w-[150px]">{student.email || 'N/A'}</span>
                                </div>
                                {student.phone && (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="w-3.5 h-3.5" /> <span>{student.phone}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                              {student.date_of_birth ? formatDate(student.date_of_birth) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <CalendarDays className="w-4 h-4" />
                                {formatDate(student.created_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" onClick={() => handleEditStudent(student)}>
                                  <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(student)}>
                                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>

      {/* Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingStudent ? 'Editar Aluno' : 'Novo Aluno'}</DialogTitle>
            <DialogDescription>
              Preencha os dados do aluno abaixo.
            </DialogDescription>
          </DialogHeader>
          <StudentForm 
            initialData={editingStudent} 
            onSuccess={handleFormSuccess} 
            onCancel={() => setIsFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Aluno</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o aluno <strong>{studentToDelete?.name}</strong>? Esta ação não pode ser desfeita.
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

export default StudentManagementPage;