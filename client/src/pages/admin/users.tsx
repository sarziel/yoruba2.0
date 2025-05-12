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
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';

const AdminUsers: React.FC = () => {
  const { isLoading: isAuthLoading, user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | undefined>(undefined);
  
  // Fetch users data
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['/api/admin/users', page],
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
  
  const handleDeleteUser = (user: any) => {
    setUserToDelete(user.id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await apiRequest('DELETE', `/api/admin/users/${userToDelete}`, {});
      
      toast({
        title: 'Usuário excluído',
        description: 'O usuário foi excluído com sucesso.',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir o usuário.',
        variant: 'destructive',
      });
    }
    
    setDeleteDialogOpen(false);
  };
  
  const handleToggleAdmin = async (userData: any) => {
    try {
      await apiRequest('PATCH', `/api/admin/users/${userData.id}/toggle-admin`, {});
      
      toast({
        title: userData.role === 'admin' ? 'Permissão removida' : 'Permissão concedida',
        description: userData.role === 'admin' 
          ? 'Permissão de administrador removida com sucesso.'
          : 'Permissão de administrador concedida com sucesso.',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    } catch (error) {
      console.error('Erro ao alterar permissão:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao alterar a permissão do usuário.',
        variant: 'destructive',
      });
    }
  };
  
  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'username', header: 'Nome de Usuário' },
    { key: 'email', header: 'Email' },
    { 
      key: 'role', 
      header: 'Função',
      cell: (row: any) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {row.role === 'admin' ? 'Administrador' : 'Usuário'}
        </span>
      )
    },
    { key: 'xp', header: 'XP' },
    { key: 'createdAt', header: 'Criado em', cell: (row: any) => new Date(row.createdAt).toLocaleDateString('pt-BR') },
    { 
      key: 'actions',
      header: 'Ações',
      cell: (row: any) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleToggleAdmin(row)}
            className="h-8"
          >
            {row.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
          </Button>
        </div>
      )
    }
  ];
  
  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeItem="users" />
      
      <div className="ml-64 p-6 w-full overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-heading font-bold">Gerenciar Usuários</h2>
        </div>
        
        <DataTable
          columns={columns}
          data={usersData?.users || []}
          isLoading={isUsersLoading}
          onDelete={handleDeleteUser}
          page={page}
          totalPages={usersData?.totalPages || 1}
          onPageChange={setPage}
        />
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita e removerá todos os dados associados ao usuário.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteUser} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminUsers;
