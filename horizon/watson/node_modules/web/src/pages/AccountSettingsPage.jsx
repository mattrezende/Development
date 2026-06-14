
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Settings, User, FileText, Mail, MapPin, 
  BookOpen, Brain, Target, Upload, Camera, Save
} from 'lucide-react';
import Sidebar from '@/components/Sidebar.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTheme } from '@/contexts/ThemeContext.jsx';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { useUserProfile } from '@/hooks/useUserProfile.js';
import { validateCPF, validatePhone, validateCEP } from '@/lib/formValidation.js';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const brStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const learningMethods = ['Leitura', 'Vídeo', 'Flashcard', 'Exercício', 'Método Misto'];

const AccountSettingsPage = () => {
  const { currentUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { profile, loading: profileLoading, saveUserProfile, uploadProfilePhoto, fetchUserProfile } = useUserProfile(currentUser?.id);
  
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nomeDeGuerra: '',
    tipoEstudo: '',
    dataNascimento: '',
    cpf: '',
    genero: '',
    estadoCivil: '',
    grauEscolaridade: '',
    celular: '',
    cep: '',
    rua: '',
    bairro: '',
    cidade: '',
    estado: '',
    objetivoPrincipal: '',
    trabalha: '',
    metodosAprendizado: [],
    revisaFrequente: '',
    maiorDificuldade: '',
    disciplina: '',
    procrastina: '',
    metasDiarias: '',
    idioma: language,
    tema: theme
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        ...profile,
        idioma: profile.idioma || language,
        tema: profile.tema || theme
      }));
      if (profile.idioma && profile.idioma !== language) setLanguage(profile.idioma);
      if (profile.tema && profile.tema !== theme) setTheme(profile.tema);
    }
  }, [profile]);

  const handleCPFChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length <= 11) {
      val = val.replace(/(\d{3})(\d)/, '$1.$2')
               .replace(/(\d{3})(\d)/, '$1.$2')
               .replace(/(\d{3})(\d{1,2})/, '$1-$2');
      setFormData({ ...formData, cpf: val });
    }
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length <= 11) {
      val = val.replace(/(\d{2})(\d)/, '($1) $2')
               .replace(/(\d{4,5})(\d{4})/, '$1-$2');
      setFormData({ ...formData, celular: val });
    }
  };

  const handleCEPChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length <= 8) {
      val = val.replace(/(\d{5})(\d)/, '$1-$2');
      setFormData({ ...formData, cep: val });
    }
  };

  const handleMethodToggle = (method) => {
    setFormData(prev => {
      const current = prev.metodosAprendizado || [];
      if (current.includes(method)) {
        return { ...prev, metodosAprendizado: current.filter(m => m !== method) };
      } else {
        return { ...prev, metodosAprendizado: [...current, method] };
      }
    });
  };

  const handleSystemPrefChange = async (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (key === 'idioma') setLanguage(value);
    if (key === 'tema') setTheme(value);
    
    if (profile?.id) {
      try {
        await saveUserProfile({ [key]: value });
      } catch (err) {
        console.error('Failed to auto-save preference', err);
      }
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      await uploadProfilePhoto(file);
      toast.success(t('photo_uploaded'));
      fetchUserProfile();
    } catch (err) {
      toast.error(t('photo_error'));
    }
  };

  const handleSaveAll = async () => {
    const cpfVal = validateCPF(formData.cpf);
    const phoneVal = validatePhone(formData.celular);
    const cepVal = validateCEP(formData.cep);

    if (!cpfVal.isValid) return toast.error(t(cpfVal.error));
    if (!phoneVal.isValid) return toast.error(t(phoneVal.error));
    if (!cepVal.isValid) return toast.error(t(cepVal.error));

    setSaving(true);
    try {
      await saveUserProfile(formData);
      toast.success(t('success_save'));
    } catch (err) {
      toast.error(t('error_save'));
    } finally {
      setSaving(false);
    }
  };

  const photoUrl = profile?.profilePhoto ? pb.files.getUrl(profile, profile.profilePhoto) : null;

  if (profileLoading && !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('settings_title')} - WATSON</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Sidebar />
        
        <main className="lg:pl-72 p-6 md:p-8 pb-32">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
                {t('settings_title')}
              </h1>
              <p className="text-muted-foreground">{t('settings_desc')}</p>
            </div>

            <Accordion type="multiple" defaultValue={['system', 'basic']} className="w-full space-y-4">
              
              {/* 1. PREFERÊNCIAS DO SISTEMA */}
              <AccordionItem value="system" className="border rounded-2xl px-6 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><Settings className="w-5 h-5" /></div>
                    <span className="font-semibold text-lg">{t('sec_system')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="form-row">
                    <div className="space-y-2">
                      <Label>{t('language')}</Label>
                      <Select value={formData.idioma} onValueChange={(v) => handleSystemPrefChange('idioma', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('theme')}</Label>
                      <Select value={formData.tema} onValueChange={(v) => handleSystemPrefChange('tema', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dark">{t('dark')}</SelectItem>
                          <SelectItem value="light">{t('light')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 2. PERFIL BÁSICO */}
              <AccordionItem value="basic" className="border rounded-2xl px-6 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><User className="w-5 h-5" /></div>
                    <span className="font-semibold text-lg">{t('sec_basic')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="form-section">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="relative w-24 h-24 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                        {photoUrl ? (
                          <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handlePhotoUpload} 
                          className="hidden" 
                          accept="image/jpeg,image/png,image/gif,image/webp"
                        />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <Camera className="w-4 h-4 mr-2" />
                          {t('upload_photo')}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">Máx 20MB. JPEG, PNG, GIF, WEBP.</p>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="space-y-2">
                        <Label>{t('nome_guerra')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                        <Input 
                          value={formData.nomeDeGuerra} 
                          onChange={(e) => setFormData({...formData, nomeDeGuerra: e.target.value})} 
                          placeholder="Ex: Zero Zero"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label>{t('tipo_estudo')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                        <RadioGroup 
                          value={formData.tipoEstudo} 
                          onValueChange={(v) => setFormData({...formData, tipoEstudo: v})}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Grade" id="r-grade" />
                            <Label htmlFor="r-grade" className="font-normal">{t('grade')}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Ciclo" id="r-ciclo" />
                            <Label htmlFor="r-ciclo" className="font-normal">{t('ciclo')}</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 3. DADOS PESSOAIS */}
              <AccordionItem value="personal" className="border rounded-2xl px-6 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><FileText className="w-5 h-5" /></div>
                    <span className="font-semibold text-lg">{t('sec_personal')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="form-section">
                    <div className="form-row">
                      <div className="space-y-2">
                        <Label>{t('birth_date')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                        <Input 
                          type="date" 
                          value={formData.dataNascimento ? formData.dataNascimento.split('T')[0] : ''} 
                          onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('cpf')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                        <Input 
                          value={formData.cpf} 
                          onChange={handleCPFChange} 
                          placeholder="000.000.000-00"
                          maxLength={14}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="space-y-2">
                        <Label>{t('gender')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                        <Select value={formData.genero} onValueChange={(v) => setFormData({...formData, genero: v})}>
                          <SelectTrigger><SelectValue placeholder={t('select_gender')} /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Feminino">Feminino</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                            <SelectItem value="Prefiro não informar">Prefiro não informar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('marital_status')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                        <Select value={formData.estadoCivil} onValueChange={(v) => setFormData({...formData, estadoCivil: v})}>
                          <SelectTrigger><SelectValue placeholder={t('select_marital')} /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Solteiro">Solteiro(a)</SelectItem>
                            <SelectItem value="Casado">Casado(a)</SelectItem>
                            <SelectItem value="Divorciado">Divorciado(a)</SelectItem>
                            <SelectItem value="Viúvo">Viúvo(a)</SelectItem>
                            <SelectItem value="União Estável">União Estável</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('education')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                      <Select value={formData.grauEscolaridade} onValueChange={(v) => setFormData({...formData, grauEscolaridade: v})}>
                        <SelectTrigger><SelectValue placeholder={t('select_education')} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ensino Fundamental Cursando">Ensino Fundamental Cursando</SelectItem>
                          <SelectItem value="Ensino Fundamental Concluído">Ensino Fundamental Concluído</SelectItem>
                          <SelectItem value="Ensino Médio Cursando">Ensino Médio Cursando</SelectItem>
                          <SelectItem value="Ensino Médio Concluído">Ensino Médio Concluído</SelectItem>
                          <SelectItem value="Ensino Superior Cursando">Ensino Superior Cursando</SelectItem>
                          <SelectItem value="Ensino Superior Concluído">Ensino Superior Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 4. CONTATO */}
              <AccordionItem value="contact" className="border rounded-2xl px-6 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><Mail className="w-5 h-5" /></div>
                    <span className="font-semibold text-lg">{t('sec_contact')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="form-row">
                    <div className="space-y-2">
                      <Label>{t('email')}</Label>
                      <Input value={currentUser?.email || ''} readOnly className="bg-muted text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('phone')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                      <Input 
                        value={formData.celular} 
                        onChange={handlePhoneChange} 
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 5. ENDEREÇO */}
              <AccordionItem value="address" className="border rounded-2xl px-6 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><MapPin className="w-5 h-5" /></div>
                    <span className="font-semibold text-lg">{t('sec_address')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="form-section">
                    <div className="form-row">
                      <div className="space-y-2">
                        <Label>{t('cep')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                        <Input 
                          value={formData.cep} 
                          onChange={handleCEPChange} 
                          placeholder="00000-000"
                          maxLength={9}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('state')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                        <Select value={formData.estado} onValueChange={(v) => setFormData({...formData, estado: v})}>
                          <SelectTrigger><SelectValue placeholder={t('select_state')} /></SelectTrigger>
                          <SelectContent>
                            {brStates.map(st => (
                              <SelectItem key={st} value={st}>{st}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('street')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                      <Input 
                        value={formData.rua} 
                        onChange={(e) => setFormData({...formData, rua: e.target.value})} 
                        placeholder="Nome da rua, avenida, etc."
                      />
                    </div>
                    <div className="form-row">
                      <div className="space-y-2">
                        <Label>{t('neighborhood')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                        <Input 
                          value={formData.bairro} 
                          onChange={(e) => setFormData({...formData, bairro: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('city')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                        <Input 
                          value={formData.cidade} 
                          onChange={(e) => setFormData({...formData, cidade: e.target.value})} 
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 6. PERFIL DE ESTUDO */}
              <AccordionItem value="study" className="border rounded-2xl px-6 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><BookOpen className="w-5 h-5" /></div>
                    <span className="font-semibold text-lg">{t('sec_study')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="form-row">
                    <div className="space-y-3">
                      <Label>{t('objective')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                      <RadioGroup 
                        value={formData.objetivoPrincipal} 
                        onValueChange={(v) => setFormData({...formData, objetivoPrincipal: v})}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Estudar melhor" id="obj-1" />
                          <Label htmlFor="obj-1" className="font-normal">Estudar melhor</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Estudar para concurso" id="obj-2" />
                          <Label htmlFor="obj-2" className="font-normal">Estudar para concurso</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Estudar para vestibular" id="obj-3" />
                          <Label htmlFor="obj-3" className="font-normal">Estudar para vestibular</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-3">
                      <Label>{t('works')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                      <RadioGroup 
                        value={formData.trabalha} 
                        onValueChange={(v) => setFormData({...formData, trabalha: v})}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Sim" id="work-yes" />
                          <Label htmlFor="work-yes" className="font-normal">{t('yes')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Não" id="work-no" />
                          <Label htmlFor="work-no" className="font-normal">{t('no')}</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 7. PERFIL COGNITIVO */}
              <AccordionItem value="cognitive" className="border rounded-2xl px-6 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><Brain className="w-5 h-5" /></div>
                    <span className="font-semibold text-lg">{t('sec_cognitive')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="form-section">
                    <div className="form-row">
                      <div className="space-y-3">
                        <Label>{t('methods')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {learningMethods.map(method => (
                            <div key={method} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`method-${method}`}
                                checked={(formData.metodosAprendizado || []).includes(method)}
                                onCheckedChange={() => handleMethodToggle(method)}
                              />
                              <label htmlFor={`method-${method}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {method}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label>{t('reviews')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                        <RadioGroup 
                          value={formData.revisaFrequente} 
                          onValueChange={(v) => setFormData({...formData, revisaFrequente: v})}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Sim" id="rev-yes" />
                            <Label htmlFor="rev-yes" className="font-normal">{t('yes')}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Não" id="rev-no" />
                            <Label htmlFor="rev-no" className="font-normal">{t('no')}</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('difficulty')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                      <Textarea 
                        value={formData.maiorDificuldade} 
                        onChange={(e) => setFormData({...formData, maiorDificuldade: e.target.value})} 
                        placeholder="Descreva sua maior dificuldade nos estudos..."
                        rows={3}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 8. COMPORTAMENTO E CONSISTÊNCIA */}
              <AccordionItem value="behavior" className="border rounded-2xl px-6 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><Target className="w-5 h-5" /></div>
                    <span className="font-semibold text-lg">{t('sec_behavior')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="form-row">
                    <div className="space-y-3">
                      <Label>{t('discipline')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                      <RadioGroup 
                        value={formData.disciplina} 
                        onValueChange={(v) => setFormData({...formData, disciplina: v})}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Baixo" id="disc-low" />
                          <Label htmlFor="disc-low" className="font-normal">{t('low')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Médio" id="disc-med" />
                          <Label htmlFor="disc-med" className="font-normal">{t('medium')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Alto" id="disc-high" />
                          <Label htmlFor="disc-high" className="font-normal">{t('high')}</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-3">
                      <Label>{t('procrastinates')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                      <RadioGroup 
                        value={formData.procrastina} 
                        onValueChange={(v) => setFormData({...formData, procrastina: v})}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Sim" id="proc-yes" />
                          <Label htmlFor="proc-yes" className="font-normal">{t('yes')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Não" id="proc-no" />
                          <Label htmlFor="proc-no" className="font-normal">{t('no')}</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-3">
                      <Label>{t('daily_goals')} <span className="text-muted-foreground font-normal">{t('optional')}</span></Label>
                      <RadioGroup 
                        value={formData.metasDiarias} 
                        onValueChange={(v) => setFormData({...formData, metasDiarias: v})}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Sim" id="goals-yes" />
                          <Label htmlFor="goals-yes" className="font-normal">{t('yes')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Não" id="goals-no" />
                          <Label htmlFor="goals-no" className="font-normal">{t('no')}</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>
        </main>

        {/* Fixed Bottom Save Bar */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-72 bg-background/80 backdrop-blur-md border-t border-border p-4 flex justify-end z-10">
          <div className="max-w-4xl w-full mx-auto flex justify-end">
            <Button onClick={handleSaveAll} disabled={saving} size="lg" className="w-full sm:w-auto shadow-lg">
              <Save className="w-5 h-5 mr-2" />
              {saving ? t('saving') : t('save_all')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSettingsPage;
