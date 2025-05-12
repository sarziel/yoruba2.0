import React from 'react';
import Header from '@/components/header';
import Navigation from '@/components/navigation';
import GPayButton from '@/components/gpay-button';
import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';
import { DIAMOND_PACKAGES, EXTRA_LIVES_COST } from '@/lib/constants';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/user-context';

const Store: React.FC = () => {
  const { isLoading: isAuthLoading, user } = useAuth();
  const { userStats, refreshUserStats } = useUser();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);
  
  const handleBuyLives = async () => {
    try {
      await apiRequest('POST', '/api/shop/buy-lives', { diamonds: EXTRA_LIVES_COST });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      refreshUserStats();
      toast({
        title: 'Compra realizada',
        description: 'Vidas compradas com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao comprar vidas:', error);
      toast({
        title: 'Erro na compra',
        description: 'Ocorreu um erro ao comprar vidas.',
        variant: 'destructive',
      });
    }
  };
  
  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <h2 className="text-2xl font-heading font-bold text-neutral-dark mb-6">Loja de Diamantes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Diamond packages */}
          {DIAMOND_PACKAGES.map((pkg) => (
            <div key={pkg.id} className={`bg-white rounded-xl shadow-md p-6 ${pkg.id === 1 ? 'border-2 border-primary' : ''}`}>
              <div className="flex">
                <div className="mr-4">
                  <div className={`w-16 h-16 ${pkg.id === 4 ? 'bg-level-gold' : 'bg-secondary'} rounded-lg flex items-center justify-center`}>
                    <span className="material-icons text-white text-3xl">diamond</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-heading font-bold mb-1">{pkg.amount} Diamantes</h3>
                  <p className="text-primary font-medium text-xl mb-4">{pkg.price}</p>
                  <GPayButton 
                    amount={parseFloat(pkg.price.replace('R$ ', '').replace(',', '.'))} 
                    buttonText="Pagar com Google Pay"
                    onSuccess={refreshUserStats}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-heading font-bold mb-4">Use Diamantes para:</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="material-icons text-red-500 mr-3">favorite</span>
              <div>
                <h4 className="font-medium">Comprar Vidas</h4>
                <p className="text-sm text-gray-600">5 vidas por {EXTRA_LIVES_COST} diamantes</p>
                <button 
                  onClick={handleBuyLives}
                  disabled={userStats.diamonds < EXTRA_LIVES_COST}
                  className={`mt-2 px-4 py-2 rounded-lg flex items-center text-sm ${
                    userStats.diamonds >= EXTRA_LIVES_COST 
                      ? 'bg-secondary hover:bg-yellow-500 text-neutral-dark' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span className="material-icons text-sm mr-1">shopping_cart</span>
                  Comprar Agora
                </button>
              </div>
            </div>
            <div className="flex items-start">
              <span className="material-icons text-level-gold mr-3">emoji_events</span>
              <div>
                <h4 className="font-medium">Desbloquear Lições</h4>
                <p className="text-sm text-gray-600">Avance sem completar os níveis anteriores</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="material-icons text-primary mr-3">extension</span>
              <div>
                <h4 className="font-medium">Exercícios Extras</h4>
                <p className="text-sm text-gray-600">Pratique com conteúdo exclusivo</p>
              </div>
            </div>
          </div>
        </div>
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

export default Store;
