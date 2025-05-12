import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '@/components/header';
import Navigation from '@/components/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';

const profileSchema = z.object({
  username: z.string().min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const Profile: React.FC = () => {
  const { isLoading: isAuthLoading, user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Fetch user profile data
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['/api/users/me'],
  });
  
  // Fetch user stats and progress
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/users/stats'],
  });
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      email: '',
    },
  });
  
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  // Update form when profile data is loaded
  React.useEffect(() => {
    if (profileData) {
      profileForm.reset({
        username: profileData.username,
        email: profileData.email || '',
      });
    }
  }, [profileData, profileForm]);
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);
  
  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      await apiRequest('PATCH', '/api/users/profile', data);
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar seu perfil.',
        variant: 'destructive',
      });
    }
  };
  
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      await apiRequest('PATCH', '/api/users/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      toast({
        title: 'Senha atualizada',
        description: 'Sua senha foi alterada com sucesso.',
      });
      
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar sua senha. Verifique se a senha atual está correta.',
        variant: 'destructive',
      });
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
        <h2 className="text-2xl font-heading font-bold text-neutral-dark mb-6">Seu Perfil</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User info card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-2xl">{user?.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{user?.username}</CardTitle>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="text-center py-4">Carregando estatísticas...</div>
              ) : statsData ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">XP Total</span>
                    <span className="font-bold flex items-center">
                      <span className="material-icons text-secondary text-sm mr-1">star</span>
                      {statsData.xp}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Diamantes</span>
                    <span className="font-bold flex items-center">
                      <span className="material-icons text-secondary text-sm mr-1">diamond</span>
                      {statsData.diamonds}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Trilhas Completas</span>
                    <span className="font-bold">{statsData.completedTrails}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Níveis Completos</span>
                    <span className="font-bold">{statsData.completedLevels}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Exercícios Corretos</span>
                    <span className="font-bold">{statsData.correctExercises}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Data de Registro</span>
                    <span className="font-bold">{new Date(statsData.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">Nenhuma estatística disponível.</div>
              )}
            </CardContent>
          </Card>
          
          {/* Settings tabs */}
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="profile">Perfil</TabsTrigger>
                  <TabsTrigger value="password">Senha</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome de usuário</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full">
                        Salvar Alterações
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="password">
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha atual</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nova senha</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar nova senha</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full">
                        Alterar Senha
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Recent activity */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="text-center py-4">Carregando atividades...</div>
              ) : statsData?.recentActivities?.length > 0 ? (
                <div className="space-y-4">
                  {statsData.recentActivities.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start border-b pb-4 last:border-0">
                      <div className={`rounded-full p-2 mr-4 ${
                        activity.type === 'level_completed' ? 'bg-green-100 text-green-600' : 
                        activity.type === 'exercise_completed' ? 'bg-blue-100 text-blue-600' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <span className="material-icons">
                          {activity.type === 'level_completed' ? 'emoji_events' : 
                           activity.type === 'exercise_completed' ? 'school' : 
                           'history'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">Nenhuma atividade recente.</div>
              )}
            </CardContent>
          </Card>
        </div>
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

export default Profile;
