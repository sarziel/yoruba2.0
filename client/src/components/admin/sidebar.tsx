import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import Logo from '@/components/logo';
import { 
  Route, 
  Dumbbell, 
  FileQuestion, 
  Users, 
  Receipt, 
  Home, 
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeItem?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem = 'trails' }) => {
  const [location] = useLocation();
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
  };
  
  const isActive = (path: string) => {
    return location === `/admin/${path}` || (path === '' && location === '/admin');
  };
  
  return (
    <div className="w-64 bg-neutral-dark h-screen fixed left-0 top-0 text-white p-4 overflow-y-auto">
      <div className="mb-8">
        <div className="flex flex-col items-center mb-4">
          <Logo size="medium" />
          <h2 className="text-xl font-heading font-bold mt-2">Painel Admin</h2>
          <p className="text-gray-400 text-sm">Yorùbá History Channel</p>
        </div>
      </div>
      
      <nav className="space-y-1">
        <Link href="/admin/trails">
          <a className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('trails') ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'
          }`}>
            <Route className="w-5 h-5" />
            <span>Trilhas</span>
          </a>
        </Link>
        <Link href="/admin/levels">
          <a className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('levels') ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'
          }`}>
            <Dumbbell className="w-5 h-5" />
            <span>Níveis</span>
          </a>
        </Link>
        <Link href="/admin/exercises">
          <a className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('exercises') ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'
          }`}>
            <FileQuestion className="w-5 h-5" />
            <span>Exercícios</span>
          </a>
        </Link>
        <Link href="/admin/users">
          <a className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('users') ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'
          }`}>
            <Users className="w-5 h-5" />
            <span>Usuários</span>
          </a>
        </Link>
        <Link href="/admin/transactions">
          <a className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('transactions') ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'
          }`}>
            <Receipt className="w-5 h-5" />
            <span>Transações</span>
          </a>
        </Link>
      </nav>
      
      <div className="absolute bottom-4 left-0 w-full px-4">
        <Link href="/">
          <a className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
            <Home className="w-5 h-5" />
            <span>Voltar ao App</span>
          </a>
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
