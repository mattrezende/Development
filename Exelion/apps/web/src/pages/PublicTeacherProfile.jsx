import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import apiClient from '@/lib/apiClient';
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
  const [paymentInitPoint, setPaymentInitPoint] = useState(null);

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
      
      const { schedules } = await apiClient.get(`/public/teachers/${teacherId}/schedules`);

      setSchedules(schedules.filter((s) => s.availabilityStatus === 'Disponível'));
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

      const { teacher: teacherData } = await apiClient.get(`/public/teachers/${teacherId}`);
      setTeacher(teacherData);

      try {
        const { serviceAreas: areasData } = await apiClient.get(`/public/teachers/${teacherId}/service-areas`);
        setServiceAreas(areasData);
      } catch (areaError) {
        setServiceAreas([]);
      }

      try {
        const { terms: termsData } = await apiClient.get(`/public/teachers/${teacherId}/terms`);
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
        const singlePrice = teacher?.singleLessonPrice || 0;
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
          cpf: formData.cpf.replace(/\D/g, ''),
          documentType: formData.document_type,
          areaCode: formData.area_code.replace(/\D/g, ''),
          phoneNumber: formData.phone_number.replace(/\D/g, ''),
          zipCode: formData.zip_code ? formData.zip_code.replace(/\D/g, '') : undefined,
          street: formData.street,
          streetNumber: formData.street_number,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
        },
        lessonType: enrollmentType === 'semanal' ? 'weekly' : 'single',
        enrollmentType,
        quantity: enrollmentType === 'semanal' ? selectedSchedules.length : quantity,
        scheduleId: primarySchedule?.id || null,
        dayOfWeek: primarySchedule?.dayOfWeek || null,
        startTime: primarySchedule?.startTime || null,
        endTime: primarySchedule?.endTime || null,
        amount: Number(totalPrice),
        paymentMethod: 'pix',
      };

      const enrollmentResponse = await apiClient.post('/mercado-pago/create-preference', requestBody);

      setCreatedEnrollmentId(enrollmentResponse.enrollmentId);
      setPaymentInitPoint(enrollmentResponse.initPoint);
      setPaymentModalOpen(true);

    } catch (error) {
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
          initPoint={paymentInitPoint}
        />
      )}
    </>
  );
};

export default PublicTeacherProfile;