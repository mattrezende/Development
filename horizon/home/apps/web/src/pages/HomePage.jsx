import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
const HomePage = () => {
  const projects = [{
    id: 1,
    title: 'E-Commerce Platform',
    description: 'Plataforma de e-commerce completa com carrinho de compras e checkout integrado',
    technologies: ['React', 'JavaScript', 'TailwindCSS', 'Stripe'],
    image: 'https://images.unsplash.com/photo-1625398122646-049e15c5fb1b',
    link: '#'
  }, {
    id: 2,
    title: 'Dashboard Analytics',
    description: 'Dashboard interativo para visualização de dados e métricas em tempo real',
    technologies: ['React', 'TypeScript', 'Chart.js', 'TailwindCSS'],
    image: 'https://images.unsplash.com/photo-1701698942908-48b9e22c8e12',
    link: '#'
  }, {
    id: 3,
    title: 'Social Media App',
    description: 'Aplicação de rede social com feed, posts e interações em tempo real',
    technologies: ['React', 'JavaScript', 'Firebase', 'TailwindCSS'],
    image: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613',
    link: '#'
  }, {
    id: 4,
    title: 'Portfolio Website',
    description: 'Website de portfólio responsivo com animações e design moderno',
    technologies: ['React', 'JavaScript', 'Framer Motion', 'TailwindCSS'],
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    link: '#'
  }];
  const certifications = [{
    id: 1,
    name: 'React Advanced Course',
    organization: 'Meta',
    date: '2024'
  }, {
    id: 2,
    name: 'JavaScript Mastery',
    organization: 'Udemy',
    date: '2023'
  }, {
    id: 3,
    name: 'Web Development Specialization',
    organization: 'Coursera',
    date: '2023'
  }, {
    id: 4,
    name: 'UI/UX Design Fundamentals',
    organization: 'Google',
    date: '2024'
  }];
  const contactLinks = [{
    name: 'GitHub',
    icon: Github,
    url: 'https://github.com/matheusrezende',
    color: '#0080ff'
  }, {
    name: 'LinkedIn',
    icon: Linkedin,
    url: 'https://linkedin.com/in/matheusrezende',
    color: '#0080ff'
  }, {
    name: 'WhatsApp',
    icon: MessageCircle,
    url: 'https://wa.me/5511999999999',
    color: '#0080ff'
  }, {
    name: 'Email',
    icon: Mail,
    url: 'mailto:matheus@example.com',
    color: '#0080ff'
  }];
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };
  return <>
      <Helmet>
        <title>Matheus Rezende Lopes - Programador Front-End</title>
        <meta name="description" content="Portfolio de Matheus Rezende Lopes, Programador Front-End especializado em React, JavaScript e tecnologias web modernas." />
      </Helmet>

      {/* Hero Section */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden" style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('https://images.unsplash.com/photo-1587637721784-024d2b51e1dd')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} className="text-5xl md:text-7xl font-bold text-white mb-4">
            Matheus Rezende Lopes
          </motion.h1>
          <motion.h2 initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.4
        }} className="text-3xl md:text-4xl font-semibold mb-6" style={{
          color: '#0080ff'
        }}>
            Programador Front-End
          </motion.h2>
          <motion.p initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.6
        }} className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Criando experiências web modernas e interativas 

HTML | CSS | JS | TS | React
          </motion.p>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: '-100px'
        }} transition={{
          duration: 0.6
        }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Projetos
            </h2>
            <p className="text-xl text-muted-foreground">
              Alguns dos meus trabalhos recentes
            </p>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
          once: true,
          margin: '-100px'
        }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map(project => <motion.div key={project.id} variants={itemVariants}>
                <Card className="h-full bg-card border-border shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-2xl text-foreground">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map(tech => <Badge key={tech} variant="secondary" className="bg-secondary text-secondary-foreground">
                          {tech}
                        </Badge>)}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full transition-all duration-300" style={{
                  backgroundColor: '#0080ff'
                }}>
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                        Ver Projeto
                        <ExternalLink size={16} />
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>)}
          </motion.div>
        </div>
      </section>

      {/* Certifications Section */}
      <section id="certifications" className="py-20 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: '-100px'
        }} transition={{
          duration: 0.6
        }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Certificações
            </h2>
            <p className="text-xl text-muted-foreground">
              Educação contínua e desenvolvimento profissional
            </p>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
          once: true,
          margin: '-100px'
        }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certifications.map(cert => <motion.div key={cert.id} variants={itemVariants}>
                <Card className="bg-card border-l-4 border-l-primary shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <CardTitle className="text-xl text-foreground">
                      {cert.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {cert.organization}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-semibold" style={{
                  color: '#0080ff'
                }}>
                      {cert.date}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>)}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: '-100px'
        }} transition={{
          duration: 0.6
        }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Contato
            </h2>
            <p className="text-xl text-muted-foreground">
              Vamos trabalhar juntos
            </p>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{
          once: true,
          margin: '-100px'
        }} className="flex flex-wrap justify-center gap-8">
            {contactLinks.map(link => {
            const Icon = link.icon;
            return <motion.a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" variants={itemVariants} className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 group" style={{
              minWidth: '140px'
            }}>
                  <Icon size={48} className="transition-colors duration-300" style={{
                color: link.color
              }} />
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                    {link.name}
                  </span>
                </motion.a>;
          })}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-secondary/30 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">
            © 2026 Matheus Rezende Lopes. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </>;
};
export default HomePage;