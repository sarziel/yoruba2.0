import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  BookOpen, 
  ShoppingBag, 
  Trophy, 
  User 
} from 'lucide-react';

const Navigation: React.FC = () => {
  const [location] = useLocation();
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between overflow-x-auto whitespace-nowrap">
          <Link href="/paths">
            <a className={`py-3 px-4 font-medium flex items-center ${location === '/paths' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}>
              <BookOpen className="w-4 h-4 mr-2" />
              Aprender
            </a>
          </Link>
          <Link href="/store">
            <a className={`py-3 px-4 font-medium flex items-center ${location === '/store' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Loja
            </a>
          </Link>
          <Link href="/leaderboard">
            <a className={`py-3 px-4 font-medium flex items-center ${location === '/leaderboard' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}>
              <Trophy className="w-4 h-4 mr-2" />
              Líderes
            </a>
          </Link>
          <Link href="/profile">
            <a className={`py-3 px-4 font-medium flex items-center ${location === '/profile' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}>
              <User className="w-4 h-4 mr-2" />
              Perfil
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
