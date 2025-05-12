import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/header';
import Navigation from '@/components/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';

interface LeaderboardUser {
  id: number;
  username: string;
  avatar?: string;
  xp: number;
  rank: number;
}

const Leaderboard: React.FC = () => {
  const { isLoading: isAuthLoading, user } = useAuth();
  const [, navigate] = useLocation();
  const [timeRange, setTimeRange] = useState<'weekly' | 'allTime'>('weekly');
  
  // Fetch leaderboard data
  const { data: leaderboardData, isLoading: isLeaderboardLoading } = useQuery({
    queryKey: ['/api/leaderboard', timeRange],
  });
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);
  
  // Find current user in leaderboard
  const currentUserRank = leaderboardData?.find((entry: LeaderboardUser) => entry.id === user?.id);
  
  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <h2 className="text-2xl font-heading font-bold text-neutral-dark mb-6">Quadro de Líderes</h2>
        
        <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as 'weekly' | 'allTime')}>
          <TabsList className="mb-8">
            <TabsTrigger value="weekly">Semanal</TabsTrigger>
            <TabsTrigger value="allTime">Todos os Tempos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="space-y-6">
            {/* Current user card */}
            {currentUserRank && (
              <Card className="bg-primary-light bg-opacity-10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Sua Posição</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="w-8 text-center font-bold mr-4">
                      #{currentUserRank.rank}
                    </div>
                    <Avatar className="mr-4">
                      <AvatarImage src={currentUserRank.avatar} />
                      <AvatarFallback>{currentUserRank.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">{currentUserRank.username}</h3>
                    </div>
                    <div className="flex items-center text-primary font-bold">
                      <span className="material-icons text-secondary mr-1">star</span>
                      {currentUserRank.xp} XP
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Leaderboard list */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Melhores da Semana</CardTitle>
              </CardHeader>
              <CardContent>
                {isLeaderboardLoading ? (
                  <div className="text-center py-8">Carregando classificação...</div>
                ) : leaderboardData && leaderboardData.length > 0 ? (
                  <div className="space-y-4">
                    {leaderboardData.slice(0, 10).map((entry: LeaderboardUser) => (
                      <div key={entry.id} className="flex items-center">
                        <div className={`w-8 text-center font-bold mr-4 ${
                          entry.rank === 1 ? 'text-level-gold' : 
                          entry.rank === 2 ? 'text-gray-400' : 
                          entry.rank === 3 ? 'text-accent' : ''
                        }`}>
                          #{entry.rank}
                        </div>
                        <Avatar className="mr-4">
                          <AvatarImage src={entry.avatar} />
                          <AvatarFallback>{entry.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium">{entry.username}</h3>
                        </div>
                        <div className="flex items-center text-primary font-bold">
                          <span className="material-icons text-secondary mr-1">star</span>
                          {entry.xp} XP
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">Nenhum dado disponível.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="allTime" className="space-y-6">
            {/* Same structure as weekly, but with all-time data */}
            {currentUserRank && (
              <Card className="bg-primary-light bg-opacity-10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Sua Posição</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="w-8 text-center font-bold mr-4">
                      #{currentUserRank.rank}
                    </div>
                    <Avatar className="mr-4">
                      <AvatarImage src={currentUserRank.avatar} />
                      <AvatarFallback>{currentUserRank.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">{currentUserRank.username}</h3>
                    </div>
                    <div className="flex items-center text-primary font-bold">
                      <span className="material-icons text-secondary mr-1">star</span>
                      {currentUserRank.xp} XP
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Classificação Geral</CardTitle>
              </CardHeader>
              <CardContent>
                {isLeaderboardLoading ? (
                  <div className="text-center py-8">Carregando classificação...</div>
                ) : leaderboardData && leaderboardData.length > 0 ? (
                  <div className="space-y-4">
                    {leaderboardData.slice(0, 10).map((entry: LeaderboardUser) => (
                      <div key={entry.id} className="flex items-center">
                        <div className={`w-8 text-center font-bold mr-4 ${
                          entry.rank === 1 ? 'text-level-gold' : 
                          entry.rank === 2 ? 'text-gray-400' : 
                          entry.rank === 3 ? 'text-accent' : ''
                        }`}>
                          #{entry.rank}
                        </div>
                        <Avatar className="mr-4">
                          <AvatarImage src={entry.avatar} />
                          <AvatarFallback>{entry.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium">{entry.username}</h3>
                        </div>
                        <div className="flex items-center text-primary font-bold">
                          <span className="material-icons text-secondary mr-1">star</span>
                          {entry.xp} XP
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">Nenhum dado disponível.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
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

export default Leaderboard;
