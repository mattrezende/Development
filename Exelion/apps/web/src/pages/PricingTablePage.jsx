import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Loader2, DollarSign } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const PricingTablePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [singleLessonPrice, setSingleLessonPrice] = useState('');
  const [prices, setPrices] = useState({
    semanal: {
      1: { price: '', id: null },
      2: { price: '', id: null },
      3: { price: '', id: null },
      4: { price: '', id: null },
      5: { price: '', id: null }
    }
  });

  useEffect(() => {
    fetchPricing();
  }, [currentUser]);

  const fetchPricing = async () => {
    if (!currentUser) return;
    try {
      setSingleLessonPrice(currentUser.single_lesson_price || '');

      const records = await pb.collection('pricing').getFullList({
        filter: `teacher_id="${currentUser.id}" && type="semanal"`,
        $autoCancel: false,
      });

      const newPrices = {
        semanal: {
          1: { price: '', id: null }, 2: { price: '', id: null }, 3: { price: '', id: null }, 4: { price: '', id: null }, 5: { price: '', id: null }
        }
      };

      records.forEach(r => {
        if (newPrices.semanal[r.quantity]) {
          newPrices.semanal[r.quantity] = { price: r.price.toString(), id: r.id };
        }
      });

      setPrices(newPrices);
    } catch (error) {
      toast.error('Erro ao carregar a tabela de preços.');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (qty, value) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    setPrices(prev => ({
      ...prev,
      semanal: {
        ...prev.semanal,
        [qty]: { ...prev.semanal[qty], price: sanitized }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save single lesson price to teacher profile
      const singlePriceVal = parseFloat(singleLessonPrice);
      if (!isNaN(singlePriceVal) && singlePriceVal >= 0) {
        const data = new FormData();
        data.append('single_lesson_price', singlePriceVal);
        await updateProfile(currentUser.id, data);
      }

      // Save weekly prices
      for (let q = 1; q <= 5; q++) {
        const item = prices.semanal[q];
        const priceVal = parseFloat(item.price);
        
        if (!isNaN(priceVal) && priceVal > 0) {
          if (item.id) {
            await pb.collection('pricing').update(item.id, { price: priceVal }, { $autoCancel: false });
          } else {
            await pb.collection('pricing').create({
              teacher_id: currentUser.id,
              type: 'semanal',
              quantity: q,
              price: priceVal
            }, { $autoCancel: false });
          }
        } else if (item.id && (item.price === '' || isNaN(priceVal) || priceVal <= 0)) {
          await pb.collection('pricing').delete(item.id, { $autoCancel: false });
        }
      }
      
      toast.success('Tabela de preços salva com sucesso!');
      await fetchPricing();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar os preços. Verifique os valores e tente novamente.');
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
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Tabela de Preços - Personal</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden w-full">
          <Sidebar />
          <main className="flex-1 bg-secondary/20 overflow-y-auto p-6 md:p-8 w-full">
            <div className="w-full space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Tabela de Preços</h1>
                  <p className="text-muted-foreground mt-1">Configure os valores para aulas avulsas e pacotes mensais recorrentes.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="px-6 shadow-sm">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                
                <div className="card-elevation-2 bg-card overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-border bg-muted/30">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      Aulas Avulsas
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Pagamento único válido por aula agendada.</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <Label className="w-32 font-medium text-foreground">Valor por Aula</Label>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pl-9 bg-background text-foreground"
                          value={singleLessonPrice}
                          onChange={(e) => setSingleLessonPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      O aluno poderá escolher a quantidade de aulas avulsas que deseja comprar no momento da matrícula. O valor total será calculado automaticamente.
                    </p>
                  </div>
                </div>

                <div className="card-elevation-2 bg-card overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-border bg-primary/5">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      Aulas Semanais (Plano Mensal)
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Valor cobrado mensalmente referente à frequência por semana.</p>
                  </div>
                  <div className="p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map((qty) => (
                      <div key={`semanal-${qty}`} className="flex items-center gap-4">
                        <Label className="w-32 font-medium text-foreground">{qty}x por semana</Label>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="pl-9 bg-background text-foreground"
                            value={prices.semanal[qty].price}
                            onChange={(e) => handlePriceChange(qty, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default PricingTablePage;