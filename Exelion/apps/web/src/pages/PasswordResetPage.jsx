import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTranslation } from '@/lib/i18n.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const PasswordResetPage = () => {
  const { requestPasswordReset } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSent(true);
      toast.success('Link enviado para o email');
    } catch (error) {
      toast.error('Falha ao enviar link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Redefinir Senha - Personal</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4 py-12">
        <div className="w-full max-w-md bg-card border border-border shadow-lg rounded-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
              <span className="text-primary-foreground font-bold text-2xl">P</span>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-foreground mb-2">{t('auth.resetTitle')}</h1>
          <p className="text-center text-muted-foreground mb-8">
            {sent ? 'Verifique seu email' : t('auth.resetDesc')}
          </p>
          
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="professor@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background text-foreground"
                />
              </div>

              <Button type="submit" className="w-full shadow-md" disabled={loading}>
                {loading ? t('auth.sending') : t('auth.sendReset')}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-foreground">
                Enviamos um link de redefinição para <strong>{email}</strong>
              </p>
              <Button onClick={() => setSent(false)} variant="outline" className="w-full">
                Enviar para outro email
              </Button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('auth.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PasswordResetPage;