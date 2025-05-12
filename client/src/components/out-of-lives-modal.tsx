import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/user-context';
import { EXTRA_LIVES_COST, LIFE_REGENERATION_TIME } from '@/lib/constants';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import GPayButton from './gpay-button';

interface OutOfLivesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OutOfLivesModal: React.FC<OutOfLivesModalProps> = ({ isOpen, onClose }) => {
  const { userStats, refreshUserStats } = useUser();
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  useEffect(() => {
    let interval: number | undefined;
    
    if (isOpen && userStats.nextLifeAt) {
      const updateTimer = () => {
        const now = new Date();
        const nextLifeTime = new Date(userStats.nextLifeAt);
        const diffInMs = nextLifeTime.getTime() - now.getTime();
        
        if (diffInMs <= 0) {
          clearInterval(interval);
          refreshUserStats();
          return;
        }
        
        const minutes = Math.floor(diffInMs / (1000 * 60));
        const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      };
      
      updateTimer();
      interval = window.setInterval(updateTimer, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isOpen, userStats.nextLifeAt, refreshUserStats]);
  
  const handleBuyLives = async () => {
    try {
      await apiRequest('POST', '/api/shop/buy-lives', { diamonds: EXTRA_LIVES_COST });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      refreshUserStats();
      onClose();
    } catch (error) {
      console.error('Erro ao comprar vidas:', error);
    }
  };
  
  const handleReviewLessons = () => {
    // Redirect to review page or show review modal
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <span className="material-icons text-red-500 text-6xl">heart_broken</span>
          </div>
          <DialogTitle className="text-xl font-heading font-bold mb-2">
            Suas vidas acabaram!
          </DialogTitle>
          <p className="text-gray-600 mb-6">Você precisa de vidas para continuar aprendendo.</p>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-2">Próxima vida em:</p>
            <div className="text-xl font-bold font-mono">{timeLeft}</div>
          </div>
          
          <div className="space-y-3">
            <Button
              className="w-full flex items-center justify-between bg-secondary hover:bg-yellow-500 text-neutral-dark"
              disabled={userStats.diamonds < EXTRA_LIVES_COST}
              onClick={handleBuyLives}
            >
              <span>Comprar 5 vidas</span>
              <div className="flex items-center">
                <span className="material-icons text-sm mr-1">diamond</span>
                <span>{EXTRA_LIVES_COST}</span>
              </div>
            </Button>
            
            <GPayButton
              amount={14.9}
              buttonType="buy"
              buttonText="Comprar diamantes"
              onSuccess={() => {
                refreshUserStats();
              }}
            />
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleReviewLessons}
            >
              Revisar lições anteriores
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OutOfLivesModal;
