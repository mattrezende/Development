import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTranslation } from '@/lib/i18n.js';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { User, Save } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const ProfileSettingsPage = () => {
  const { currentUser, updateProfile } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    professional_description: '',
    contact_phone: '',
    contact_email: '',
    base_address: '',
    base_city: '',
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        professional_description: currentUser.professional_description || '',
        contact_phone: currentUser.contact_phone || '',
        contact_email: currentUser.contact_email || '',
        base_address: currentUser.base_address || '',
        base_city: currentUser.base_city || '',
      });
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (bannerFile) {
        data.append('banner_image', bannerFile);
      }

      await updateProfile(currentUser.id, data);
      toast.success(t('profile.updated'));
      setBannerFile(null);
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('profile.title')} - Personal</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 bg-secondary/30 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('profile.title')}</h1>
                <p className="text-muted-foreground mt-1">{t('profile.subtitle')}</p>
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-6 border-b border-border pb-4">{t('profile.personalInfo')}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="space-y-3">
                    <Label htmlFor="banner_image" className="text-foreground">{t('profile.banner')}</Label>
                    <div className="flex flex-col sm:flex-row items-center gap-6 bg-muted/30 p-4 rounded-xl border border-border/50">
                      {currentUser?.banner_image ? (
                        <img
                          src={pb.files.getUrl(currentUser, currentUser.banner_image)}
                          alt="Banner"
                          className="w-32 h-32 rounded-xl object-cover shadow-sm"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                          <User className="w-12 h-12 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="flex-1 w-full">
                        <Input
                          id="banner_image"
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={(e) => setBannerFile(e.target.files[0])}
                          className="bg-background text-foreground"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          Máx 20MB. JPG, PNG, GIF, ou WebP
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground">{t('profile.name')}</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-background text-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_email" className="text-foreground">{t('profile.email')}</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        className="bg-background text-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="professional_description" className="text-foreground">{t('profile.desc')}</Label>
                    <Textarea
                      id="professional_description"
                      value={formData.professional_description}
                      onChange={(e) => setFormData({ ...formData, professional_description: e.target.value })}
                      rows={4}
                      className="bg-background text-foreground resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contact_phone" className="text-foreground">{t('profile.phone')}</Label>
                      <Input
                        id="contact_phone"
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        className="bg-background text-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="base_city" className="text-foreground">{t('profile.city')}</Label>
                      <Input
                        id="base_city"
                        type="text"
                        value={formData.base_city}
                        onChange={(e) => setFormData({ ...formData, base_city: e.target.value })}
                        className="bg-background text-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="base_address" className="text-foreground">{t('profile.address')}</Label>
                    <Input
                      id="base_address"
                      type="text"
                      value={formData.base_address}
                      onChange={(e) => setFormData({ ...formData, base_address: e.target.value })}
                      className="bg-background text-foreground"
                    />
                  </div>

                  <div className="flex justify-end pt-6 border-t border-border">
                    <Button type="submit" disabled={loading} className="px-8 shadow-md">
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                          Salvando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          {t('action.save')}
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default ProfileSettingsPage;