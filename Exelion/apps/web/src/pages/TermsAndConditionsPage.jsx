import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { FileText, Edit, Save, UploadCloud, Plus } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const TermsAndConditionsPage = () => {
  const { currentUser } = useAuth();
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    content_text: '',
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTerms();
  }, [currentUser]);

  const fetchTerms = async () => {
    try {
      const records = await pb.collection('termsAndConditions').getList(1, 1, {
        filter: `teacher_id="${currentUser.id}"`,
        $autoCancel: false,
      });

      if (records.items.length > 0) {
        setTerms(records.items[0]);
        setFormData({
          content_text: records.items[0].content_text || '',
        });
      }
    } catch (error) {
      console.error('Failed to load terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append('content_text', formData.content_text);
      data.append('teacher_id', currentUser.id);

      if (documentFile) {
        data.append('document_url', documentFile);
      }

      if (terms) {
        await pb.collection('termsAndConditions').update(terms.id, data, { $autoCancel: false });
        toast.success('Termos atualizados com sucesso.');
      } else {
        const newTerms = await pb.collection('termsAndConditions').create(data, {
          $autoCancel: false,
        });
        setTerms(newTerms);
        toast.success('Termos criados com sucesso.');
      }

      setEditing(false);
      setDocumentFile(null);
      fetchTerms();
    } catch (error) {
      toast.error('Erro ao salvar os termos');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background w-full">
        <Header />
        <div className="flex w-full">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Termos e Condições - Exelion</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden w-full">
          <Sidebar />
          <main className="flex-1 bg-secondary/30 overflow-y-auto w-full">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="max-w-2xl">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2 text-balance" style={{ letterSpacing: '-0.02em' }}>
                    Termos e Condições
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-balance">
                    Gerencie os termos de serviço, regras de cancelamento e contratos que seus alunos devem aceitar ao se matricular.
                  </p>
                </div>
                {!editing && terms && (
                  <Button onClick={() => setEditing(true)} variant="outline" className="shadow-sm w-full sm:w-auto">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Termos
                  </Button>
                )}
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-8">
                {!terms && !editing ? (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
                    <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Nenhum termo configurado</h3>
                    <p className="text-muted-foreground mb-8 max-w-md text-balance">
                      Adicione seus termos e condições para garantir que seus alunos estejam cientes das regras antes de iniciar as aulas.
                    </p>
                    <Button onClick={() => setEditing(true)} className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Termos
                    </Button>
                  </div>
                ) : editing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="content_text" className="text-foreground text-base sm:text-lg font-semibold">
                        Conteúdo dos Termos
                      </Label>
                      <Textarea
                        id="content_text"
                        value={formData.content_text}
                        onChange={(e) => setFormData({ ...formData, content_text: e.target.value })}
                        rows={16}
                        placeholder="Escreva as regras de cancelamento, reposição de aulas, pagamentos e outras condições aplicáveis ao seu serviço..."
                        className="bg-background text-foreground resize-y min-h-[300px] leading-relaxed p-4"
                      />
                    </div>

                    <div className="space-y-4 bg-muted/40 p-5 sm:p-6 rounded-xl border border-border/50">
                      <div>
                        <Label htmlFor="document_url" className="text-foreground flex items-center gap-2 text-base font-medium mb-1">
                          <UploadCloud className="w-5 h-5 text-primary" />
                          Documento Anexo (Opcional)
                        </Label>
                        <p className="text-sm text-muted-foreground mb-4">
                          Faça o upload de um arquivo PDF ou DOCX com o contrato completo, se houver.
                        </p>
                      </div>
                      <Input
                        id="document_url"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setDocumentFile(e.target.files[0])}
                        className="bg-background text-foreground cursor-pointer"
                      />
                      {terms?.document_url && !documentFile && (
                        <div className="pt-2 flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Documento atual:</span>
                          <a
                            href={pb.files.getUrl(terms, terms.document_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium truncate max-w-[200px] sm:max-w-xs"
                          >
                            {terms.document_url}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-border">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          setEditing(false);
                          setDocumentFile(null);
                          if (terms) {
                            setFormData({ content_text: terms.content_text || '' });
                          }
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-8">
                    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {terms.content_text || 'Nenhum texto fornecido.'}
                    </div>

                    {terms.document_url && (
                      <div className="pt-6 border-t border-border mt-8 flex flex-col sm:flex-row sm:items-center justify-between bg-muted/30 p-4 sm:p-5 rounded-xl gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Documento Anexado</p>
                            <p className="text-sm text-muted-foreground">Disponível para download pelos alunos</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full sm:w-auto shadow-sm" asChild>
                          <a
                            href={pb.files.getUrl(terms, terms.document_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visualizar Documento
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditionsPage;