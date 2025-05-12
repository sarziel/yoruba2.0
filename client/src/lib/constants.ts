// Cores dos níveis
export const LEVEL_COLORS = {
  AMARELO: 'bg-[#FFD700]', // Nível 1
  AZUL: 'bg-[#1E90FF]',    // Nível 2
  VERDE: 'bg-[#32CD32]',   // Nível 3
  DOURADO: 'bg-[#DAA520]'  // Nível 4
};

// XP por nível
export const LEVEL_XP = {
  AMARELO: 10,
  AZUL: 15,
  VERDE: 20,
  DOURADO: 30
};

// Custo de vidas extras em diamantes
export const EXTRA_LIVES_COST = 15;

// Pacotes de diamantes
export const DIAMOND_PACKAGES = [
  { id: 1, amount: 100, price: 'R$ 14,90' },
  { id: 2, amount: 250, price: 'R$ 29,90' },
  { id: 3, amount: 500, price: 'R$ 49,90' },
  { id: 4, amount: 1000, price: 'R$ 89,90' }
];

// Tempo de regeneração de vidas em minutos
export const LIFE_REGENERATION_TIME = 30;

// Tipos de exercícios
export const EXERCISE_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  FILL_BLANK: 'fill_blank',
  AUDIO: 'audio'
};

// Número máximo de vidas
export const MAX_LIVES = 5;

// Diamantes ganhos por completar um nível
export const DIAMONDS_PER_LEVEL = {
  AMARELO: 1,
  AZUL: 2,
  VERDE: 3,
  DOURADO: 5
};
