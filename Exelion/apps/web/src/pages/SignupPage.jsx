import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    professional_description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      toast.error('Senhas não conferem');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Senha deve ter no mínimo 8 caracteres');
      return;
    }

    setLoading(true);
    
    const submissionData = {
      ...formData
    };

    console.log('SignupPage: Attempting registration with data:', {
      name: submissionData.name,
      email: submissionData.email,
      professional_description: submissionData.professional_description,
      password: '[HIDDEN]',
      passwordConfirm: '[HIDDEN]'
    });

    try {
      await signup(submissionData);
      console.log('SignupPage: Registration successful');
      toast.success('Conta criada com sucesso! Bem-vindo(a).');
      navigate('/dashboard');
    } catch (error) {
      console.error('SignupPage: Registration error:', error);
      
      if (error.response?.data) {
        const errorFields = Object.keys(error.response.data);
        if (errorFields.length > 0) {
          const firstError = error.response.data[errorFields[0]];
          toast.error(`Erro em ${errorFields[0]}: ${firstError.message}`);
          return;
        }
      }
      
      toast.error(error.message || 'Falha ao criar conta. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Cadastro de Professor - Exelion</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-card border border-border shadow-lg rounded-2xl p-6 sm:p-8">
          <div className="flex justify-center mb-6 sm:mb-8">
            <img 
              src="https://horizons-cdn.hostinger.com/79d15a5a-e2fe-4545-97b7-f4514c9ae6a4/0e9fcb7b1fb58d1785056666579752e3.png" 
              alt="Exelion Logo" 
              className="h-10 sm:h-12 w-auto"
            />
          </div>
          
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2" style={{ letterSpacing: '-0.02em' }}>
              Cadastro de Professor
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-[32ch] mx-auto leading-relaxed">
              Crie sua conta para começar a gerenciar seus alunos e aulas.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ex: João Silva"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-background text-foreground transition-colors focus-visible:ring-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="professor@exemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-background text-foreground transition-colors focus-visible:ring-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professional_description" className="text-foreground font-medium">Resumo Profissional</Label>
              <Textarea
                id="professional_description"
                placeholder="Breve resumo da sua experiência e especialidades..."
                value={formData.professional_description}
                onChange={(e) =>
                  setFormData({ ...formData, professional_description: e.target.value })
                }
                rows={3}
                className="bg-background text-foreground resize-y transition-colors focus-visible:ring-2"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  className="bg-background text-foreground transition-colors focus-visible:ring-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirm" className="text-foreground font-medium">Confirmar Senha</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  placeholder="Repita a senha"
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                  required
                  minLength={8}
                  className="bg-background text-foreground transition-colors focus-visible:ring-2"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full mt-2 sm:mt-4 shadow-md transition-all duration-200 hover:brightness-110 active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-6 sm:mt-8 text-center text-sm">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Link to="/login" className="text-primary hover:underline font-semibold transition-colors">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;