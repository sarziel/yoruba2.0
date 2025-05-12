import React from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextLevel: () => void;
  onBackToTrails: () => void;
  pathName: string;
  levelName: string;
  levelNumber: number;
  xpEarned: number;
  diamondsEarned: number;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ 
  isOpen, 
  onClose, 
  onNextLevel, 
  onBackToTrails,
  pathName,
  levelName,
  levelNumber,
  xpEarned,
  diamondsEarned
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <span className="material-icons text-green-500 text-4xl">check_circle</span>
            </div>
          </div>
          <DialogTitle className="text-xl font-heading font-bold mb-2">
            Parabéns!
          </DialogTitle>
          <p className="text-gray-600 mb-6">
            Você completou o Nível {levelNumber} da Trilha: {pathName}
          </p>
          
          <div className="flex justify-center items-center space-x-4 mb-6">
            <div className="flex items-center">
              <span className="material-icons text-secondary mr-1">star</span>
              <span className="font-bold">+{xpEarned} XP</span>
            </div>
            <div className="flex items-center">
              <span className="material-icons text-secondary mr-1">diamond</span>
              <span className="font-bold">+{diamondsEarned}</span>
            </div>
          </div>
          
          <Button 
            className="w-full mb-3 bg-primary hover:bg-primary-light"
            onClick={() => {
              onNextLevel();
              onClose();
            }}
          >
            Próximo Nível
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              onBackToTrails();
              onClose();
            }}
          >
            Voltar para Trilhas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
