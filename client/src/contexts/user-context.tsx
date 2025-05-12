import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth-context';
import { MAX_LIVES } from '@/lib/constants';

interface UserStats {
  lives: number;
  maxLives: number;
  diamonds: number;
  xp: number;
  nextLifeAt: string | null;
}

interface UserContextType {
  userStats: UserStats;
  refreshUserStats: () => Promise<void>;
}

const defaultUserStats: UserStats = {
  lives: MAX_LIVES,
  maxLives: MAX_LIVES,
  diamonds: 0,
  xp: 0,
  nextLifeAt: null
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>(defaultUserStats);

  const fetchUserStats = async () => {
    if (!user) {
      setUserStats(defaultUserStats);
      return;
    }

    try {
      const response = await fetch('/api/users/me', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar estatísticas do usuário');
      }

      const data = await response.json();
      setUserStats({
        lives: data.lives,
        maxLives: MAX_LIVES,
        diamonds: data.diamonds,
        xp: data.xp,
        nextLifeAt: data.nextLifeAt
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [user]);

  const refreshUserStats = async () => {
    await fetchUserStats();
  };

  return (
    <UserContext.Provider value={{ userStats, refreshUserStats }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};
