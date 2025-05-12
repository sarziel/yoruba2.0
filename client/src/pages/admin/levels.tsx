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
import LevelForm from '@/components/admin/level-form';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { LEVEL_COLORS } from '@/lib/constants';

const AdminLevels: React.FC = () => {
  const { isLoading: isAuthLoading, user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState<number | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState<number | undefined>(undefined);
  
  // Fetch levels data
  const { data: levelsData, isLoading: isLevelsLoading } = useQuery({
    queryKey: ['/api/admin/levels', page],
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
  
  const handleCreateLevel = () => {
    setSelectedLevelId(undefined);
    setFormOpen(true);
  };
  
  const handleEditLevel = (level: any) => {
    setSelectedLevelId(level.id);
    setFormOpen(true);
  };
  
  const handleDeleteLevel = (level: any) => {
    setLevelToDelete(level.id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteLevel = async () => {
    if (!levelToDelete) return;
    
    try {
      await apiRequest('DELETE', `/api/admin/levels/${levelToDelete}`, {});
      
      toast({
        title: 'Nível excluído',
        description: 'O nível foi excluído com sucesso.',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/levels'] });
    } catch (error) {
      console.error('Erro ao excluir nível:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir o nível.',
        variant: 'destructive',
      });
    }
    
    setDeleteDialogOpen(false);
  };
  
  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Nome' },
    { 
      key: 'trailName', 
      header: 'Trilha',
      cell: (row: any) => (
        <span>
          {row.trailName} ({row.trailTheme})
        </span>
      )
    },
    { 
      key: 'color', 
      header: 'Cor',
      cell: (row: any) => {
        const bgColor = row.color === 'AMARELO' ? 'bg-[#FFD700]' : 
                         row.color === 'AZUL' ? 'bg-[#1E90FF]' :
                         row.color === 'VERDE' ? 'bg-[#32CD32]' :
                         row.color === 'DOURADO' ? 'bg-[#DAA520]' :
                         'bg-gray-300';
        
        return (
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${bgColor} mr-2`}></div>
            <span>{row.color}</span>
          </div>
        );
      }
    },
    { key: 'xp', header: 'XP' },
    { key: 'order', header: 'Ordem' },
  ];
  
  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeItem="levels" />
      
      <div className="ml-64 p-6 w-full overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-heading font-bold">Gerenciar Níveis</h2>
          <Button
            className="bg-primary hover:bg-primary-light"
            onClick={handleCreateLevel}
          >
            <span className="material-icons mr-1">add</span>
            Novo Nível
          </Button>
        </div>
        
        <DataTable
          columns={columns}
          data={levelsData?.levels || []}
          isLoading={isLevelsLoading}
          onEdit={handleEditLevel}
          onDelete={handleDeleteLevel}
          page={page}
          totalPages={levelsData?.totalPages || 1}
          onPageChange={setPage}
        />
        
        <LevelForm
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          levelId={selectedLevelId}
        />
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Nível</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este nível? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteLevel} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminLevels;
