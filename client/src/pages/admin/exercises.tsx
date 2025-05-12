import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import Sidebar from '@/components/admin/sidebar';
import DataTable from '@/components/admin/table';
import ExerciseForm from '@/components/admin/exercise-form';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { EXERCISE_TYPES } from '@/lib/constants';

const AdminExercises: React.FC = () => {
  const { isLoading: isAuthLoading, user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<number | undefined>(undefined);
  
  // Fetch exercises data
  const { data: exercisesData, isLoading: isExercisesLoading } = useQuery({
    queryKey: ['/api/admin/exercises', page],
  });
  
  // Redirect if not authenticated or not admin
  React.useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        navigate('/login');
      } else if (user.role !== 'admin') {
        navigate('/paths');
      }
    }
  }, [user, isAuthLoading, navigate]);
  
  const handleCreateExercise = () => {
    setSelectedExerciseId(undefined);
    setFormOpen(true);
  };
  
  const handleEditExercise = (exercise: any) => {
    setSelectedExerciseId(exercise.id);
    setFormOpen(true);
  };
  
  const handleDeleteExercise = (exercise: any) => {
    setExerciseToDelete(exercise.id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteExercise = async () => {
    if (!exerciseToDelete) return;
    
    try {
      await apiRequest('DELETE', `/api/admin/exercises/${exerciseToDelete}`, {});
      
      toast({
        title: 'Exercício excluído',
        description: 'O exercício foi excluído com sucesso.',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/exercises'] });
    } catch (error) {
      console.error('Erro ao excluir exercício:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir o exercício.',
        variant: 'destructive',
      });
    }
    
    setDeleteDialogOpen(false);
  };
  
  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'question', header: 'Questão' },
    { 
      key: 'type', 
      header: 'Tipo',
      cell: (row: any) => {
        const typeName = row.type === EXERCISE_TYPES.MULTIPLE_CHOICE ? 'Múltipla Escolha' : 
                        row.type === EXERCISE_TYPES.FILL_BLANK ? 'Preencher Lacuna' :
                        row.type === EXERCISE_TYPES.AUDIO ? 'Áudio' : 'Desconhecido';
        
        return <span>{typeName}</span>;
      }
    },
    { 
      key: 'levelName', 
      header: 'Nível',
      cell: (row: any) => (
        <span>
          {row.levelName} (Trilha: {row.trailName})
        </span>
      )
    },
    { 
      key: 'hasAudio', 
      header: 'Áudio',
      cell: (row: any) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.audioUrl ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.audioUrl ? 'Sim' : 'Não'}
        </span>
      )
    },
  ];
  
  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeItem="exercises" />
      
      <div className="ml-64 p-6 w-full overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-heading font-bold">Gerenciar Exercícios</h2>
          <Button
            className="bg-primary hover:bg-primary-light"
            onClick={handleCreateExercise}
          >
            <span className="material-icons mr-1">add</span>
            Novo Exercício
          </Button>
        </div>
        
        <DataTable
          columns={columns}
          data={exercisesData?.exercises || []}
          isLoading={isExercisesLoading}
          onEdit={handleEditExercise}
          onDelete={handleDeleteExercise}
          page={page}
          totalPages={exercisesData?.totalPages || 1}
          onPageChange={setPage}
        />
        
        <ExerciseForm
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          exerciseId={selectedExerciseId}
        />
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Exercício</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este exercício? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteExercise} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminExercises;
