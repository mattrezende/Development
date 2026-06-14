
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Sidebar.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

const RotinaPage = () => {
  const { currentUser } = useAuth();
  const [scheduleMap, setScheduleMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const dbScheduleMapRef = useRef({});
  const pendingChanges = useRef({});
  const saveTimeoutRef = useRef(null);

  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  
  // Generate 30-minute intervals from 00:00 to 23:30 in 'HH:MM - HH:MM' format
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const startHour = Math.floor(i / 2).toString().padStart(2, '0');
    const startMin = i % 2 === 0 ? '00' : '30';
    const endHour = Math.floor((i + 1) / 2).toString().padStart(2, '0');
    const endMin = (i + 1) % 2 === 0 ? '00' : '30';
    return `${startHour}:${startMin} - ${endHour === '24' ? '00' : endHour}:${endMin}`;
  });

  useEffect(() => {
    if (currentUser?.id) {
      fetchSchedules();
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [currentUser?.id]);

  const fetchSchedules = async () => {
    try {
      console.log('[RotinaPage] Buscando cronograma para o usuário:', currentUser.id);
      const records = await pb.collection('studySchedule').getFullList({
        filter: `userId = "${currentUser.id}"`,
        $autoCancel: false,
      });
      
      const map = {};
      records.forEach(record => {
        map[`${record.dayOfWeek}|${record.timeSlot}`] = record;
      });
      
      dbScheduleMapRef.current = JSON.parse(JSON.stringify(map));
      setScheduleMap(map);
      console.log('[RotinaPage] Cronograma carregado com sucesso:', records.length, 'registros');
    } catch (error) {
      console.error('[RotinaPage] Erro ao buscar rotina:', error);
      toast.error('Falha ao carregar cronograma: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const processPendingChanges = async () => {
    const changesToProcess = { ...pendingChanges.current };
    pendingChanges.current = {};

    if (Object.keys(changesToProcess).length === 0) {
      setIsSaving(false);
      return;
    }

    console.log('--- INICIANDO SALVAMENTO NO POCKETBASE ---');
    console.log('[RotinaPage] User ID:', currentUser?.id);
    console.log('[RotinaPage] Alterações pendentes para processar:', changesToProcess);

    let hasErrors = false;

    for (const [key, newType] of Object.entries(changesToProcess)) {
      const [day, timeLabel] = key.split('|');
      const existingRecord = dbScheduleMapRef.current[key];

      try {
        if (existingRecord?.id) {
          if (newType === 'Livre') {
            console.log(`[RotinaPage] Deletando registro ID: ${existingRecord.id} para ${key}`);
            const response = await pb.collection('studySchedule').delete(existingRecord.id, { $autoCancel: false });
            console.log(`[RotinaPage] Resposta PB (Delete):`, response);
            delete dbScheduleMapRef.current[key];
          } else {
            const payload = { slotType: newType, duration: 1 }; // duration: 1 to satisfy min: 1 constraint
            console.log(`[RotinaPage] Atualizando registro ID: ${existingRecord.id} para ${key} com payload:`, payload);
            const updated = await pb.collection('studySchedule').update(existingRecord.id, payload, { $autoCancel: false });
            console.log(`[RotinaPage] Resposta PB (Update):`, updated);
            dbScheduleMapRef.current[key] = updated;
          }
        } else if (newType === 'Estudo') {
          const payload = {
            userId: currentUser.id,
            dayOfWeek: day,
            timeSlot: timeLabel,
            slotType: newType,
            duration: 1 // duration: 1 to satisfy min: 1 constraint in PB schema
          };
          console.log(`[RotinaPage] Criando novo registro para ${key} com payload:`, payload);
          const created = await pb.collection('studySchedule').create(payload, { $autoCancel: false });
          console.log(`[RotinaPage] Resposta PB (Create):`, created);
          dbScheduleMapRef.current[key] = created;
        }
      } catch (error) {
        console.error(`[RotinaPage] ERRO PB ao processar ${key}:`, error);
        console.error(`[RotinaPage] Detalhes do erro:`, error.response);
        hasErrors = true;
      }
    }

    if (hasErrors) {
      toast.error('Algumas alterações não puderam ser salvas. Verifique o console.');
      fetchSchedules(); // Reload to sync state with DB
    } else {
      toast.success('Cronograma salvo com sucesso!');
    }

    console.log('--- FINALIZADO SALVAMENTO ---');

    // Check if more changes came in while we were processing
    if (Object.keys(pendingChanges.current).length === 0) {
      setIsSaving(false);
    } else {
      processPendingChanges(); // Process the new batch
    }
  };

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      processPendingChanges();
    }, 500);
  }, [currentUser?.id]);

  const handleToggleSlot = (day, timeLabel) => {
    const key = `${day}|${timeLabel}`;
    const currentSlot = scheduleMap[key];
    const isCurrentlyStudy = currentSlot?.slotType === 'Estudo';
    const newType = isCurrentlyStudy ? 'Livre' : 'Estudo';

    console.log(`[RotinaPage] Clique no bloco: ${key} | Atual: ${isCurrentlyStudy ? 'Estudo' : 'Livre'} -> Novo: ${newType}`);

    // Optimistic UI update
    setScheduleMap(prev => ({
      ...prev,
      [key]: { 
        ...currentSlot, 
        slotType: newType, 
        duration: 1,
        dayOfWeek: day,
        timeSlot: timeLabel
      }
    }));

    // Add to pending changes queue
    pendingChanges.current[key] = newType;

    // Trigger debounced save
    setIsSaving(true);
    debouncedSave();
  };

  // Calculate total hours (each active block is 0.5 hours visually, even if duration is 1 in DB)
  const totalHours = Object.values(scheduleMap)
    .filter(slot => slot?.slotType === 'Estudo')
    .length * 0.5;

  return (
    <>
      <Helmet>
        <title>Rotina - WATSON</title>
        <meta name="description" content="Gerencie sua rotina semanal de estudos com blocos interativos de 30 minutos." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Sidebar />
        
        <div className="content-with-sidebar">
          <main className="p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
                    Cronograma Semanal
                  </h1>
                  <p className="text-muted-foreground">
                    Clique nos blocos para definir seus horários de estudo
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {isSaving && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </div>
                  )}
                  <div className="bg-primary/10 border border-primary/20 px-6 py-3 rounded-2xl">
                    <p className="text-sm text-primary font-medium mb-1">Total disponível</p>
                    <p className="text-2xl font-bold text-primary">{totalHours.toFixed(1)}h <span className="text-base font-normal opacity-80">por semana</span></p>
                  </div>
                </div>
              </div>

              <Card className="border-border shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-6 space-y-4">
                      <Skeleton className="h-12 w-full" />
                      {Array.from({ length: 10 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto p-6">
                      <div className="min-w-[1000px]">
                        {/* Header Row */}
                        <div className="schedule-grid-new mb-4 sticky top-0 bg-card z-10 pb-4 border-b border-border">
                          <div className="text-sm font-semibold text-muted-foreground flex items-center justify-center">
                            Horário
                          </div>
                          {daysOfWeek.map((day) => (
                            <div key={day} className="text-sm font-semibold text-center">
                              {day}
                            </div>
                          ))}
                        </div>
                        
                        {/* Time Rows */}
                        <div className="space-y-2">
                          {timeSlots.map((timeLabel) => (
                            <div key={timeLabel} className="schedule-grid-new">
                              <div className="flex items-center justify-center text-sm font-medium text-muted-foreground bg-muted/30 rounded-xl border border-border/50">
                                {timeLabel}
                              </div>
                              {daysOfWeek.map((day) => {
                                const key = `${day}|${timeLabel}`;
                                const isStudy = scheduleMap[key]?.slotType === 'Estudo';
                                
                                return (
                                  <button
                                    key={key}
                                    onClick={() => handleToggleSlot(day, timeLabel)}
                                    aria-label={`${isStudy ? 'Remover' : 'Adicionar'} estudo em ${day} às ${timeLabel}`}
                                    className={`schedule-block ${
                                      isStudy ? 'schedule-block-active' : 'schedule-block-inactive'
                                    }`}
                                    title={`${day} - ${timeLabel}`}
                                  >
                                    {isStudy ? 'Estudo' : 'Livre'}
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default RotinaPage;
