import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, AlertCircle, CalendarDays } from 'lucide-react';
import { calculateEnrollmentPrice } from '@/hooks/usePriceCalculator.js';
import { formatCurrency } from '@/lib/i18n.js';

import TeacherBanner from '@/components/public/TeacherBanner.jsx';
import AvailableSchedulesGrid from '@/components/public/AvailableSchedulesGrid.jsx';
import EnrollmentForm from '@/components/public/EnrollmentForm.jsx';
import MandatoryCheckboxes from '@/components/public/MandatoryCheckboxes.jsx';
import TermsModal from '@/components/public/TermsModal.jsx';
import EnrollmentPaymentForm from '@/components/public/EnrollmentPaymentForm.jsx';
import InstagramFeedSection from '@/components/public/InstagramFeedSection.jsx';

const PublicTeacherProfile = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [teacher, setTeacher] = useState(null);
  
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [schedulesError, setSchedulesError] = useState(null);
  
  const [serviceAreas, setServiceAreas] = useState([]);
  const [terms, setTerms] = useState(null);

  const [enrollmentType, setEnrollmentType] = useState('semanal');
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const [cepValid, setCepValid] = useState(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [createdEnrollmentId, setCreatedEnrollmentId] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    cpf: '',
    document_type: 'CPF',
    area_code: '',
    phone_number: '',
    zip_code: '',
    street: '',
    street_number: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const [agreements, setAgreements] = useState({
    noHealthIssues: false,
    acceptedTerms: false,
  });

  const loadSchedules = useCallback(async () => {
    if (!teacherId) return;

    try {
      setSchedulesLoading(true);
      setSchedulesError(null);
      
      const rawResponse = await pb.collection('schedules').getList(1, 100, {
        filter: `teacher_id="${teacherId}" && availability_status="Disponível"`,
        sort: 'day_of_week,start_time',
        $autoCancel: false,
      });
      
      setSchedules(rawResponse.items || []);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
      setSchedulesError('Ocorreu um erro ao carregar os horários.');
      setSchedules([]);
    } finally {
      setSchedulesLoading(false);
    }
  }, [teacherId]);

  const fetchTeacherData = useCallback(async () => {
    if (!teacherId) {
      setError("ID do professor não fornecido na URL.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const teacherData = await pb.collection('teachers').getOne(teacherId, { $autoCancel: false });
      setTeacher(teacherData);

      try {
        const areasData = await pb.collection('serviceAreas').getFullList({
          filter: `teacher_id="${teacherId}"`,
          $autoCancel: false,
        });
        setServiceAreas(areasData);
      } catch (areaError) {
        setServiceAreas([]);
      }

      try {
        const termsData = await pb.collection('termsAndConditions').getFirstListItem(
          `teacher_id="${teacherId}"`, 
          { $autoCancel: false }
        );
        setTerms(termsData);
      } catch (termsError) {
        setTerms(null);
      }

    } catch (err) {
      console.error('Teacher profile fetch failed:', err);
      setError("Não foi possível carregar o perfil deste professor.");
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    if (teacherId) {
      fetchTeacherData();
      loadSchedules();
    }
  }, [teacherId, fetchTeacherData, loadSchedules]);

  useEffect(() => {
    const getPrice = async () => {
      if (enrollmentType === 'avulso') {
        const singlePrice = teacher?.single_lesson_price || 0;
        setTotalPrice(singlePrice > 0 ? singlePrice * quantity : 0);
        return;
      }

      if (enrollmentType === 'semanal') {
        if (selectedSchedules.length === 0) {
          setTotalPrice(0);
          return;
        }
        try {
          const price = await calculateEnrollmentPrice(teacherId, 'semanal', selectedSchedules.length);
          setTotalPrice(price || 0);
        } catch (priceError) {
          console.error('[PublicTeacherProfile] Price calculation error:', priceError);
          setTotalPrice(0);
        }
      }
    };
    getPrice();
  }, [enrollmentType, quantity, selectedSchedules.length, teacher, teacherId]);

  const handleToggleSchedule = (schedule) => {
    setSelectedSchedules(prev => {
      const isSelected = prev.some(s => s.id === schedule.id);
      if (isSelected) {
        return prev.filter(s => s.id !== schedule.id);
      } else {
        if (prev.length >= 5) {
          toast.error("Você pode selecionar no máximo 5 horários semanais.");
          return prev;
        }
        return [...prev, schedule];
      }
    });
  };

  const handleTypeChange = (value) => {
    setEnrollmentType(value);
    if (value === 'avulso') {
      setSelectedSchedules([]); 
      setQuantity(1);
    } else {
      setQuantity(1);
    }
  };

  const handleInitiatePayment = async () => {
    setHasAttemptedSubmit(true);

    if (enrollmentType === 'semanal' && selectedSchedules.length === 0) {
      toast.error("Para o plano mensal, por favor selecione os dias e horários na grade acima.");
      return;
    }
    
    if (!totalPrice || totalPrice <= 0) {
      toast.error(`O valor não está configurado para a quantidade selecionada. Verifique com o professor.`);
      return;
    }

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.cpf || !formData.area_code || !formData.phone_number) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    // Validate CPF
    const cleanedCPF = formData.cpf.replace(/\D/g, '');
    if (cleanedCPF.length !== 11) {
      toast.error("CPF deve ter 11 dígitos.");
      return;
    }

    // Validate area code
    const cleanedAreaCode = formData.area_code.replace(/\D/g, '');
    if (cleanedAreaCode.length !== 2) {
      toast.error("DDD deve ter 2 dígitos.");
      return;
    }

    // Validate phone number
    const cleanedPhoneNumber = formData.phone_number.replace(/\D/g, '');
    if (cleanedPhoneNumber.length < 8 || cleanedPhoneNumber.length > 9) {
      toast.error("Telefone deve ter 8 ou 9 dígitos.");
      return;
    }

    // Validate state if provided
    if (formData.state && !/^[A-Z]{2}$/.test(formData.state)) {
      toast.error("Estado deve ter 2 letras maiúsculas (ex: SP).");
      return;
    }

    // Validate zip code if provided
    if (formData.zip_code) {
      const cleanedZipCode = formData.zip_code.replace(/\D/g, '');
      if (cleanedZipCode.length !== 8) {
        toast.error("CEP deve ter 8 dígitos.");
        return;
      }
    }

    if (serviceAreas.length > 0 && cepValid === false) {
      toast.error("Este professor não atende na sua região de CEP.");
      return;
    }

    if (!agreements.noHealthIssues || !agreements.acceptedTerms) {
      toast.error("Você deve aceitar os acordos obrigatórios para prosseguir.");
      return;
    }

    setIsSubmitting(true);
    try {
      const primarySchedule =
        enrollmentType === 'semanal' && selectedSchedules.length > 0
          ? selectedSchedules[0]
          : null;

      const requestBody = {
        teacherId: teacher.id,
        teacherName: teacher.name,
        studentData: {
          firstName: formData.first_name,
          lastName: formData.last_name,
          email: formData.email,
          cpf: formData.cpf,
          documentType: formData.document_type,
          areaCode: formData.area_code,
          phoneNumber: formData.phone_number,
          zipCode: formData.zip_code,
          street: formData.street,
          streetNumber: formData.street_number,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
        },
        lessonType: enrollmentType === 'semanal' ? 'weekly' : 'single',
        enrollmentType,
        quantity: enrollmentType === 'semanal' ? selectedSchedules.length : quantity,
        scheduleIds: enrollmentType === 'semanal' ? selectedSchedules.map(s => s.id) : [],
        scheduleId: primarySchedule?.id || null,
        dayOfWeek: primarySchedule?.day_of_week || null,
        startTime: primarySchedule?.start_time || null,
        endTime: primarySchedule?.end_time || null,
        amount: Number(totalPrice),
        paymentMethod: 'pix',
        enrollmentDate: new Date().toISOString()
      };
      
      console.log(`\n======================================================`);
      console.log(`[ENROLLMENT REQUEST] Initiating at: ${new Date().toISOString()}`);
      console.log(`[ENROLLMENT REQUEST] URL: /enrollments`);
      console.log(`[ENROLLMENT REQUEST] Payload:\n${JSON.stringify(requestBody, null, 2)}`);
      console.log(`======================================================\n`);

      const response = await apiServerClient.fetch('/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      let enrollmentResponse;
      try {
        enrollmentResponse = await response.json();
      } catch (parseError) {
        console.error('[ENROLLMENT ERROR] Failed to parse response JSON:', parseError);
        enrollmentResponse = { error: 'O servidor retornou uma resposta inválida.' };
      }

      // ============================================
      // COMPREHENSIVE RESPONSE LOGGING
      // ============================================
      console.log('\n======================================================');
      console.log('[ENROLLMENT RESPONSE] Complete Response Object:');
      console.log('======================================================');
      console.log('Enrollment Response:', enrollmentResponse);
      console.log('\n--- Payment-Related Fields ---');
      console.log('paymentId:', enrollmentResponse.paymentId);
      console.log('preferenceId:', enrollmentResponse.preferenceId);
      console.log('payment_id:', enrollmentResponse.payment_id);
      console.log('payment_status:', enrollmentResponse.payment_status);
      console.log('amount:', enrollmentResponse.amount);
      console.log('total_amount:', enrollmentResponse.total_amount);
      console.log('initPoint:', enrollmentResponse.initPoint);
      console.log('sandboxInitPoint:', enrollmentResponse.sandboxInitPoint);
      console.log('\n--- Enrollment Fields ---');
      console.log('enrollmentId:', enrollmentResponse.enrollmentId);
      console.log('success:', enrollmentResponse.success);
      console.log('message:', enrollmentResponse.message);
      console.log('enrollmentType:', enrollmentResponse.enrollmentType);
      console.log('lessonType:', enrollmentResponse.lessonType);
      console.log('studentName:', enrollmentResponse.studentName);
      console.log('studentEmail:', enrollmentResponse.studentEmail);
      console.log('dayOfWeek:', enrollmentResponse.dayOfWeek);
      console.log('startTime:', enrollmentResponse.startTime);
      console.log('endTime:', enrollmentResponse.endTime);
      console.log('\n--- Server Logs ---');
      console.log('Total logs received:', enrollmentResponse.logs?.length || 0);
      console.log('======================================================\n');

      // Check for missing payment data
      const missingPaymentFields = [];
      if (!enrollmentResponse.paymentId) missingPaymentFields.push('paymentId');
      if (!enrollmentResponse.preferenceId) missingPaymentFields.push('preferenceId');
      if (!enrollmentResponse.payment_id) missingPaymentFields.push('payment_id');
      if (!enrollmentResponse.payment_status) missingPaymentFields.push('payment_status');
      if (!enrollmentResponse.initPoint) missingPaymentFields.push('initPoint');

      if (missingPaymentFields.length > 0) {
        console.warn('\n⚠️ WARNING: Missing payment fields in response:', missingPaymentFields);
        toast.error(`Dados de pagamento incompletos: ${missingPaymentFields.join(', ')}`);
      }

      // Process and display server logs if present
      if (enrollmentResponse && enrollmentResponse.logs && Array.isArray(enrollmentResponse.logs)) {
        console.group('[SERVER LOGS - Enrollment Process]');
        enrollmentResponse.logs.forEach((log, index) => {
          const logMsg = `[${log.timestamp}] Passo ${index + 1} - ${log.step}: ${log.description || log.message || ''}`;
          if (log.isError) {
            console.error(logMsg, log.data ? '\nDetalhes:' : '', log.data || '');
          } else {
            console.log(logMsg, log.data ? '\nDetalhes:' : '', log.data || '');
          }
        });
        console.groupEnd();
      }

      if (!response.ok) {
        const errorMsg = enrollmentResponse.error || enrollmentResponse.message || `Erro no servidor (Status ${response.status})`;
        
        console.error(`\n======================================================`);
        console.error(`[ENROLLMENT ERROR] Failed at: ${new Date().toISOString()}`);
        console.error(`[ENROLLMENT ERROR] HTTP Status: ${response.status} ${response.statusText}`);
        console.error(`[ENROLLMENT ERROR] Response Headers:`, Object.fromEntries([...response.headers.entries()]));
        console.error(`[ENROLLMENT ERROR] Response Body:\n${JSON.stringify(enrollmentResponse, null, 2)}`);
        console.error(`[ENROLLMENT ERROR] Request Payload that caused error:\n${JSON.stringify(requestBody, null, 2)}`);
        console.error(`======================================================\n`);
        
        throw new Error(errorMsg);
      }

      console.log(`\n======================================================`);
      console.log(`[ENROLLMENT RESPONSE] Success at: ${new Date().toISOString()}`);
      console.log(`[ENROLLMENT RESPONSE] HTTP Status: ${response.status}`);
      console.log(`[ENROLLMENT RESPONSE] Data:\n${JSON.stringify(enrollmentResponse, null, 2)}`);
      console.log(`======================================================\n`);

      setCreatedEnrollmentId(enrollmentResponse.enrollmentId);
      setPaymentModalOpen(true);
      
    } catch (error) {
      console.error(`\n======================================================`);
      console.error(`[ENROLLMENT EXCEPTION] Caught exception during process`);
      console.error(`[ENROLLMENT EXCEPTION] Error name: ${error.name}`);
      console.error(`[ENROLLMENT EXCEPTION] Error message: ${error.message}`);
      console.error(`[ENROLLMENT EXCEPTION] Stack trace:\n${error.stack}`);
      console.error(`======================================================\n`);
      
      toast.error(error.message || 'Falha ao criar matrícula. Verifique as informações e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center w-full px-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Carregando perfil do professor...</p>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center w-full">
        <div className="bg-card p-8 rounded-3xl border border-border shadow-lg max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-destructive mb-3">Perfil Indisponível</h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">{error}</p>
          <Button onClick={() => navigate('/')} className="w-full">
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${teacher.name}`}</title>
        <meta name="description" content={teacher.professional_description || `Agende aulas com ${teacher.name}`} />
      </Helmet>

      <div className="min-h-screen bg-background pb-24 w-full">
        <TeacherBanner teacher={teacher} />

        <div className="w-full px-4 sm:px-6 lg:px-8 mt-8">
          
          {teacher.instagram_username && (
            <InstagramFeedSection username={teacher.instagram_username} />
          )}

          <div className="mb-12 max-w-7xl mx-auto" ref={formRef}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Finalizar Matrícula</h2>
                <p className="text-muted-foreground mt-1">Preencha o formulário e selecione o plano de aulas.</p>
              </div>
              
              <Tabs value={enrollmentType} onValueChange={handleTypeChange} className="w-full md:w-auto">
                <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 border border-border h-auto rounded-xl">
                  <TabsTrigger value="semanal" className="py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Plano Mensal</TabsTrigger>
                  <TabsTrigger value="avulso" className="py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Aulas Avulsas</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {enrollmentType === 'semanal' && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  Selecione os dias da semana desejados:
                </h3>
                <AvailableSchedulesGrid 
                  schedules={schedules} 
                  selectedSchedules={selectedSchedules} 
                  onToggleSchedule={handleToggleSchedule}
                  isRequired={hasAttemptedSubmit}
                />
              </div>
            )}

            {enrollmentType === 'avulso' && (
              <div className="mb-8 p-6 bg-card border border-border rounded-2xl max-w-md">
                <Label className="text-base font-semibold mb-3 block">Quantidade de Aulas</Label>
                <div className="flex items-center gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    className="w-12 h-12 rounded-full shadow-sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="text-2xl font-bold w-12 text-center text-foreground">{quantity}</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    className="w-12 h-12 rounded-full shadow-sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  O valor de 1 aula avulsa é {formatCurrency(teacher.single_lesson_price || 0)}.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-8 bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm max-w-7xl mx-auto">
            <EnrollmentForm 
              formData={formData} 
              setFormData={setFormData}
              serviceAreas={serviceAreas}
              onCepValidation={setCepValid}
              selectedSchedules={selectedSchedules}
              enrollmentType={enrollmentType}
              totalPrice={totalPrice}
              quantity={quantity}
            />

            <MandatoryCheckboxes 
              agreements={agreements}
              setAgreements={setAgreements}
              onOpenTerms={() => setTermsModalOpen(true)}
              termsExist={!!terms}
              hasAttemptedSubmit={hasAttemptedSubmit}
            />

            <div className="pt-8 border-t border-border mt-8 flex justify-end">
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-8 py-6 text-lg font-bold shadow-md transition-all active:scale-[0.98]"
                onClick={handleInitiatePayment}
                disabled={isSubmitting || (enrollmentType === 'semanal' && selectedSchedules.length === 0) || !totalPrice || totalPrice <= 0}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processando...</>
                ) : (
                  <><ArrowRight className="w-5 h-5 mr-2" /> Continuar para Pagamento</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <TermsModal 
        open={termsModalOpen} 
        onOpenChange={setTermsModalOpen} 
        terms={terms} 
      />

      {createdEnrollmentId && (
        <EnrollmentPaymentForm
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          totalAmount={totalPrice}
          studentName={`${formData.first_name} ${formData.last_name}`}
          studentEmail={formData.email}
          studentPhone={`${formData.area_code}${formData.phone_number}`}
          teacherName={teacher.name}
          enrollmentType={enrollmentType}
          quantity={enrollmentType === 'avulso' ? quantity : selectedSchedules.length}
          enrollmentId={createdEnrollmentId}
        />
      )}
    </>
  );
};

export default PublicTeacherProfile;