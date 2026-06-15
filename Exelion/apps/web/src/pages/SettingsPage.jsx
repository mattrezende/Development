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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { User, Save, Shield, Bell, Link as LinkIcon, Trash2, Upload, X, Instagram } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const SettingsPage = () => {
  const { currentUser, updateProfile } = useAuth();
  const { t } = useTranslation();
  
  // Profile form state
  const [formData, setFormData] = useState({
    name: '', 
    professional_description: '', 
    contact_phone: '', 
    contact_email: '', 
    base_address: '', 
    base_city: '',
  });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Integrations state
  const [mpPublicKey, setMpPublicKey] = useState('');
  const [mpAccessToken, setMpAccessToken] = useState('');
  const [isSavingMp, setIsSavingMp] = useState(false);

  // Instagram state
  const [instagramUsername, setInstagramUsername] = useState('');
  const [isSavingInstagram, setIsSavingInstagram] = useState(false);

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
      
      setMpPublicKey(currentUser.mercado_pago_public_key || '');
      setMpAccessToken(currentUser.mercado_pago_access_token || '');
      setInstagramUsername(currentUser.instagram_username || '');
    }
  }, [currentUser]);

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      if (file.size > 20971520) {
        toast.error('A imagem deve ter no máximo 20MB.');
        return;
      }
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearProfilePhotoPreview = () => {
    setProfilePhotoFile(null);
    setProfilePhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (profilePhotoFile) data.append('profile_photo', profilePhotoFile);
      if (bannerFile) data.append('banner_image', bannerFile);
      
      await updateProfile(currentUser.id, data);
      toast.success('Perfil atualizado com sucesso.');
      setProfilePhotoFile(null);
      setProfilePhotoPreview(null);
      setBannerFile(null);
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMpCredentials = async () => {
    if ((mpPublicKey && !mpAccessToken) || (!mpPublicKey && mpAccessToken)) {
      toast.error('Preencha ambas as chaves ou limpe ambas para desconectar.');
      return;
    }

    setIsSavingMp(true);
    try {
      const data = new FormData();
      data.append('mercado_pago_public_key', mpPublicKey);
      data.append('mercado_pago_access_token', mpAccessToken);
      
      await updateProfile(currentUser.id, data);
      toast.success('Credenciais do Mercado Pago salvas com sucesso');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar credenciais do Mercado Pago.');
    } finally {
      setIsSavingMp(false);
    }
  };

  const handleSaveInstagram = async () => {
    setIsSavingInstagram(true);
    try {
      let cleanedUsername = instagramUsername.trim().replace(/^@/, '');
      
      if (cleanedUsername && !/^[a-zA-Z0-9._]+$/.test(cleanedUsername)) {
        toast.error('Nome de usuário inválido. Use apenas letras, números, pontos e sublinhados.');
        setIsSavingInstagram(false);
        return;
      }

      const data = new FormData();
      data.append('instagram_username', cleanedUsername);
      
      await updateProfile(currentUser.id, data);
      setInstagramUsername(cleanedUsername);
      
      if (cleanedUsername) {
        toast.success('Instagram vinculado com sucesso!');
      } else {
        toast.success('Instagram removido do perfil.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar usuário do Instagram.');
    } finally {
      setIsSavingInstagram(false);
    }
  };

  const handleClearInstagram = async () => {
    setInstagramUsername('');
    setIsSavingInstagram(true);
    try {
      const data = new FormData();
      data.append('instagram_username', '');
      await updateProfile(currentUser.id, data);
      toast.success('Instagram removido do perfil.');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao remover Instagram.');
    } finally {
      setIsSavingInstagram(false);
    }
  };

  const unimplementedAction = () => {
    toast('Funcionalidade em desenvolvimento.');
  };

  const currentProfilePhotoUrl = currentUser?.profile_photo 
    ? pb.files.getUrl(currentUser, currentUser.profile_photo) 
    : null;

  const displayProfilePhoto = profilePhotoPreview || currentProfilePhotoUrl;

  const hasMpCredentials = currentUser?.mercado_pago_public_key && currentUser?.mercado_pago_access_token;
  const hasInstagram = !!currentUser?.instagram_username;

  return (
    <>
      <Helmet>
        <title>Configurações - Personal</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden w-full">
          <Sidebar />
          <main className="flex-1 bg-secondary/20 overflow-y-auto p-6 md:p-8 w-full">
            <div className="w-full space-y-6">
              
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground mt-1">Gerencie seu perfil público, conta e integrações.</p>
              </div>

              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="bg-muted/50 p-1 mb-6 border border-border overflow-x-auto flex-wrap h-auto">
                  <TabsTrigger value="profile" className="data-[state=active]:bg-background data-[state=active]:shadow-sm py-2 px-4"><User className="w-4 h-4 mr-2"/> Perfil Público</TabsTrigger>
                  <TabsTrigger value="security" className="data-[state=active]:bg-background data-[state=active]:shadow-sm py-2 px-4"><Shield className="w-4 h-4 mr-2"/> Segurança</TabsTrigger>
                  <TabsTrigger value="integrations" className="data-[state=active]:bg-background data-[state=active]:shadow-sm py-2 px-4"><LinkIcon className="w-4 h-4 mr-2"/> Integrações</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-0">
                  <div className="card-elevation-1 p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                      
                      <div className="space-y-3">
                        <Label htmlFor="profile_photo" className="text-foreground text-lg font-semibold">Foto de Perfil</Label>
                        <p className="text-sm text-muted-foreground">Esta foto aparecerá ao lado do seu nome no perfil público.</p>
                        <div className="flex flex-col sm:flex-row items-start gap-6 bg-muted/30 p-5 rounded-xl border border-border/50">
                          <div className="profile-photo-preview flex-shrink-0 w-32 h-32">
                            {displayProfilePhoto ? (
                              <img 
                                src={displayProfilePhoto} 
                                alt="Foto de perfil" 
                                className="w-full h-full object-cover rounded-xl shadow-sm border border-border"
                              />
                            ) : (
                              <div className="w-full h-full rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                                <User className="w-12 h-12 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 w-full space-y-3">
                            <Input 
                              id="profile_photo" 
                              type="file" 
                              accept="image/*" 
                              onChange={handleProfilePhotoChange} 
                              className="bg-background text-foreground" 
                            />
                            <p className="text-sm text-muted-foreground">Máx 20MB. Formatos aceitos: JPG, PNG, GIF, WebP</p>
                            {profilePhotoPreview && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={clearProfilePhotoPreview}
                                className="mt-2"
                              >
                                <X className="w-4 h-4 mr-2" /> Cancelar nova foto
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="banner_image" className="text-foreground text-lg font-semibold">Banner do Perfil Público</Label>
                        <p className="text-sm text-muted-foreground">Imagem de capa que aparece no topo do seu perfil.</p>
                        <div className="flex flex-col sm:flex-row items-center gap-6 bg-muted/30 p-4 rounded-xl border border-border/50">
                          {currentUser?.banner_image ? (
                            <img src={pb.files.getUrl(currentUser, currentUser.banner_image)} alt="Banner" className="w-32 h-32 rounded-xl object-cover shadow-sm"/>
                          ) : (
                            <div className="w-32 h-32 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                              <User className="w-12 h-12 text-muted-foreground/50" />
                            </div>
                          )}
                          <div className="flex-1 w-full">
                            <Input id="banner_image" type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={(e) => setBannerFile(e.target.files[0])} className="bg-background text-foreground" />
                            <p className="text-sm text-muted-foreground mt-2">Máx 20MB. JPG, PNG, GIF, ou WebP</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Label htmlFor="name">Nome / Título Profissional</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                        <div className="space-y-2"><Label htmlFor="contact_email">Email Público (Contato)</Label><Input id="contact_email" type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} /></div>
                      </div>
                      
                      <div className="space-y-2"><Label htmlFor="professional_description">Descrição Profissional (Sobre mim)</Label><Textarea id="professional_description" value={formData.professional_description} onChange={(e) => setFormData({ ...formData, professional_description: e.target.value })} rows={4} /></div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Label htmlFor="contact_phone">Telefone / WhatsApp</Label><Input id="contact_phone" type="tel" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} /></div>
                        <div className="space-y-2"><Label htmlFor="base_city">Cidade Base</Label><Input id="base_city" value={formData.base_city} onChange={(e) => setFormData({ ...formData, base_city: e.target.value })} /></div>
                      </div>

                      <div className="space-y-2"><Label htmlFor="base_address">Endereço Principal / Local de Treino</Label><Input id="base_address" value={formData.base_address} onChange={(e) => setFormData({ ...formData, base_address: e.target.value })} /></div>

                      <div className="flex justify-end pt-6 border-t border-border">
                        <Button type="submit" disabled={loading} className="px-8">
                          {loading ? 'Salvando...' : <><Save className="w-4 h-4 mr-2" /> Salvar Alterações</>}
                        </Button>
                      </div>
                    </form>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="mt-0">
                  <div className="card-elevation-1 p-6 md:p-8 space-y-8">
                    <div>
                      <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">Alterar Senha</h2>
                      <div className="space-y-4 max-w-sm">
                        <div className="space-y-2"><Label>Senha Atual</Label><Input type="password" /></div>
                        <div className="space-y-2"><Label>Nova Senha</Label><Input type="password" /></div>
                        <Button onClick={unimplementedAction}>Atualizar Senha</Button>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2 text-destructive">Zona de Perigo</h2>
                      <p className="text-sm text-muted-foreground mb-4">Ao excluir sua conta, todos os seus dados e dados dos alunos serão permanentemente removidos. Esta ação não pode ser desfeita.</p>
                      <Button variant="destructive" onClick={unimplementedAction}><Trash2 className="w-4 h-4 mr-2" /> Excluir Conta Permanentemente</Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="integrations" className="mt-0">
                   <div className="card-elevation-1 p-6 md:p-8 space-y-8">
                      
                      {/* Instagram Integration */}
                      <div>
                        <h2 className="text-xl font-semibold mb-1">Redes Sociais</h2>
                        <p className="text-sm text-muted-foreground mb-6">Conecte suas redes sociais para exibi-las no seu perfil público.</p>
                        
                        <div className="bg-muted/30 border border-border p-5 md:p-6 rounded-xl space-y-6">
                          <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                            <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                              <Instagram className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">Instagram</p>
                              {hasInstagram ? (
                                <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Vinculado (@{currentUser.instagram_username})
                                </p>
                              ) : (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-muted-foreground inline-block"></span> Não vinculado
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-5 max-w-md">
                            <div className="space-y-2">
                              <Label htmlFor="instagram_username">Nome de Usuário do Instagram</Label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                                  <Input 
                                    id="instagram_username" 
                                    value={instagramUsername} 
                                    onChange={(e) => setInstagramUsername(e.target.value)} 
                                    placeholder="seu_usuario" 
                                    className="pl-8 bg-background"
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">Seu feed do Instagram será exibido no seu perfil público.</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                              <Button 
                                onClick={handleSaveInstagram} 
                                disabled={isSavingInstagram || (!instagramUsername && !hasInstagram)}
                                className="flex-1 sm:flex-none"
                              >
                                {isSavingInstagram ? 'Salvando...' : 'Salvar Instagram'}
                              </Button>
                              {hasInstagram && (
                                <Button 
                                  variant="outline" 
                                  onClick={handleClearInstagram}
                                  disabled={isSavingInstagram}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  Remover
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mercado Pago Integration */}
                      <div>
                        <h2 className="text-xl font-semibold mb-1">Gateway de Pagamento</h2>
                        <p className="text-sm text-muted-foreground mb-6">Configure suas chaves do Mercado Pago para receber pagamentos de matrículas automaticamente.</p>
                        
                        <div className="bg-muted/30 border border-border p-5 md:p-6 rounded-xl space-y-6">
                          <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 shadow-sm border border-border">
                              <span className="font-bold text-[#009EE3] text-xl">MP</span>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">Mercado Pago</p>
                              {hasMpCredentials ? (
                                <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Conectado e Ativo
                                </p>
                              ) : (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-muted-foreground inline-block"></span> Não conectado
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-5 max-w-2xl">
                            <div className="space-y-2">
                              <Label htmlFor="mp_public_key">Chave Pública Mercado Pago</Label>
                              <div className="flex gap-2">
                                <Input 
                                  id="mp_public_key" 
                                  value={mpPublicKey} 
                                  onChange={(e) => setMpPublicKey(e.target.value)} 
                                  placeholder="APP_USR-..." 
                                  className="font-mono text-sm bg-background"
                                />
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => setMpPublicKey('')} 
                                  title="Limpar"
                                  className="flex-shrink-0"
                                >
                                  <X className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="mp_access_token">Token de Acesso Mercado Pago</Label>
                              <div className="flex gap-2">
                                <Input 
                                  id="mp_access_token" 
                                  type="password" 
                                  value={mpAccessToken} 
                                  onChange={(e) => setMpAccessToken(e.target.value)} 
                                  placeholder="APP_USR-..." 
                                  className="font-mono text-sm bg-background tracking-widest"
                                />
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => setMpAccessToken('')} 
                                  title="Limpar"
                                  className="flex-shrink-0"
                                >
                                  <X className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">Mantenha seu token de acesso em segurança. Não o compartilhe com ninguém.</p>
                            </div>

                            <div className="pt-2">
                              <Button 
                                onClick={handleSaveMpCredentials} 
                                disabled={isSavingMp || (!mpPublicKey && !mpAccessToken && !hasMpCredentials)}
                                className="w-full sm:w-auto"
                              >
                                {isSavingMp ? 'Salvando...' : 'Salvar Credenciais'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                   </div>
                </TabsContent>

              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;