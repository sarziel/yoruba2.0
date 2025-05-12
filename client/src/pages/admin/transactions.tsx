import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/admin/sidebar';
import DataTable from '@/components/admin/table';
import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';

const AdminTransactions: React.FC = () => {
  const { isLoading: isAuthLoading, user } = useAuth();
  const [, navigate] = useLocation();
  
  const [page, setPage] = useState(1);
  
  // Fetch transactions data
  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['/api/admin/transactions', page],
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
  
  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'username', header: 'Usuário' },
    { key: 'description', header: 'Descrição' },
    { 
      key: 'amount', 
      header: 'Valor (R$)',
      cell: (row: any) => (
        <span className="font-medium">
          {parseFloat(row.amount).toFixed(2)}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      cell: (row: any) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.status === 'completed' ? 'bg-green-100 text-green-800' : 
          row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {row.status === 'completed' ? 'Concluído' : 
           row.status === 'pending' ? 'Pendente' : 
           'Falhou'}
        </span>
      )
    },
    { 
      key: 'paymentMethod', 
      header: 'Método',
      cell: (row: any) => (
        <span>
          {row.paymentMethod === 'GOOGLE_PAY' ? 'Google Pay' : row.paymentMethod}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      header: 'Data',
      cell: (row: any) => new Date(row.createdAt).toLocaleString('pt-BR')
    },
  ];
  
  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeItem="transactions" />
      
      <div className="ml-64 p-6 w-full overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-heading font-bold">Transações</h2>
        </div>
        
        <DataTable
          columns={columns}
          data={transactionsData?.transactions || []}
          isLoading={isTransactionsLoading}
          page={page}
          totalPages={transactionsData?.totalPages || 1}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default AdminTransactions;
