import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { formatCurrency, statusToPtBR } from '@/lib/i18n';
import { CheckCircle2, Calendar, User, CreditCard, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const EnrollmentSuccessPage = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        const record = await pb.collection('enrollments').getOne(enrollmentId, {
          expand: 'teacher_id,student_id,schedule_id',
          $autoCancel: false
        });
        setEnrollment(record);
      } catch (err) {
        console.error('Error fetching enrollment:', err);
        setError('Não foi possível carregar os detalhes da matrícula.');
      } finally {
        setLoading(false);
      }
    };

    if (enrollmentId) {
      fetchEnrollment();
    }
  }, [enrollmentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground font-medium">Carregando confirmação...</p>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-card p-8 rounded-2xl border border-border shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-destructive mb-2">Erro</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/')}>Voltar ao Início</Button>
        </div>
      </div>
    );
  }

  const teacher = enrollment.expand?.teacher_id;
  const student = enrollment.expand?.student_id;
  const schedule = enrollment.expand?.schedule_id;

  const paymentMethodMap = {
    'pix': 'Pix',
    'credit_card': 'Cartão de Crédito',
    'debit_card': 'Cartão de Débito',
    'recurring': 'Recorrente'
  };

  return (
    <>
      <Helmet>
        <title>Matrícula Confirmada - Personal</title>
      </Helmet>

      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-8">
          
          <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
            <div className="bg-success/10 p-8 text-center border-b border-success/20">
              <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-success/30">
                <CheckCircle2 className="w-10 h-10 text-success-foreground" />
              </div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
                Matrícula realizada com sucesso!
              </h1>
              <p className="text-success font-medium text-lg">
                Seu pagamento foi aprovado e seu horário está garantido.
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" /> Aluno
                  </p>
                  <p className="font-semibold text-foreground text-lg">{student?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" /> Professor
                  </p>
                  <p className="font-semibold text-foreground text-lg">{teacher?.name}</p>
                </div>
              </div>

              <div className="bg-muted/40 rounded-2xl p-5 border border-border">
                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4" /> Horário Reservado
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="font-bold text-xl text-foreground capitalize">
                    {statusToPtBR[schedule?.day_of_week] || schedule?.day_of_week}
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-background border border-border font-medium">
                    {schedule?.start_time} às {schedule?.end_time}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Frequência: {statusToPtBR[schedule?.recurrence] || schedule?.recurrence}
                </p>
              </div>

              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Valor Pago</span>
                  <span className="font-bold text-xl">{formatCurrency(enrollment.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Método
                  </span>
                  <span className="font-medium">{paymentMethodMap[enrollment.payment_method] || enrollment.payment_method || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">ID da Transação</span>
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{enrollment.payment_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium">
                    {new Date(enrollment.created).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {teacher && (
              <Button variant="outline" size="lg" asChild className="shadow-sm">
                <Link to={`/professor/${teacher.id}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para página do professor
                </Link>
              </Button>
            )}
            
            {isAuthenticated && (
              <Button size="lg" asChild className="shadow-sm">
                <Link to="/dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Ir para dashboard
                </Link>
              </Button>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default EnrollmentSuccessPage;