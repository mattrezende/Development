import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, AlertCircle, ShoppingCart } from 'lucide-react';
import { statusToPtBR, formatCurrency } from '@/lib/i18n';

const EnrollmentForm = ({ 
  formData, 
  setFormData, 
  serviceAreas, 
  onCepValidation, 
  selectedSchedules, 
  enrollmentType, 
  totalPrice,
  quantity
}) => {
  const [zipCodeError, setZipCodeError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .substring(0, 14);
  };

  const formatZipCode = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .substring(0, 9);
  };

  const formatAreaCode = (value) => {
    return value.replace(/\D/g, '').substring(0, 2);
  };

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{4})(\d{0,4})/, '$1-$2').trim();
    }
    return numbers.replace(/(\d{5})(\d{0,4})/, '$1-$2').trim().substring(0, 10);
  };

  const formatState = (value) => {
    return value.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 2);
  };

  const validateZipCode = (zipCode) => {
    const cleanZipCode = parseInt(zipCode.replace(/\D/g, ''), 10);
    
    if (isNaN(cleanZipCode) || cleanZipCode.toString().length < 8) {
      setZipCodeError(false);
      onCepValidation(null);
      return;
    }

    if (!serviceAreas || serviceAreas.length === 0) {
      setZipCodeError(false);
      onCepValidation(true);
      return;
    }

    const isValid = serviceAreas.some(area => {
      const start = parseInt(area.cep_range_start.replace(/\D/g, ''), 10);
      const end = parseInt(area.cep_range_end.replace(/\D/g, ''), 10);
      return cleanZipCode >= start && cleanZipCode <= end;
    });

    setZipCodeError(!isValid);
    onCepValidation(isValid);
  };

  const validateField = (field, value) => {
    const newErrors = { ...fieldErrors };

    switch (field) {
      case 'cpf':
        const cleanedCPF = value.replace(/\D/g, '');
        if (cleanedCPF.length !== 11) {
          newErrors.cpf = 'CPF deve ter 11 dígitos';
        } else {
          delete newErrors.cpf;
        }
        break;
      case 'area_code':
        const cleanedAreaCode = value.replace(/\D/g, '');
        if (cleanedAreaCode.length !== 2) {
          newErrors.area_code = 'DDD deve ter 2 dígitos';
        } else {
          delete newErrors.area_code;
        }
        break;
      case 'phone_number':
        const cleanedPhone = value.replace(/\D/g, '');
        if (cleanedPhone.length < 8 || cleanedPhone.length > 9) {
          newErrors.phone_number = 'Telefone deve ter 8 ou 9 dígitos';
        } else {
          delete newErrors.phone_number;
        }
        break;
      case 'state':
        if (value && !/^[A-Z]{2}$/.test(value)) {
          newErrors.state = 'Estado deve ter 2 letras maiúsculas (ex: SP)';
        } else {
          delete newErrors.state;
        }
        break;
      case 'zip_code':
        if (value) {
          const cleanedZip = value.replace(/\D/g, '');
          if (cleanedZip.length !== 8) {
            newErrors.zip_code = 'CEP deve ter 8 dígitos';
          } else {
            delete newErrors.zip_code;
          }
        } else {
          delete newErrors.zip_code;
        }
        break;
      default:
        break;
    }

    setFieldErrors(newErrors);
  };

  const handleZipCodeChange = (e) => {
    const newZipCode = formatZipCode(e.target.value);
    setFormData({ ...formData, zip_code: newZipCode });
    if (newZipCode.length === 9) {
      validateZipCode(newZipCode);
      validateField('zip_code', newZipCode);
    } else {
      setZipCodeError(false);
      onCepValidation(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Resumo da Matrícula */}
      <div className="bg-primary/5 p-5 sm:p-6 rounded-2xl border border-primary/20 shadow-sm">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-foreground">
          <ShoppingCart className="w-5 h-5 text-primary" /> Resumo da Matrícula
        </h3>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Plano Selecionado</p>
            <p className="font-bold text-foreground text-lg">{enrollmentType === 'avulso' ? 'Aulas Avulsas' : 'Plano Mensal'}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Quantidade</p>
            <p className="font-bold text-foreground text-lg">
              {enrollmentType === 'avulso' ? `${quantity} aula(s)` : `${selectedSchedules.length}x na semana`}
            </p>
          </div>
        </div>
        
        {enrollmentType === 'semanal' ? (
          <div className="mb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Horários Escolhidos</p>
            {selectedSchedules.length === 0 ? (
              <p className="text-sm text-destructive font-medium">Nenhum horário selecionado. Selecione acima para ver o valor.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedSchedules.map(s => (
                  <span key={s.id} className="bg-background text-sm font-medium px-3 py-1.5 rounded-lg border border-border shadow-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                    {statusToPtBR[s.day_of_week]} • {s.start_time}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              No plano mensal, o valor é cobrado mensalmente referente aos dias escolhidos na semana.
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Para aulas avulsas, o professor entrará em contato para agendar o melhor horário após a confirmação do pagamento.
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <span className="font-bold text-foreground text-lg">Total a pagar:</span>
          <span className="text-3xl font-extrabold text-primary">
            {totalPrice !== null && totalPrice > 0 ? (
              formatCurrency(totalPrice)
            ) : (
              <span className="text-sm font-medium text-destructive">Preço indisponível</span>
            )}
          </span>
        </div>
      </div>

      {/* Dados Pessoais */}
      <div className="space-y-6">
        <h3 className="font-semibold text-lg text-foreground border-b border-border pb-2">Dados Pessoais</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="text-foreground">Nome *</Label>
            <Input
              id="first_name"
              required
              placeholder="Ex: João"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="bg-background text-foreground shadow-sm"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last_name" className="text-foreground">Sobrenome *</Label>
            <Input
              id="last_name"
              required
              placeholder="Ex: da Silva"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="bg-background text-foreground shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email *</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="joao@exemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-background text-foreground shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-foreground">CPF *</Label>
            <Input
              id="cpf"
              required
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={(e) => {
                const formatted = formatCPF(e.target.value);
                setFormData({ ...formData, cpf: formatted });
              }}
              onBlur={(e) => validateField('cpf', e.target.value)}
              maxLength={14}
              className={`bg-background text-foreground shadow-sm ${fieldErrors.cpf ? 'border-destructive ring-1 ring-destructive' : ''}`}
            />
            {fieldErrors.cpf && (
              <p className="text-sm text-destructive font-medium flex items-center gap-1.5 mt-1.5">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.cpf}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="area_code" className="text-foreground">DDD *</Label>
            <Input
              id="area_code"
              required
              placeholder="11"
              value={formData.area_code}
              onChange={(e) => {
                const formatted = formatAreaCode(e.target.value);
                setFormData({ ...formData, area_code: formatted });
              }}
              onBlur={(e) => validateField('area_code', e.target.value)}
              maxLength={2}
              className={`bg-background text-foreground shadow-sm ${fieldErrors.area_code ? 'border-destructive ring-1 ring-destructive' : ''}`}
            />
            {fieldErrors.area_code && (
              <p className="text-sm text-destructive font-medium flex items-center gap-1.5 mt-1.5">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.area_code}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number" className="text-foreground">Telefone (WhatsApp) *</Label>
            <Input
              id="phone_number"
              type="tel"
              required
              placeholder="99999-9999"
              value={formData.phone_number}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                setFormData({ ...formData, phone_number: formatted });
              }}
              onBlur={(e) => validateField('phone_number', e.target.value)}
              maxLength={10}
              className={`bg-background text-foreground shadow-sm ${fieldErrors.phone_number ? 'border-destructive ring-1 ring-destructive' : ''}`}
            />
            {fieldErrors.phone_number && (
              <p className="text-sm text-destructive font-medium flex items-center gap-1.5 mt-1.5">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.phone_number}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="space-y-6">
        <h3 className="font-semibold text-lg text-foreground border-b border-border pb-2">Endereço</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="zip_code" className="text-foreground">CEP</Label>
            <div className="relative">
              <Input
                id="zip_code"
                placeholder="00000-000"
                value={formData.zip_code}
                onChange={handleZipCodeChange}
                onBlur={() => {
                  validateZipCode(formData.zip_code);
                  validateField('zip_code', formData.zip_code);
                }}
                maxLength={9}
                className={`bg-background text-foreground shadow-sm pl-10 ${zipCodeError || fieldErrors.zip_code ? 'border-destructive ring-1 ring-destructive' : ''}`}
              />
              <MapPin className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {zipCodeError && (
              <p className="text-sm text-destructive font-medium flex items-center gap-1.5 mt-1.5">
                <AlertCircle className="w-4 h-4" />
                Este professor não atende na sua região.
              </p>
            )}
            {fieldErrors.zip_code && !zipCodeError && (
              <p className="text-sm text-destructive font-medium flex items-center gap-1.5 mt-1.5">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.zip_code}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="street" className="text-foreground">Rua</Label>
            <Input
              id="street"
              placeholder="Rua das Flores"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="bg-background text-foreground shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="street_number" className="text-foreground">Número</Label>
            <Input
              id="street_number"
              placeholder="123"
              value={formData.street_number}
              onChange={(e) => setFormData({ ...formData, street_number: e.target.value })}
              className="bg-background text-foreground shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood" className="text-foreground">Bairro</Label>
            <Input
              id="neighborhood"
              placeholder="Centro"
              value={formData.neighborhood}
              onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              className="bg-background text-foreground shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-foreground">Cidade</Label>
            <Input
              id="city"
              placeholder="São Paulo"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="bg-background text-foreground shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state" className="text-foreground">Estado</Label>
            <Input
              id="state"
              placeholder="SP"
              value={formData.state}
              onChange={(e) => {
                const formatted = formatState(e.target.value);
                setFormData({ ...formData, state: formatted });
              }}
              onBlur={(e) => validateField('state', e.target.value)}
              maxLength={2}
              className={`bg-background text-foreground shadow-sm ${fieldErrors.state ? 'border-destructive ring-1 ring-destructive' : ''}`}
            />
            {fieldErrors.state && (
              <p className="text-sm text-destructive font-medium flex items-center gap-1.5 mt-1.5">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.state}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentForm;