import React, { createContext, useContext, useState, useEffect } from 'react';
import * as AuthService from '@/lib/auth';

interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (data: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Erro ao buscar usuário atual:', err);
        setError('Falha ao verificar autenticação');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await AuthService.login(credentials);
      setUser(userData);
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Nome de usuário ou senha incorretos');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { username: string; email: string; password: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await AuthService.register(data);
      setUser(userData);
    } catch (err) {
      console.error('Erro no registro:', err);
      setError('Não foi possível criar sua conta');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
    } catch (err) {
      console.error('Erro no logout:', err);
      setError('Falha ao sair');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
