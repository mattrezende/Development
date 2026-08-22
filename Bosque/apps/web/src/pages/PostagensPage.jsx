import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PostCard from '@/components/PostCard.jsx';
import PostModal from '@/components/PostModal.jsx';
import { Input } from '@/components/ui/input';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';

const PostagensPage = () => {
  const [postagens, setPostagens] = useState([]);
  const [filteredPostagens, setFilteredPostagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPostagens = async () => {
      try {
        const records = await apiClient.get('/api/postagens?sort=-createdAt');
        setPostagens(records);
        setFilteredPostagens(records);
      } catch (error) {
        console.error('Erro ao carregar postagens:', error);
        toast.error('Erro ao carregar postagens');
      } finally {
        setLoading(false);
      }
    };

    fetchPostagens();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPostagens(postagens);
    } else {
      const filtered = postagens.filter(
        (post) =>
          post.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (post.subtitulo && post.subtitulo.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredPostagens(filtered);
    }
  }, [searchQuery, postagens]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPost(null), 300); // Wait for transition to finish
  };

  return (
    <>
      <Helmet>
        <title>Postagens - Bosque de Francisco</title>
        <meta name="description" content="Explore todas as postagens e artigos educacionais da Sala Documentada." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header onSearch={handleSearch} />

        <main className="flex-1">
          <section className="py-16 md:py-24 bg-secondary text-secondary-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl"
              >
                <h1 className="heading-display text-4xl md:text-5xl lg:text-6xl mb-6 text-balance font-bold">
                  Postagens & Artigos
                </h1>
                <p className="text-secondary-foreground/80 text-lg md:text-xl leading-relaxed max-w-2xl">
                  Aprofunde seus conhecimentos explorando nossos materiais de estudo, atualizações e reflexões educacionais.
                </p>
              </motion.div>
            </div>
          </section>

          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-12">
                <div className="relative max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por título ou subtítulo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 py-6 text-base rounded-xl bg-card border-border shadow-sm focus-visible:ring-primary"
                  />
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
                      <div className="aspect-video bg-muted/50 animate-pulse"></div>
                      <div className="p-6">
                        <div className="h-6 bg-muted/50 rounded w-1/3 mb-4 animate-pulse"></div>
                        <div className="h-8 bg-muted/50 rounded w-full mb-3 animate-pulse"></div>
                        <div className="h-4 bg-muted/50 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPostagens.length === 0 ? (
                <div className="text-center py-24 bg-card rounded-2xl border border-border">
                  <p className="text-muted-foreground text-xl font-medium">
                    {searchQuery ? 'Nenhuma postagem encontrada para esta busca.' : 'Nenhuma postagem disponível no momento.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPostagens.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <PostCard 
                        post={post} 
                        onClick={handlePostClick} 
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
        
        {/* Render Modal Outside Main Flow */}
        <PostModal 
          post={selectedPost} 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
        />
      </div>
    </>
  );
};

export default PostagensPage;