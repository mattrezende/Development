import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiServerClient } from '../../lib/apiServerClient';
import { useForm } from 'react-hook-form';

const EnrollmentPaymentForm = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      console.log('========== ENROLLMENT FORM SUBMISSION START ==========');
      console.log('Form data being sent to backend:', data);

      const response = await apiServerClient.fetch('/enrollments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response received from backend:', response);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend returned error response:', errorData);
        setSubmitError(errorData.error || 'Erro ao processar matrícula');
        setIsLoading(false);
        return;
      }

      const responseData = await response.json();

      console.log('========== RESPONSE DATA RECEIVED FROM BACKEND ==========');
      console.log('Full response object:', responseData);
      console.log('Response keys:', Object.keys(responseData));
      console.log('Response size:', JSON.stringify(responseData).length, 'bytes');

      // Check for all required fields
      const requiredFields = [
        'success',
        'message',
        'enrollmentId',
        'paymentId',
        'preferenceId',
        'payment_id',
        'payment_status',
        'initPoint',
        'sandboxInitPoint',
        'studentName',
        'studentEmail',
        'amount',
        'enrollmentType',
        'lessonType',
        'dayOfWeek',
        'startTime',
        'endTime',
      ];

      console.log('========== FIELD VALIDATION ==========');
      const missingFields = [];
      const presentFields = [];

      requiredFields.forEach((field) => {
        if (responseData.hasOwnProperty(field)) {
          presentFields.push(field);
          console.log(`✓ Field present: ${field} = ${JSON.stringify(responseData[field])}`);
        } else {
          missingFields.push(field);
          console.error(`✗ Field MISSING: ${field}`);
        }
      });

      console.log('========== FIELD SUMMARY ==========');
      console.log(`Present fields (${presentFields.length}):`, presentFields);
      console.log(`Missing fields (${missingFields.length}):`, missingFields);

      if (missingFields.length > 0) {
        console.error(
          'WARNING: Response is missing required fields. This may cause payment redirect to fail.',
          missingFields
        );
      }

      // Log payment-related fields specifically
      console.log('========== PAYMENT FIELDS ==========');
      console.log('paymentId:', responseData.paymentId);
      console.log('preferenceId:', responseData.preferenceId);
      console.log('payment_id:', responseData.payment_id);
      console.log('payment_status:', responseData.payment_status);
      console.log('initPoint:', responseData.initPoint);
      console.log('sandboxInitPoint:', responseData.sandboxInitPoint);

      // Verify payment URLs are valid
      if (responseData.initPoint) {
        console.log('initPoint is valid URL:', typeof responseData.initPoint === 'string' && responseData.initPoint.startsWith('http'));
      }
      if (responseData.sandboxInitPoint) {
        console.log('sandboxInitPoint is valid URL:', typeof responseData.sandboxInitPoint === 'string' && responseData.sandboxInitPoint.startsWith('http'));
      }

      console.log('========== ENROLLMENT FIELDS ==========');
      console.log('enrollmentId:', responseData.enrollmentId);
      console.log('studentName:', responseData.studentName);
      console.log('studentEmail:', responseData.studentEmail);
      console.log('amount:', responseData.amount);
      console.log('enrollmentType:', responseData.enrollmentType);
      console.log('lessonType:', responseData.lessonType);
      console.log('dayOfWeek:', responseData.dayOfWeek);
      console.log('startTime:', responseData.startTime);
      console.log('endTime:', responseData.endTime);

      console.log('========== RESPONSE VALIDATION COMPLETE ==========');

      if (!responseData.success) {
        console.error('Response success flag is false');
        setSubmitError('Erro ao processar matrícula');
        setIsLoading(false);
        return;
      }

      // Determine which payment URL to use (prefer initPoint, fallback to sandboxInitPoint)
      const paymentUrl = responseData.initPoint || responseData.sandboxInitPoint;

      if (!paymentUrl) {
        console.error('No payment URL available (both initPoint and sandboxInitPoint are missing)');
        setSubmitError('Erro ao obter URL de pagamento');
        setIsLoading(false);
        return;
      }

      console.log('========== REDIRECTING TO PAYMENT ==========');
      console.log('Payment URL:', paymentUrl);
      console.log('Enrollment ID:', responseData.enrollmentId);

      // Store enrollment data in sessionStorage for reference
      sessionStorage.setItem(
        'currentEnrollment',
        JSON.stringify({
          enrollmentId: responseData.enrollmentId,
          paymentId: responseData.paymentId,
          studentName: responseData.studentName,
          studentEmail: responseData.studentEmail,
        })
      );

      // Redirect to Mercado Pago payment page
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('========== ERROR DURING ENROLLMENT ==========');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', error);
      setSubmitError(error.message || 'Erro ao processar matrícula');
      setIsLoading(false);
    }
  };

  return (
    <div className="enrollment-payment-form">
      <h2>Matrícula e Pagamento</h2>
      {submitError && <div className="error-message">{submitError}</div>}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Teacher Information */}
        <fieldset>
          <legend>Informações do Professor</legend>
          <div className="form-group">
            <label htmlFor="teacherId">ID do Professor *</label>
            <input
              id="teacherId"
              type="text"
              {...register('teacherId', { required: 'ID do professor é obrigatório' })}
              placeholder="ID do professor"
            />
            {errors.teacherId && <span className="error">{errors.teacherId.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="teacherName">Nome do Professor *</label>
            <input
              id="teacherName"
              type="text"
              {...register('teacherName', { required: 'Nome do professor é obrigatório' })}
              placeholder="Nome do professor"
            />
            {errors.teacherName && <span className="error">{errors.teacherName.message}</span>}
          </div>
        </fieldset>

        {/* Student Information */}
        <fieldset>
          <legend>Informações do Aluno</legend>
          <div className="form-group">
            <label htmlFor="firstName">Nome *</label>
            <input
              id="firstName"
              type="text"
              {...register('studentData.firstName', { required: 'Nome é obrigatório' })}
              placeholder="Nome"
            />
            {errors.studentData?.firstName && <span className="error">{errors.studentData.firstName.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Sobrenome *</label>
            <input
              id="lastName"
              type="text"
              {...register('studentData.lastName', { required: 'Sobrenome é obrigatório' })}
              placeholder="Sobrenome"
            />
            {errors.studentData?.lastName && <span className="error">{errors.studentData.lastName.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              {...register('studentData.email', { required: 'Email é obrigatório' })}
              placeholder="Email"
            />
            {errors.studentData?.email && <span className="error">{errors.studentData.email.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="cpf">CPF *</label>
            <input
              id="cpf"
              type="text"
              {...register('studentData.cpf', { required: 'CPF é obrigatório' })}
              placeholder="000.000.000-00"
            />
            {errors.studentData?.cpf && <span className="error">{errors.studentData.cpf.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="documentType">Tipo de Documento *</label>
            <select
              id="documentType"
              {...register('studentData.documentType', { required: 'Tipo de documento é obrigatório' })}
            >
              <option value="">Selecione...</option>
              <option value="CPF">CPF</option>
              <option value="RG">RG</option>
            </select>
            {errors.studentData?.documentType && <span className="error">{errors.studentData.documentType.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="areaCode">DDD *</label>
            <input
              id="areaCode"
              type="text"
              {...register('studentData.areaCode', { required: 'DDD é obrigatório' })}
              placeholder="11"
              maxLength="2"
            />
            {errors.studentData?.areaCode && <span className="error">{errors.studentData.areaCode.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Telefone *</label>
            <input
              id="phoneNumber"
              type="text"
              {...register('studentData.phoneNumber', { required: 'Telefone é obrigatório' })}
              placeholder="99999-9999"
            />
            {errors.studentData?.phoneNumber && <span className="error">{errors.studentData.phoneNumber.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="zipCode">CEP</label>
            <input
              id="zipCode"
              type="text"
              {...register('studentData.zipCode')}
              placeholder="00000-000"
            />
            {errors.studentData?.zipCode && <span className="error">{errors.studentData.zipCode.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="street">Rua</label>
            <input
              id="street"
              type="text"
              {...register('studentData.street')}
              placeholder="Rua"
            />
            {errors.studentData?.street && <span className="error">{errors.studentData.street.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="streetNumber">Número</label>
            <input
              id="streetNumber"
              type="text"
              {...register('studentData.streetNumber')}
              placeholder="Número"
            />
            {errors.studentData?.streetNumber && <span className="error">{errors.studentData.streetNumber.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="neighborhood">Bairro</label>
            <input
              id="neighborhood"
              type="text"
              {...register('studentData.neighborhood')}
              placeholder="Bairro"
            />
            {errors.studentData?.neighborhood && <span className="error">{errors.studentData.neighborhood.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="city">Cidade</label>
            <input
              id="city"
              type="text"
              {...register('studentData.city')}
              placeholder="Cidade"
            />
            {errors.studentData?.city && <span className="error">{errors.studentData.city.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="state">Estado</label>
            <input
              id="state"
              type="text"
              {...register('studentData.state')}
              placeholder="SP"
              maxLength="2"
            />
            {errors.studentData?.state && <span className="error">{errors.studentData.state.message}</span>}
          </div>
        </fieldset>

        {/* Lesson Information */}
        <fieldset>
          <legend>Informações da Aula</legend>
          <div className="form-group">
            <label htmlFor="enrollmentType">Tipo de Plano *</label>
            <select
              id="enrollmentType"
              {...register('enrollmentType', { required: 'Tipo de plano é obrigatório' })}
            >
              <option value="">Selecione...</option>
              <option value="semanal">Semanal</option>
              <option value="avulso">Avulso</option>
            </select>
            {errors.enrollmentType && <span className="error">{errors.enrollmentType.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="lessonType">Tipo de Aula *</label>
            <select
              id="lessonType"
              {...register('lessonType', { required: 'Tipo de aula é obrigatório' })}
            >
              <option value="">Selecione...</option>
              <option value="weekly">Semanal</option>
              <option value="single">Única</option>
            </select>
            {errors.lessonType && <span className="error">{errors.lessonType.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="dayOfWeek">Dia da Semana *</label>
            <select
              id="dayOfWeek"
              {...register('dayOfWeek', { required: 'Dia da semana é obrigatório' })}
            >
              <option value="">Selecione...</option>
              <option value="Segunda">Segunda</option>
              <option value="Terça">Terça</option>
              <option value="Quarta">Quarta</option>
              <option value="Quinta">Quinta</option>
              <option value="Sexta">Sexta</option>
              <option value="Sábado">Sábado</option>
              <option value="Domingo">Domingo</option>
            </select>
            {errors.dayOfWeek && <span className="error">{errors.dayOfWeek.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="startTime">Hora de Início *</label>
            <input
              id="startTime"
              type="time"
              {...register('startTime', { required: 'Hora de início é obrigatória' })}
            />
            {errors.startTime && <span className="error">{errors.startTime.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="endTime">Hora de Término *</label>
            <input
              id="endTime"
              type="time"
              {...register('endTime', { required: 'Hora de término é obrigatória' })}
            />
            {errors.endTime && <span className="error">{errors.endTime.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="scheduleId">ID do Horário *</label>
            <input
              id="scheduleId"
              type="text"
              {...register('scheduleId', { required: 'ID do horário é obrigatório' })}
              placeholder="ID do horário"
            />
            {errors.scheduleId && <span className="error">{errors.scheduleId.message}</span>}
          </div>
        </fieldset>

        {/* Payment Information */}
        <fieldset>
          <legend>Informações de Pagamento</legend>
          <div className="form-group">
            <label htmlFor="amount">Valor Total (R$) *</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount', {
                required: 'Valor é obrigatório',
                valueAsNumber: true,
                min: { value: 0.01, message: 'Valor deve ser maior que zero' },
              })}
              placeholder="0.00"
            />
            {errors.amount && <span className="error">{errors.amount.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="paymentMethod">Método de Pagamento</label>
            <select id="paymentMethod" {...register('paymentMethod')}>
              <option value="pix">PIX</option>
              <option value="credit_card">Cartão de Crédito</option>
              <option value="debit_card">Cartão de Débito</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Quantidade</label>
            <input
              id="quantity"
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              placeholder="1"
              defaultValue="1"
            />
            {errors.quantity && <span className="error">{errors.quantity.message}</span>}
          </div>
        </fieldset>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Processando...' : 'Prosseguir para Pagamento'}
        </button>
      </form>
    </div>
  );
};

export default EnrollmentPaymentForm;