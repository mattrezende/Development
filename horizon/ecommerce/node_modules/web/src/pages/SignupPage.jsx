
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin, User, Shield, Phone, CreditCard } from 'lucide-react';
import { 
  validateCPF, validateCEP, validateWhatsApp, validateEmail, 
  validatePassword, validatePasswordMatch,
  formatCPF, formatCEP, formatWhatsApp 
} from '@/lib/validationUtils';
import { useCEPLookup } from '@/hooks/useCEPLookup';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    social_name: '',
    gender: '',
    birth_date: '',
    cpf: '',
    cep: '',
    address: '',
    number: '',
    whatsapp: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchAddress, loading: cepLoading } = useCEPLookup();

  const handleChange = (e) => {
    const { id, value } = e.target;
    let formattedValue = value;

    // Apply formatting
    if (id === 'cpf') formattedValue = formatCPF(value);
    if (id === 'cep') formattedValue = formatCEP(value);
    if (id === 'whatsapp') formattedValue = formatWhatsApp(value);

    setFormData(prev => ({ ...prev, [id]: formattedValue }));
    
    // Clear error when typing
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, gender: value }));
    if (errors.gender) setErrors(prev => ({ ...prev, gender: null }));
  };

  const handleCepBlur = async () => {
    if (!formData.cep) return;
    
    if (!validateCEP(formData.cep)) {
      setErrors(prev => ({ ...prev, cep: 'CEP inválido' }));
      return;
    }

    const addressData = await fetchAddress(formData.cep);
    if (addressData) {
      setFormData(prev => ({
        ...prev,
        address: `${addressData.address}${addressData.neighborhood ? `, ${addressData.neighborhood}` : ''} - ${addressData.city}/${addressData.state}`
      }));
      if (errors.address) setErrors(prev => ({ ...prev, address: null }));
    } else {
      setErrors(prev => ({ ...prev, cep: 'CEP não encontrado' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) newErrors.full_name = 'Nome completo é obrigatório';
    if (!formData.birth_date) newErrors.birth_date = 'Data de nascimento é obrigatória';
    
    if (!formData.cpf) newErrors.cpf = 'CPF é obrigatório';
    else if (!validateCPF(formData.cpf)) newErrors.cpf = 'CPF inválido';
    
    if (!formData.cep) newErrors.cep = 'CEP é obrigatório';
    else if (!validateCEP(formData.cep)) newErrors.cep = 'CEP inválido';
    
    if (!formData.address.trim()) newErrors.address = 'Endereço é obrigatório';
    if (!formData.number.trim()) newErrors.number = 'Número é obrigatório';
    
    if (!formData.whatsapp) newErrors.whatsapp = 'WhatsApp é obrigatório';
    else if (!validateWhatsApp(formData.whatsapp)) newErrors.whatsapp = 'WhatsApp inválido';
    
    if (!formData.email) newErrors.email = 'E-mail é obrigatório';
    else if (!validateEmail(formData.email)) newErrors.email = 'E-mail inválido';
    
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    else if (!validatePassword(formData.password)) newErrors.password = 'A senha deve ter no mínimo 8 caracteres';
    
    if (!formData.passwordConfirm) newErrors.passwordConfirm = 'Confirmação de senha é obrigatória';
    else if (!validatePasswordMatch(formData.password, formData.passwordConfirm)) newErrors.passwordConfirm = 'As senhas não coincidem';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({ 
        variant: "destructive", 
        title: "Erro de validação", 
        description: "Por favor, corrija os erros no formulário antes de continuar." 
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Clean formatting before sending to DB
      const cleanData = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''),
        cep: formData.cep.replace(/\D/g, ''),
        whatsapp: formData.whatsapp.replace(/\D/g, ''),
        name: formData.full_name, // Map full_name to standard name field as well
        emailVisibility: true,
        role: 'client'
      };

      await pb.collection('users').create(cleanData, { $autoCancel: false });
      
      toast({ 
        title: "Conta criada com sucesso!", 
        description: "Você já pode fazer login no sistema." 
      });
      navigate('/login');
    } catch (error) {
      console.error("Signup error:", error);
      let errorMsg = "Ocorreu um erro ao criar sua conta. Tente novamente.";
      
      // Handle specific PocketBase errors
      if (error.response?.data?.email?.code === 'validation_invalid_email') {
        errorMsg = "Este e-mail já está em uso ou é inválido.";
        setErrors(prev => ({ ...prev, email: 'E-mail já em uso' }));
      } else if (error.response?.data?.cpf?.code === 'validation_not_unique') {
        errorMsg = "Este CPF já está cadastrado no sistema.";
        setErrors(prev => ({ ...prev, cpf: 'CPF já cadastrado' }));
      }
      
      toast({ 
        variant: "destructive", 
        title: "Erro ao cadastrar", 
        description: errorMsg 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
      <Card className="w-full max-w-3xl shadow-xl border-muted/50">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-base">
            Preencha seus dados para se cadastrar em nossa plataforma
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            
            {/* Personal Info Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-primary border-b pb-2">
                <User className="w-5 h-5" />
                <h3>Dados Pessoais</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className={errors.full_name ? "text-destructive" : ""}>Nome Completo *</Label>
                  <Input 
                    id="full_name" 
                    placeholder="João da Silva" 
                    value={formData.full_name}
                    onChange={handleChange}
                    className={errors.full_name ? "border-destructive focus-visible:ring-destructive" : "bg-background"}
                  />
                  {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_name">Nome Social (Opcional)</Label>
                  <Input 
                    id="social_name" 
                    placeholder="Como prefere ser chamado" 
                    value={formData.social_name}
                    onChange={handleChange}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_date" className={errors.birth_date ? "text-destructive" : ""}>Data de Nascimento *</Label>
                  <Input 
                    id="birth_date" 
                    type="date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    className={errors.birth_date ? "border-destructive focus-visible:ring-destructive" : "bg-background"}
                  />
                  {errors.birth_date && <p className="text-xs text-destructive">{errors.birth_date}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gênero (Opcional)</Label>
                  <Select value={formData.gender} onValueChange={handleSelectChange}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Feminino">Feminino</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                      <SelectItem value="Prefiro não informar">Prefiro não informar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Document Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-primary border-b pb-2">
                <CreditCard className="w-5 h-5" />
                <h3>Documento</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf" className={errors.cpf ? "text-destructive" : ""}>CPF *</Label>
                  <Input 
                    id="cpf" 
                    placeholder="000.000.000-00" 
                    value={formData.cpf}
                    onChange={handleChange}
                    maxLength={14}
                    className={errors.cpf ? "border-destructive focus-visible:ring-destructive" : "bg-background"}
                  />
                  {errors.cpf && <p className="text-xs text-destructive">{errors.cpf}</p>}
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-primary border-b pb-2">
                <MapPin className="w-5 h-5" />
                <h3>Endereço</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="cep" className={errors.cep ? "text-destructive" : ""}>CEP *</Label>
                  <div className="relative">
                    <Input 
                      id="cep" 
                      placeholder="00000-000" 
                      value={formData.cep}
                      onChange={handleChange}
                      onBlur={handleCepBlur}
                      maxLength={9}
                      className={errors.cep ? "border-destructive focus-visible:ring-destructive pr-10" : "bg-background pr-10"}
                    />
                    {cepLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {errors.cep && <p className="text-xs text-destructive">{errors.cep}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className={errors.address ? "text-destructive" : ""}>Endereço Completo *</Label>
                  <Input 
                    id="address" 
                    placeholder="Rua, Bairro, Cidade - UF" 
                    value={formData.address}
                    onChange={handleChange}
                    className={errors.address ? "border-destructive focus-visible:ring-destructive" : "bg-background"}
                  />
                  {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="number" className={errors.number ? "text-destructive" : ""}>Número *</Label>
                  <Input 
                    id="number" 
                    placeholder="123" 
                    value={formData.number}
                    onChange={handleChange}
                    className={errors.number ? "border-destructive focus-visible:ring-destructive" : "bg-background"}
                  />
                  {errors.number && <p className="text-xs text-destructive">{errors.number}</p>}
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-primary border-b pb-2">
                <Phone className="w-5 h-5" />
                <h3>Contato</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className={errors.whatsapp ? "text-destructive" : ""}>WhatsApp *</Label>
                  <Input 
                    id="whatsapp" 
                    placeholder="(00) 00000-0000" 
                    value={formData.whatsapp}
                    onChange={handleChange}
                    maxLength={15}
                    className={errors.whatsapp ? "border-destructive focus-visible:ring-destructive" : "bg-background"}
                  />
                  {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>E-mail *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "border-destructive focus-visible:ring-destructive" : "bg-background"}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-primary border-b pb-2">
                <Shield className="w-5 h-5" />
                <h3>Segurança</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>Senha *</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "border-destructive focus-visible:ring-destructive" : "bg-background"}
                  />
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm" className={errors.passwordConfirm ? "text-destructive" : ""}>Confirmar Senha *</Label>
                  <Input 
                    id="passwordConfirm" 
                    type="password" 
                    placeholder="Digite a senha novamente"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    className={errors.passwordConfirm ? "border-destructive focus-visible:ring-destructive" : "bg-background"}
                  />
                  {errors.passwordConfirm && <p className="text-xs text-destructive">{errors.passwordConfirm}</p>}
                </div>
              </div>
            </div>

          </CardContent>
          
          <CardFooter className="flex flex-col space-y-6 pt-6 border-t bg-muted/10 rounded-b-xl">
            <Button 
              type="submit" 
              className="w-full md:w-auto md:min-w-[250px] h-12 text-lg font-medium transition-all hover:shadow-lg" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Finalizar Cadastro'
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline font-semibold transition-colors">
                Entrar agora
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignupPage;
