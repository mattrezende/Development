import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import EventCard from '@/components/EventCard.jsx';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';

const HomePage = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const records = await apiClient.get('/api/eventos?sort=data');
        setEventos(records);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        toast.error('Erro ao carregar eventos');
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  return (
    <>
      <Helmet>
        <title>Bosque de Francisco</title>
        <meta name="description" content="Um espaço dedicado ao compartilhamento de conhecimento e experiências educacionais. Acompanhe nossas aulas e postagens." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img src="https://horizons-cdn.hostinger.com/8c0f2a8e-86dd-4112-aab2-72151784c3a3/noname_13-lavender-1507499-XsGgG.jpg" alt="Sala de aula elegante com luz natural" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.h1 initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6
            }} className="heading-display text-4xl md:text-5xl lg:text-6xl text-white mb-6">
                Bosque de Francisco
              </motion.h1>
              <motion.p initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6,
              delay: 0.2
            }} className="text-xl md:text-2xl text-white/95 leading-relaxed max-w-2xl mx-auto">
                "A folha só se transforma em remédio se for despertada pelo canto das sassanhas. Só o encantamento pelo verbo é capaz de dotar a folha do poder da cura. Veneno e remédio, afinal, moram na mesma planta." - Luiz Antonio Simas
              </motion.p>
            </div>
        </section>

          <section id="proximas-aulas" className="py-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.5
            }} className="text-center mb-12">
                <h2 className="heading-section text-3xl md:text-4xl mb-4">Eventos</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Confira a programação dos próximos eventos
                </p>
              </motion.div>

              {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map(i => <div key={i} className="bg-card rounded-2xl p-6 shadow-lg">
                      <div className="h-6 bg-muted rounded mb-4 animate-pulse"></div>
                      <div className="h-4 bg-muted rounded mb-2 animate-pulse"></div>
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                    </div>)}
                </div> : eventos.length === 0 ? <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">Nenhum evento programado no momento</p>
                </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {eventos.map((evento, index) => <motion.div key={evento.id} initial={{
                opacity: 0,
                y: 20
              }} whileInView={{
                opacity: 1,
                y: 0
              }} viewport={{
                once: true
              }} transition={{
                duration: 0.5,
                delay: index * 0.1
              }}>
                      <EventCard event={evento} />
                    </motion.div>)}
                </div>}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};
export default HomePage;
