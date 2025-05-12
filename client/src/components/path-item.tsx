import React from 'react';
import { LEVEL_COLORS, LEVEL_XP } from '@/lib/constants';

interface Level {
  id: number;
  name: string;
  color: keyof typeof LEVEL_COLORS;
  xp: number;
  completed: boolean;
  current: boolean;
}

interface PathItemProps {
  id: number;
  name: string;
  theme: string;
  status: 'active' | 'in_progress' | 'locked';
  levels: Level[];
  onStartLevel: (pathId: number, levelId: number) => void;
}

const PathItem: React.FC<PathItemProps> = ({ id, name, theme, status, levels, onStartLevel }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-heading font-bold">{name}: {theme}</h3>
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
          status === 'in_progress' ? 'bg-green-100 text-green-800' :
          status === 'active' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status === 'in_progress' ? 'Em progresso' :
           status === 'active' ? 'Disponível' :
           'Bloqueado'}
        </span>
      </div>
      
      {/* Level progression visualization */}
      <div className="relative py-8">
        {/* Connectors */}
        <div className="path-connector w-[calc(100%-100px)] left-[50px]"></div>
        
        {/* Level circles */}
        <div className="flex justify-between relative">
          {levels.map((level) => (
            <div key={level.id} className="flex flex-col items-center">
              <div 
                className={`path-circle w-14 h-14 ${LEVEL_COLORS[level.color]} rounded-full flex items-center justify-center mb-2 border-4 border-white shadow-md ${
                  level.current ? 'animate-pulse' : ''
                } ${!level.completed && !level.current ? 'locked-level' : ''}`}
                onClick={() => {
                  if (level.completed || level.current) {
                    onStartLevel(id, level.id);
                  }
                }}
              >
                <span className="material-icons text-white">
                  {level.completed ? 'check' : level.current ? 'play_arrow' : 'lock'}
                </span>
              </div>
              <span className={`text-sm font-medium ${!level.completed && !level.current ? 'text-gray-400' : 'text-gray-600'}`}>
                Nível {level.id}
              </span>
              <span className={`text-xs ${!level.completed && !level.current ? 'text-gray-400' : 'text-gray-500'}`}>
                {level.xp} XP
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <button 
        className={`w-full ${
          status === 'locked' 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-primary hover:bg-primary-light text-white transition-colors'
        } font-bold py-3 px-4 rounded-lg flex items-center justify-center`}
        onClick={() => {
          if (status !== 'locked') {
            const currentLevel = levels.find(level => level.current);
            if (currentLevel) {
              onStartLevel(id, currentLevel.id);
            }
          }
        }}
        disabled={status === 'locked'}
      >
        <span className="material-icons mr-2">
          {status === 'locked' ? 'lock' : 'play_circle'}
        </span>
        {status === 'locked' 
          ? `Complete a Trilha ${id - 1} para Desbloquear` 
          : status === 'in_progress' 
            ? 'Continuar Aprendendo' 
            : 'Começar'}
      </button>
    </div>
  );
};

export default PathItem;
