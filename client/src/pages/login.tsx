import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/logo';

const loginSchema = z.object({
  username: z.string().min(1, 'Nome de usuário é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      toast({
        title: 'Login realizado com sucesso',
        description: 'Bem-vindo ao Aprendendo Yorùbá!',
      });
      navigate('/paths');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast({
        title: 'Erro no login',
        description: 'Usuário ou senha incorretos.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Logo size="large" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-primary">Aprendendo Yorùbá</h1>
          <p className="text-muted-foreground">Yorùbá History Channel</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>Faça login para continuar seu aprendizado</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome de usuário</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome de usuário" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Sua senha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              Não possui uma conta?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
