
import React, { useEffect, useState } from 'react';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Image as ImageIcon, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout.jsx';

const ProductManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const initialFormState = {
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    stock: '',
    discount: '0',
    weight: '',
    unit: 'un',
    is_weighable: false,
    track_stock: true,
    is_promotion: false,
    ean_code: '',
    ncm_code: '',
    internal_code: '',
    auto_code: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        pb.collection('products').getList(1, 50, { expand: 'category', sort: '-created', $autoCancel: false }),
        pb.collection('categories').getFullList({ sort: 'name', $autoCancel: false })
      ]);
      setProducts(productsRes.items);
      setCategories(categoriesRes);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os dados." });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    try {
      const res = await pb.collection('subcategories').getList(1, 50, {
        filter: `category_id="${categoryId}"`,
        sort: 'name',
        $autoCancel: false
      });
      setSubcategories(res.items);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        subcategory: product.subcategory || product.subcategory_id || '',
        stock: product.stock?.toString() || '0',
        discount: (product.discount || 0).toString(),
        weight: product.weight?.toString() || '',
        unit: product.unit || 'un',
        is_weighable: product.is_weighable || false,
        track_stock: product.track_stock !== undefined ? product.track_stock : true,
        is_promotion: product.is_promotion || false,
        ean_code: product.ean_code || '',
        ncm_code: product.ncm_code || '',
        internal_code: product.internal_code || '',
        auto_code: product.auto_code || ''
      });
      setCurrentImage(product.image ? pb.files.getUrl(product, product.image) : null);
      
      if (product.category) {
        fetchSubcategories(product.category);
      } else {
        setSubcategories([]);
      }
    } else {
      setEditingId(null);
      setFormData(initialFormState);
      setCurrentImage(null);
      setSubcategories([]);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'category') {
      setFormData(prev => ({ ...prev, subcategory: '' }));
      fetchSubcategories(value);
    }
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
      setCurrentImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copiado", description: "Código copiado para a área de transferência." });
    setTimeout(() => setCopied(false), 2000);
  };

  const generateAutoCode = () => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PRD-${yyyy}${mm}${dd}-${randomStr}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category || !formData.weight || !formData.unit) {
      toast({ variant: "destructive", title: "Erro de Validação", description: "Preencha todos os campos obrigatórios." });
      return;
    }

    if (parseFloat(formData.weight) < 0.1) {
      toast({ variant: "destructive", title: "Erro de Validação", description: "O peso deve ser no mínimo 0.1" });
      return;
    }

    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', parseFloat(formData.price));
      data.append('category', formData.category);
      data.append('stock', parseInt(formData.stock || 0, 10));
      data.append('discount', parseFloat(formData.discount || 0));
      data.append('weight', parseFloat(formData.weight));
      data.append('unit', formData.unit);
      data.append('is_weighable', formData.is_weighable ? 'true' : 'false');
      data.append('track_stock', formData.track_stock ? 'true' : 'false');
      data.append('is_promotion', formData.is_promotion ? 'true' : 'false');
      data.append('ean_code', formData.ean_code);
      data.append('ncm_code', formData.ncm_code);
      data.append('internal_code', formData.internal_code);
      
      if (!editingId) {
        // Generate auto_code on frontend if creating new, as fallback for missing hook
        data.append('auto_code', generateAutoCode());
      }
      
      if (formData.subcategory && formData.subcategory !== 'none') {
        data.append('subcategory_id', formData.subcategory);
        data.append('subcategory', formData.subcategory);
      }
      
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (editingId) {
        await pb.collection('products').update(editingId, data, { $autoCancel: false });
        toast({ title: "Sucesso", description: "Produto atualizado com sucesso!" });
      } else {
        await pb.collection('products').create(data, { $autoCancel: false });
        toast({ title: "Sucesso", description: "Produto criado com sucesso!" });
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({ 
        variant: "destructive", 
        title: "Erro ao salvar", 
        description: error.response?.message || "Ocorreu um erro inesperado ao salvar o produto." 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      try {
        await pb.collection('products').delete(id, { $autoCancel: false });
        toast({ title: "Sucesso", description: "Produto excluído com sucesso." });
        fetchData();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast({ variant: "destructive", title: "Erro ao excluir", description: "Não foi possível excluir o produto." });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Gerenciar Produtos</h1>
        <Button onClick={() => handleOpenModal()} className="shadow-md hover:shadow-lg transition-all">
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl">{editingId ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Info Card */}
                <Card className="shadow-sm border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Informações Básicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Produto *</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required className="bg-background" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria *</Label>
                        <Select value={formData.category} onValueChange={(v) => handleSelectChange('category', v)} required>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subcategory">Subcategoria</Label>
                        <Select 
                          value={formData.subcategory || 'none'} 
                          onValueChange={(v) => handleSelectChange('subcategory', v)}
                          disabled={!formData.category || subcategories.length === 0}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            {subcategories.map(sub => (
                              <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Preço (R$) *</Label>
                        <Input id="price" name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleInputChange} required className="bg-background" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount">Desconto (%)</Label>
                        <Input id="discount" name="discount" type="number" step="0.1" min="0" max="100" value={formData.discount} onChange={handleInputChange} className="bg-background" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className="bg-background resize-none" />
                    </div>
                  </CardContent>
                </Card>

                {/* Physical Properties Card */}
                <Card className="shadow-sm border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Propriedades Físicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight">Peso/Volume *</Label>
                        <Input id="weight" name="weight" type="number" step="0.01" min="0.1" value={formData.weight} onChange={handleInputChange} required className="bg-background" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unidade *</Label>
                        <Select value={formData.unit} onValueChange={(v) => handleSelectChange('unit', v)} required>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="un">Unidade (un)</SelectItem>
                            <SelectItem value="kg">Quilograma (kg)</SelectItem>
                            <SelectItem value="g">Grama (g)</SelectItem>
                            <SelectItem value="l">Litro (l)</SelectItem>
                            <SelectItem value="ml">Mililitro (ml)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox 
                        id="is_weighable" 
                        checked={formData.is_weighable} 
                        onCheckedChange={(c) => handleCheckboxChange('is_weighable', c)} 
                      />
                      <Label htmlFor="is_weighable" className="font-normal cursor-pointer">Produto pesável (venda fracionada)</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Image Card */}
                <Card className="shadow-sm border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Imagem do Produto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                      {currentImage ? (
                        <div className="relative w-full aspect-video mb-4 rounded-md overflow-hidden bg-black/5">
                          <img src={currentImage} alt="Preview" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                          <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                          <p className="text-sm">Nenhuma imagem selecionada</p>
                        </div>
                      )}
                      <Input id="image" type="file" accept="image/*" onChange={handleFileChange} className="w-full bg-background" />
                    </div>
                  </CardContent>
                </Card>

                {/* Inventory & Promotion Card */}
                <Card className="shadow-sm border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Estoque & Promoção</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock">Quantidade em Estoque</Label>
                      <Input id="stock" name="stock" type="number" min="0" value={formData.stock} onChange={handleInputChange} className="bg-background" disabled={!formData.track_stock} />
                    </div>
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="track_stock" 
                          checked={formData.track_stock} 
                          onCheckedChange={(c) => handleCheckboxChange('track_stock', c)} 
                        />
                        <Label htmlFor="track_stock" className="font-normal cursor-pointer">Controlar estoque deste produto</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="is_promotion" 
                          checked={formData.is_promotion} 
                          onCheckedChange={(c) => handleCheckboxChange('is_promotion', c)} 
                        />
                        <Label htmlFor="is_promotion" className="font-normal cursor-pointer text-primary font-medium">Destacar como Promoção</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Codes Card */}
                <Card className="shadow-sm border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Códigos de Identificação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="auto_code">Código Automático (Sistema)</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="auto_code" 
                          value={formData.auto_code || 'Gerado ao salvar'} 
                          readOnly 
                          className="bg-muted text-muted-foreground font-mono" 
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          onClick={() => copyToClipboard(formData.auto_code)}
                          disabled={!formData.auto_code}
                          title="Copiar código"
                        >
                          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ean_code">Código EAN (Barras)</Label>
                        <Input id="ean_code" name="ean_code" maxLength={13} value={formData.ean_code} onChange={handleInputChange} placeholder="Ex: 7891234567890" className="bg-background" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ncm_code">Código NCM</Label>
                        <Input id="ncm_code" name="ncm_code" maxLength={8} value={formData.ncm_code} onChange={handleInputChange} placeholder="Ex: 12345678" className="bg-background" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="internal_code">Código Interno (SKU)</Label>
                      <Input id="internal_code" name="internal_code" value={formData.internal_code} onChange={handleInputChange} placeholder="Ex: SKU-001" className="bg-background" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="min-w-[150px]">
                {saving ? 'Salvando...' : 'Salvar Produto'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-16">Img</TableHead>
              <TableHead className="font-semibold">Nome</TableHead>
              <TableHead className="font-semibold">Categoria</TableHead>
              <TableHead className="font-semibold">Preço</TableHead>
              <TableHead className="font-semibold">Estoque</TableHead>
              <TableHead className="text-right font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Carregando produtos...</TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Nenhum produto encontrado.</TableCell></TableRow>
            ) : (
              products.map(product => (
                <TableRow key={product.id} className="hover:bg-muted/30 transition-colors group">
                  <TableCell>
                    <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex items-center justify-center border">
                      {product.image ? (
                        <img src={pb.files.getUrl(product, product.image)} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    {product.auto_code && <div className="text-xs text-muted-foreground font-mono mt-0.5">{product.auto_code}</div>}
                  </TableCell>
                  <TableCell>{product.expand?.category?.name || 'Sem categoria'}</TableCell>
                  <TableCell>
                    <div className="font-medium">R$ {product.price.toFixed(2)}</div>
                    {product.discount > 0 && <div className="text-xs text-destructive font-medium">-{product.discount}% OFF</div>}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {product.stock} {product.unit}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(product)} title="Editar" className="hover:text-primary hover:bg-primary/10 h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => handleDelete(product.id)} title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default ProductManagementPage;
