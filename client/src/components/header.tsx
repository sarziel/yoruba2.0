import React from 'react';
import { Link } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Logo from '@/components/logo';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { userStats } = useUser();
  
  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <header className="bg-primary shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <Logo />
              <h1 className="text-white font-heading font-bold text-xl hidden sm:inline-block">Aprendendo Yorùbá</h1>
            </a>
          </Link>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            {/* Lives */}
            <div className="flex items-center">
              <span className="material-icons text-red-500 heartbeat">favorite</span>
              <span className="text-white font-medium ml-1">{userStats.lives}/{userStats.maxLives}</span>
            </div>
            
            {/* Diamonds */}
            <div className="flex items-center diamond-shine">
              <span className="material-icons text-secondary">diamond</span>
              <span className="text-white font-medium ml-1">{userStats.diamonds}</span>
            </div>
            
            {/* XP Level */}
            <div className="flex items-center bg-primary-light rounded-full px-3 py-1">
              <span className="material-icons text-secondary text-sm">star</span>
              <span className="text-white text-sm font-medium ml-1">{userStats.xp} XP</span>
            </div>
            
            {/* User avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                  <Avatar>
                    <AvatarImage src={user.avatar || ''} alt={user.username} />
                    <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <a className="cursor-pointer">Perfil</a>
                  </Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <a className="cursor-pointer">Painel Admin</a>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        
        {!user && (
          <div>
            <Link href="/login">
              <a className="text-white hover:text-secondary mr-4">Entrar</a>
            </Link>
            <Link href="/register">
              <a className="bg-secondary text-primary px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors">
                Cadastrar
              </a>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
