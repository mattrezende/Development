import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';

const PostForm = ({ initialData, onSuccess, onCancel }) => {
  const isEditMode = !!initialData;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    subtitulo: '',
    conteudo: '',
    imagens: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        titulo: initialData.titulo || '',
        subtitulo: initialData.subtitulo || '',
        conteudo: initialData.conteudo || '',
        imagens: [] // We don't pre-populate files, user can upload new ones to append/replace
      });
    }
  }, [initialData]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, imagens: files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('titulo', formData.titulo);
      if (formData.subtitulo) data.append('subtitulo', formData.subtitulo);
      data.append('conteudo', formData.conteudo);
      
      if (formData.imagens.length > 0) {
        for (let i = 0; i < formData.imagens.length; i++) {
          data.append('imagens', formData.imagens[i]);
        }
      }

      if (isEditMode) {
        await apiClient.put(`/api/postagens/${initialData.id}`, data, { isFormData: true });
        toast.success('Postagem atualizada com sucesso');
      } else {
        await apiClient.post('/api/postagens', data, { isFormData: true });
        toast.success('Postagem criada com sucesso');
      }
      
      if (!isEditMode) {
        setFormData({ titulo: '', subtitulo: '', conteudo: '', imagens: [] });
        const fileInput = document.getElementById('post-images');
        if (fileInput) fileInput.value = '';
      }
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar postagem:', error);
      toast.error(isEditMode ? 'Erro ao atualizar postagem' : 'Erro ao criar postagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="post-titulo">Título *</Label>
        <Input
          id="post-titulo"
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          required
          placeholder="Ex: Metodologias Ativas no Ensino"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="post-subtitulo">Subtítulo</Label>
        <Input
          id="post-subtitulo"
          value={formData.subtitulo}
          onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
          placeholder="Ex: Como engajar estudantes de forma efetiva"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="post-conteudo">Conteúdo *</Label>
        <Textarea
          id="post-conteudo"
          value={formData.conteudo}
          onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
          required
          rows={12}
          placeholder="Escreva o conteúdo da postagem aqui..."
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Dica: Use tags HTML para formatação. Ex: &lt;h2&gt;Subtítulo&lt;/h2&gt;, &lt;p&gt;Parágrafo&lt;/p&gt;, &lt;strong&gt;Negrito&lt;/strong&gt;
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="post-images">Imagens (até 10 arquivos)</Label>
        <Input
          id="post-images"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          onChange={handleImageChange}
        />
        <p className="text-xs text-muted-foreground">
          {isEditMode 
            ? "Opcional: Envie novas imagens para adicionar à postagem." 
            : "Formatos aceitos: JPEG, PNG, GIF, WebP. Máximo de 10 imagens."}
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isEditMode ? 'Atualizar Postagem' : 'Criar Postagem'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default PostForm;