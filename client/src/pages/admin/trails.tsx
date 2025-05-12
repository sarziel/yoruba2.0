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
import TrailForm from '@/components/admin/trail-form';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';

const AdminTrails: React.FC = () => {
  const { isLoading: isAuthLoading, user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTrailId, setSelectedTrailId] = useState<number | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trailToDelete, setTrailToDelete] = useState<number | undefined>(undefined);
  
  // Fetch trails data
  const { data: trailsData, isLoading: isTrailsLoading } = useQuery({
    queryKey: ['/api/admin/trails', page],
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
  
  const handleCreateTrail = () => {
    setSelectedTrailId(undefined);
    setFormOpen(true);
  };
  
  const handleEditTrail = (trail: any) => {
    setSelectedTrailId(trail.id);
    setFormOpen(true);
  };
  
  const handleDeleteTrail = (trail: any) => {
    setTrailToDelete(trail.id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteTrail = async () => {
    if (!trailToDelete) return;
    
    try {
      await apiRequest('DELETE', `/api/admin/trails/${trailToDelete}`, {});
      
      toast({
        title: 'Trilha excluída',
        description: 'A trilha foi excluída com sucesso.',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/trails'] });
    } catch (error) {
      console.error('Erro ao excluir trilha:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir a trilha.',
        variant: 'destructive',
      });
    }
    
    setDeleteDialogOpen(false);
  };
  
  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Nome' },
    { key: 'theme', header: 'Tema' },
    { key: 'order', header: 'Ordem' },
    { 
      key: 'isActive', 
      header: 'Status',
      cell: (row: any) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.isActive ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
  ];
  
  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeItem="trails" />
      
      <div className="ml-64 p-6 w-full overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-heading font-bold">Gerenciar Trilhas</h2>
          <Button
            className="bg-primary hover:bg-primary-light"
            onClick={handleCreateTrail}
          >
            <span className="material-icons mr-1">add</span>
            Nova Trilha
          </Button>
        </div>
        
        <DataTable
          columns={columns}
          data={trailsData?.trails || []}
          isLoading={isTrailsLoading}
          onEdit={handleEditTrail}
          onDelete={handleDeleteTrail}
          page={page}
          totalPages={trailsData?.totalPages || 1}
          onPageChange={setPage}
        />
        
        <TrailForm
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          trailId={selectedTrailId}
        />
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Trilha</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta trilha? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteTrail} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminTrails;
