import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/user-context';
import { EXERCISE_TYPES } from '@/lib/constants';

interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface Exercise {
  id: number;
  type: string;
  question: string;
  options: Option[];
  correctAnswer?: string;
  audioUrl?: string;
}

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise | null;
  pathName: string;
  levelName: string;
  levelNumber: number;
  onComplete: (correct: boolean) => void;
  progress: number;
  totalExercises: number;
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({ 
  isOpen, 
  onClose, 
  exercise, 
  pathName, 
  levelName,
  levelNumber,
  onComplete,
  progress,
  totalExercises
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const { userStats } = useUser();
  
  useEffect(() => {
    if (isOpen) {
      setSelectedOption(null);
      setShowResult(false);
    }
  }, [isOpen, exercise]);
  
  if (!exercise) return null;
  
  const handleOptionSelect = (optionId: number) => {
    if (showResult) return;
    setSelectedOption(optionId);
  };
  
  const checkAnswer = () => {
    if (!selectedOption) return;
    
    const correct = exercise.options.find(opt => opt.id === selectedOption)?.isCorrect || false;
    setIsCorrect(correct);
    setShowResult(true);
    
    // Timeout to show the result before proceeding
    setTimeout(() => {
      onComplete(correct);
      setShowResult(false);
    }, 1500);
  };
  
  const playAudio = () => {
    if (exercise.audioUrl) {
      const audio = new Audio(`/audio/${exercise.audioUrl}`);
      audio.play();
    }
  };
  
  const progressPercentage = Math.round((progress / totalExercises) * 100);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="bg-primary p-4 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="material-icons">school</span>
              <DialogTitle className="font-heading font-bold">
                Nível {levelNumber}: {levelName}
              </DialogTitle>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <span className="material-icons text-red-400">favorite</span>
                <span className="ml-1">{userStats.lives}</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-primary-light h-1 mt-4 rounded-full">
            <div className="bg-secondary h-1 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </DialogHeader>
        
        <div className="p-6">
          <h4 className="text-lg font-medium text-center mb-6">
            {exercise.type === EXERCISE_TYPES.MULTIPLE_CHOICE ? 'Traduza para Yorùbá:' :
             exercise.type === EXERCISE_TYPES.FILL_BLANK ? 'Complete a frase:' :
             'Escute e selecione a tradução correta:'}
          </h4>
          
          {/* Question */}
          <div className="text-center mb-6">
            <p className="text-xl font-bold">{exercise.question}</p>
          </div>
          
          {/* Multiple Choice Exercise */}
          <div className="space-y-3">
            {exercise.options.map((option) => (
              <button 
                key={option.id}
                className={`w-full text-left p-3 border-2 rounded-lg transition-colors ${
                  showResult && selectedOption === option.id
                    ? option.isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : selectedOption === option.id
                      ? 'border-primary bg-primary bg-opacity-5'
                      : 'border-gray-300 hover:border-primary hover:bg-primary hover:bg-opacity-5'
                }`}
                onClick={() => handleOptionSelect(option.id)}
              >
                <div className="flex items-center">
                  <div 
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                      selectedOption === option.id 
                        ? showResult
                          ? option.isCorrect
                            ? 'border-green-500'
                            : 'border-red-500'
                          : 'border-primary'
                        : 'border-gray-300'
                    }`}
                  >
                    {showResult && selectedOption === option.id && (
                      <span className="material-icons text-sm">
                        {option.isCorrect ? 'check' : 'close'}
                      </span>
                    )}
                  </div>
                  <span>{option.text}</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Audio playback (if applicable) */}
          {exercise.type === EXERCISE_TYPES.AUDIO && exercise.audioUrl && (
            <div className="mt-6 flex justify-center">
              <button 
                className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 rounded-full"
                onClick={playAudio}
              >
                <span className="material-icons text-primary">volume_up</span>
              </button>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="mt-8">
            <Button 
              className="w-full"
              disabled={selectedOption === null || showResult}
              onClick={checkAnswer}
            >
              Verificar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseModal;
