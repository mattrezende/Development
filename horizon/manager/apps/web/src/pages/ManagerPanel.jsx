
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header.jsx';

const ManagerPanel = () => {
  const { currentUser } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      fetchTimesheets();
    }
  }, [currentUser, filterStatus]);

  const fetchTimesheets = async () => {
    try {
      const records = await pb.collection('timesheets').getFullList({
        filter: `manager_id = "${currentUser.id}" && status = "${filterStatus}"`,
        sort: '-date',
        expand: 'employee_id',
        $autoCancel: false
      });
      setTimesheets(records);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os registros de ponto',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await pb.collection('timesheets').update(id, { status: 'approved' }, { $autoCancel: false });
      toast({
        title: 'Sucesso',
        description: 'Ponto aprovado com sucesso'
      });
      fetchTimesheets();
    } catch (error) {
      console.error('Error approving timesheet:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar o ponto',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (id) => {
    try {
      await pb.collection('timesheets').update(id, { status: 'rejected' }, { $autoCancel: false });
      toast({
        title: 'Sucesso',
        description: 'Ponto rejeitado'
      });
      fetchTimesheets();
    } catch (error) {
      console.error('Error rejecting timesheet:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar o ponto',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { label: 'Pendente', className: 'bg-amber-500 hover:bg-amber-600' },
      approved: { label: 'Aprovado', className: 'bg-emerald-500 hover:bg-emerald-600' },
      rejected: { label: 'Rejeitado', className: 'bg-red-500 hover:bg-red-600' }
    };
    const config = variants[status] || variants.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando registros...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Painel do Gerente - Sistema de Gestão de RH</title>
        <meta name="description" content="Aprove registros de ponto da sua equipe" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Painel do Gerente</h1>
            <p className="text-gray-600 mt-2">Aprove ou rejeite registros de ponto da sua equipe</p>
          </div>

          <Card className="border border-gray-200 shadow-lg mb-6">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('pending')}
                  className={filterStatus === 'pending' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                >
                  Pendentes
                </Button>
                <Button
                  variant={filterStatus === 'approved' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('approved')}
                  className={filterStatus === 'approved' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                >
                  Aprovados
                </Button>
                <Button
                  variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('rejected')}
                  className={filterStatus === 'rejected' ? 'bg-red-500 hover:bg-red-600' : ''}
                >
                  Rejeitados
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle>Registros de Ponto ({timesheets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Funcionário</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Entrada</TableHead>
                      <TableHead>Saída</TableHead>
                      <TableHead>Horas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timesheets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                          Nenhum registro encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      timesheets.map((timesheet) => {
                        const hours = timesheet.clock_in && timesheet.clock_out
                          ? ((new Date(`2000-01-01 ${timesheet.clock_out}`) - new Date(`2000-01-01 ${timesheet.clock_in}`)) / (1000 * 60 * 60)).toFixed(2)
                          : '-';
                        
                        return (
                          <TableRow key={timesheet.id}>
                            <TableCell className="font-medium">
                              {timesheet.expand?.employee_id?.name || 'N/A'}
                            </TableCell>
                            <TableCell>{new Date(timesheet.date).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>{timesheet.clock_in || '-'}</TableCell>
                            <TableCell>{timesheet.clock_out || '-'}</TableCell>
                            <TableCell>{hours}h</TableCell>
                            <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
                            <TableCell className="text-right">
                              {timesheet.status === 'pending' && (
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => handleApprove(timesheet.id)}
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Aprovar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(timesheet.id)}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Rejeitar
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ManagerPanel;
