import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTranslation } from '@/lib/i18n.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Exelion</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4 py-12">
        <div className="w-full max-w-md bg-card border border-border shadow-lg rounded-2xl p-8">
          <div className="flex justify-center mb-8">
            <img 
              src="https://horizons-cdn.hostinger.com/79d15a5a-e2fe-4545-97b7-f4514c9ae6a4/0e9fcb7b1fb58d1785056666579752e3.png" 
              alt="Exelion Logo" 
              className="h-12 w-auto"
            />
          </div>
          
          <h1 className="text-2xl font-bold text-center text-foreground mb-2">Bem vindo de volta</h1>
          <p className="text-center text-muted-foreground mb-8">
            Insira suas credenciais para acessar a conta
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="professor@exemplo.com" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                required 
                className="bg-background text-foreground" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground">Senha</Label>
                <Link to="/password-reset" className="text-sm text-primary hover:underline font-medium">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                required 
                className="bg-background text-foreground" 
              />
            </div>

            <Button type="submit" className="w-full shadow-md" disabled={loading}>
              {loading ? t('auth.loggingIn') : t('Entrar')}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-muted-foreground">Ainda não tem uma conta? </span>
            <Link to="/signup" className="text-primary hover:underline font-semibold">
              Cadastre-se
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;