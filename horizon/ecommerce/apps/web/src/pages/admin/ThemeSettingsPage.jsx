
import React, { useEffect, useState } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useTheme } from '@/hooks/useTheme.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout.jsx';

const ThemeSettingsPage = () => {
  const [settingsId, setSettingsId] = useState(null);
  const [formData, setFormData] = useState({
    primary_color: '#10b981',
    secondary_color: '#34d399',
    accent_color: '#f59e0b'
  });
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [currentLogo, setCurrentLogo] = useState(null);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { updateTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await pb.collection('theme_settings').getList(1, 1, { $autoCancel: false });
        if (result.items.length > 0) {
          const s = result.items[0];
          setSettingsId(s.id);
          setFormData({
            primary_color: s.primary_color || '#10b981',
            secondary_color: s.secondary_color || '#34d399',
            accent_color: s.accent_color || '#f59e0b'
          });
          if (s.logo) setCurrentLogo(pb.files.getUrl(s, s.logo));
          if (s.hero_banner) setCurrentBanner(pb.files.getUrl(s, s.hero_banner));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleColorChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append('primary_color', formData.primary_color);
      data.append('secondary_color', formData.secondary_color);
      data.append('accent_color', formData.accent_color);
      
      if (logoFile) data.append('logo', logoFile);
      if (bannerFile) data.append('hero_banner', bannerFile);

      if (settingsId) {
        await pb.collection('theme_settings').update(settingsId, data, { $autoCancel: false });
      } else {
        const newSettings = await pb.collection('theme_settings').create(data, { $autoCancel: false });
        setSettingsId(newSettings.id);
      }
      
      toast({ title: "Configurações salvas com sucesso!" });
      updateTheme(); // Apply new theme globally
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao salvar configurações" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout><div className="p-8 text-center">Carregando...</div></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Configurações de Tema</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Cores e Imagens</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input type="color" id="primary_color" name="primary_color" value={formData.primary_color} onChange={handleColorChange} className="w-12 h-10 p-1" />
                    <Input type="text" value={formData.primary_color} onChange={handleColorChange} name="primary_color" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input type="color" id="secondary_color" name="secondary_color" value={formData.secondary_color} onChange={handleColorChange} className="w-12 h-10 p-1" />
                    <Input type="text" value={formData.secondary_color} onChange={handleColorChange} name="secondary_color" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent_color">Cor de Destaque</Label>
                  <div className="flex gap-2">
                    <Input type="color" id="accent_color" name="accent_color" value={formData.accent_color} onChange={handleColorChange} className="w-12 h-10 p-1" />
                    <Input type="text" value={formData.accent_color} onChange={handleColorChange} name="accent_color" className="flex-1" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo do Site</Label>
                {currentLogo && (
                  <div className="mb-2 p-2 border rounded bg-muted/30 inline-block">
                    <img src={currentLogo} alt="Logo atual" className="h-12 object-contain" />
                  </div>
                )}
                <Input id="logo" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner">Banner Principal (Hero)</Label>
                {currentBanner && (
                  <div className="mb-2 p-2 border rounded bg-muted/30">
                    <img src={currentBanner} alt="Banner atual" className="h-24 w-full object-cover rounded" />
                  </div>
                )}
                <Input id="banner" type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files[0])} />
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-xl overflow-hidden" style={{ '--preview-primary': formData.primary_color, '--preview-secondary': formData.secondary_color, '--preview-accent': formData.accent_color }}>
              {/* Mock Header */}
              <div className="p-4 flex justify-between items-center border-b" style={{ backgroundColor: 'var(--preview-primary)', color: 'white' }}>
                <div className="font-bold text-lg">Meu Supermercado</div>
                <div className="flex gap-4 text-sm">
                  <span>Home</span>
                  <span>Produtos</span>
                </div>
              </div>
              
              {/* Mock Hero */}
              <div className="p-8 text-center" style={{ backgroundColor: 'var(--preview-secondary)', color: 'white' }}>
                <h2 className="text-2xl font-bold mb-2">Ofertas Especiais</h2>
                <Button style={{ backgroundColor: 'var(--preview-accent)', color: 'white', border: 'none' }}>
                  Comprar Agora
                </Button>
              </div>

              {/* Mock Content */}
              <div className="p-6 bg-background">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 shadow-sm">
                    <div className="h-24 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <Button className="w-full mt-4" style={{ backgroundColor: 'var(--preview-primary)', color: 'white' }}>Adicionar</Button>
                  </div>
                  <div className="border rounded-lg p-4 shadow-sm">
                    <div className="h-24 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <Button className="w-full mt-4" style={{ backgroundColor: 'var(--preview-primary)', color: 'white' }}>Adicionar</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ThemeSettingsPage;
