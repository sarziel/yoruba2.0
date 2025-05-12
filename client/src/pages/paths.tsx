import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/header';
import Navigation from '@/components/navigation';
import PathItem from '@/components/path-item';
import ExerciseModal from '@/components/exercise-modal';
import OutOfLivesModal from '@/components/out-of-lives-modal';
import SuccessModal from '@/components/success-modal';
import { useUser } from '@/contexts/user-context';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DIAMONDS_PER_LEVEL } from '@/lib/constants';

const Paths: React.FC = () => {
  const { isLoading: isAuthLoading, user } = useAuth();
  const { userStats, refreshUserStats } = useUser();
  const [, navigate] = useLocation();
  
  const [currentTab, setCurrentTab] = useState('paths');
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [outOfLivesModalOpen, setOutOfLivesModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  
  const [currentExercise, setCurrentExercise] = useState<any>(null);
  const [currentPathId, setCurrentPathId] = useState<number | null>(null);
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);
  const [exerciseProgress, setExerciseProgress] = useState(0);
  const [currentPathName, setCurrentPathName] = useState('');
  const [currentLevelName, setCurrentLevelName] = useState('');
  const [currentLevelNumber, setCurrentLevelNumber] = useState(0);
  const [totalExercises, setTotalExercises] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [diamondsEarned, setDiamondsEarned] = useState(0);
  
  // Fetch all paths with their levels
  const { data: paths, isLoading: isPathsLoading } = useQuery({
    queryKey: ['/api/paths'],
  });
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);
  
  const handleStartLevel = async (pathId: number, levelId: number) => {
    if (userStats.lives <= 0) {
      setOutOfLivesModalOpen(true);
      return;
    }
    
    try {
      // Get the first exercise of the level
      const response = await fetch(`/api/exercises?levelId=${levelId}&first=true`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Falha ao carregar exercício');
      }
      
      const data = await response.json();
      
      if (data && data.exercise) {
        // Find the path and level names
        const path = paths.find((p: any) => p.id === pathId);
        const level = path?.levels.find((l: any) => l.id === levelId);
        
        setCurrentPathId(pathId);
        setCurrentLevelId(levelId);
        setCurrentExercise(data.exercise);
        setExerciseProgress(data.progress);
        setTotalExercises(data.totalExercises);
        setCurrentPathName(path?.theme || '');
        setCurrentLevelName(level?.name || '');
        setCurrentLevelNumber(level?.order || 0);
        setXpEarned(level?.xp || 0);
        
        // Set diamonds earned based on level color
        if (level?.color === 'AMARELO') {
          setDiamondsEarned(DIAMONDS_PER_LEVEL.AMARELO);
        } else if (level?.color === 'AZUL') {
          setDiamondsEarned(DIAMONDS_PER_LEVEL.AZUL);
        } else if (level?.color === 'VERDE') {
          setDiamondsEarned(DIAMONDS_PER_LEVEL.VERDE);
        } else if (level?.color === 'DOURADO') {
          setDiamondsEarned(DIAMONDS_PER_LEVEL.DOURADO);
        }
        
        setExerciseModalOpen(true);
      }
    } catch (error) {
      console.error('Erro ao carregar exercício:', error);
    }
  };
  
  const handleExerciseComplete = async (correct: boolean) => {
    try {
      // Record the exercise result
      if (!correct) {
        // Decrease lives
        await apiRequest('POST', '/api/users/decrease-lives', {});
        refreshUserStats();
        
        if (userStats.lives <= 1) { // Check for 1 because we haven't refreshed yet
          setExerciseModalOpen(false);
          setOutOfLivesModalOpen(true);
          return;
        }
      }
      
      const response = await apiRequest('POST', '/api/exercises/progress', {
        levelId: currentLevelId,
        exerciseId: currentExercise.id,
        correct
      });
      
      const data = await response.json();
      
      // Check if level is completed
      if (data.levelCompleted) {
        setExerciseModalOpen(false);
        setSuccessModalOpen(true);
        queryClient.invalidateQueries({ queryKey: ['/api/paths'] });
        queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
        refreshUserStats();
        return;
      }
      
      // Get the next exercise
      if (data.nextExercise) {
        setCurrentExercise(data.nextExercise);
        setExerciseProgress(data.progress);
      } else {
        // If no more exercises, close the modal
        setExerciseModalOpen(false);
      }
    } catch (error) {
      console.error('Erro ao registrar progresso:', error);
      setExerciseModalOpen(false);
    }
  };
  
  const handleNextLevel = () => {
    // Find the current path
    const path = paths.find((p: any) => p.id === currentPathId);
    
    // Find the current level index
    const levelIndex = path?.levels.findIndex((l: any) => l.id === currentLevelId);
    
    // If there's a next level, start it
    if (path && levelIndex !== undefined && levelIndex < path.levels.length - 1) {
      const nextLevel = path.levels[levelIndex + 1];
      handleStartLevel(currentPathId!, nextLevel.id);
    } else {
      // If it's the last level of the path, find the next path
      const pathIndex = paths.findIndex((p: any) => p.id === currentPathId);
      
      if (pathIndex !== undefined && pathIndex < paths.length - 1) {
        const nextPath = paths[pathIndex + 1];
        if (nextPath && nextPath.levels && nextPath.levels.length > 0) {
          handleStartLevel(nextPath.id, nextPath.levels[0].id);
        }
      }
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
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="paths">Trilhas</TabsTrigger>
            <TabsTrigger value="practice">Praticar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="paths" className="mb-6">
            <h2 className="text-2xl font-heading font-bold text-neutral-dark mb-6">Trilhas de Aprendizado</h2>
            
            {isPathsLoading ? (
              <div className="text-center py-8">Carregando trilhas...</div>
            ) : paths && paths.length > 0 ? (
              <div>
                {paths.map((path: any) => (
                  <PathItem
                    key={path.id}
                    id={path.id}
                    name={`Trilha ${path.order}`}
                    theme={path.theme}
                    status={path.status}
                    levels={path.levels.map((level: any) => ({
                      id: level.id,
                      name: level.name,
                      color: level.color,
                      xp: level.xp,
                      completed: level.completed,
                      current: level.current,
                    }))}
                    onStartLevel={handleStartLevel}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">Nenhuma trilha disponível.</div>
            )}
          </TabsContent>
          
          <TabsContent value="practice">
            <h2 className="text-2xl font-heading font-bold text-neutral-dark mb-6">Prática Livre</h2>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-gray-600 mb-6">
                Pratique suas habilidades com exercícios aleatórios de níveis que você já completou.
              </p>
              
              <Button 
                className="w-full bg-primary hover:bg-primary-light"
                disabled={!paths || paths.length === 0}
                onClick={() => {
                  // Implement practice mode
                }}
              >
                Iniciar Prática
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Exercise Modal */}
      <ExerciseModal
        isOpen={exerciseModalOpen}
        onClose={() => setExerciseModalOpen(false)}
        exercise={currentExercise}
        pathName={currentPathName}
        levelName={currentLevelName}
        levelNumber={currentLevelNumber}
        onComplete={handleExerciseComplete}
        progress={exerciseProgress}
        totalExercises={totalExercises}
      />
      
      {/* Out of Lives Modal */}
      <OutOfLivesModal
        isOpen={outOfLivesModalOpen}
        onClose={() => setOutOfLivesModalOpen(false)}
      />
      
      {/* Success Modal */}
      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        onNextLevel={handleNextLevel}
        onBackToTrails={() => {
          setSuccessModalOpen(false);
        }}
        pathName={currentPathName}
        levelName={currentLevelName}
        levelNumber={currentLevelNumber}
        xpEarned={xpEarned}
        diamondsEarned={diamondsEarned}
      />
      
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

export default Paths;
