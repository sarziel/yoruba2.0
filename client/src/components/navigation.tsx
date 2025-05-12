import React from 'react';
import { Link, useLocation } from 'wouter';

const Navigation: React.FC = () => {
  const [location] = useLocation();
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between overflow-x-auto whitespace-nowrap">
          <Link href="/paths">
            <a className={`py-3 px-4 font-medium ${location === '/paths' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}>
              Aprender
            </a>
          </Link>
          <Link href="/store">
            <a className={`py-3 px-4 font-medium ${location === '/store' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}>
              Loja
            </a>
          </Link>
          <Link href="/leaderboard">
            <a className={`py-3 px-4 font-medium ${location === '/leaderboard' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}>
              Líderes
            </a>
          </Link>
          <Link href="/profile">
            <a className={`py-3 px-4 font-medium ${location === '/profile' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}>
              Perfil
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
