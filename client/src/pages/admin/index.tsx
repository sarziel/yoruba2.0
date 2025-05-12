import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Sidebar from '@/components/admin/sidebar';
import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';

const AdminDashboard: React.FC = () => {
  const { isLoading: isAuthLoading, user } = useAuth();
  const [, navigate] = useLocation();
  
  // Fetch admin dashboard stats
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
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
  
  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="ml-64 p-6 w-full overflow-y-auto">
        <h2 className="text-2xl font-heading font-bold mb-6">Dashboard</h2>
        
        {isStatsLoading ? (
          <div className="text-center py-8">Carregando estatísticas...</div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Total de Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.usersCount || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Trilhas Ativas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.trailsCount || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Níveis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.levelsCount || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Exercícios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.exercisesCount || 0}</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usuários Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentUsers.map((user: any) => (
                        <div key={user.id} className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                            <span className="font-medium text-sm">{user.username.substring(0, 2).toUpperCase()}</span>
                          </div>
                          <div>
                            <h3 className="font-medium">{user.username}</h3>
                            <p className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">Nenhum usuário recente.</div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Transações Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentTransactions.map((transaction: any) => (
                        <div key={transaction.id} className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                            <span className="material-icons text-green-600">payments</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{transaction.username}</h3>
                            <p className="text-sm text-gray-500">{transaction.description}</p>
                          </div>
                          <div className="font-bold text-primary">
                            R$ {transaction.amount.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">Nenhuma transação recente.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
