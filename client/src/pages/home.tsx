import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';

const Home: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/paths');
    }
  }, [user, isLoading, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Logo />
            <h1 className="text-white font-heading font-bold text-xl hidden sm:inline-block">Aprendendo Yorùbá</h1>
          </div>
          
          <div>
            <Button 
              variant="link" 
              className="text-white hover:text-secondary mr-4"
              onClick={() => navigate('/login')}
            >
              Entrar
            </Button>
            <Button 
              className="bg-secondary text-primary hover:bg-yellow-400"
              onClick={() => navigate('/register')}
            >
              Cadastrar
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-white py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl font-heading font-bold mb-6">
                Aprenda Yorùbá de forma divertida e eficiente
              </h1>
              <p className="text-white/80 mb-8">
                Comece sua jornada de aprendizado agora mesmo com nossa plataforma gamificada.
              </p>
              <p className="text-lg mb-6">Conheça uma das línguas mais importantes da África Ocidental através de exercícios interativos, desafios e um sistema de aprendizado gamificado.</p>
              <Button 
                size="lg" 
                className="bg-secondary text-primary hover:bg-yellow-400 font-bold"
                onClick={() => navigate('/register')}
              >
                Comece Agora
              </Button>
              </div>
              <div className="md:w-1/2 flex justify-center items-center">
                <div className="w-96 h-96 bg-white rounded-full p-8 flex items-center justify-center">
                  <Logo size="large" />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-heading font-bold text-center mb-12">Por que aprender com a gente?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="rounded-full bg-primary-light w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-white text-2xl">school</span>
                </div>
                <h3 className="text-xl font-heading font-bold mb-2">Metodologia Gamificada</h3>
                <p className="text-gray-600">Aprenda através de desafios, ganhe pontos e avance em trilhas de conhecimento.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="rounded-full bg-level-blue w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-white text-2xl">headphones</span>
                </div>
                <h3 className="text-xl font-heading font-bold mb-2">Áudios Nativos</h3>
                <p className="text-gray-600">Aprenda a pronúncia correta com áudios de falantes nativos de Yorùbá.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="rounded-full bg-level-gold w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-white text-2xl">emoji_events</span>
                </div>
                <h3 className="text-xl font-heading font-bold mb-2">Competição Saudável</h3>
                <p className="text-gray-600">Compare seu progresso com outros alunos no quadro de líderes.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-accent text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-heading font-bold mb-4">Pronto para começar?</h2>
            <p className="text-xl mb-8">Junte-se a milhares de estudantes e mergulhe na cultura Yorùbá</p>
            <Button 
              size="lg" 
              className="bg-secondary text-primary hover:bg-yellow-400 font-bold"
              onClick={() => navigate('/register')}
            >
              Criar Conta Gratuita
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="bg-neutral-dark text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-400">© 2023 Yorùbá History Channel. Todos os direitos reservados.</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Ajuda</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
