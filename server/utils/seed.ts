import { storage } from '../storage';
import { MAX_LIVES } from '../../client/src/lib/constants';

// This function initializes the database with seed data
export async function initializeData() {
  try {
    console.log('Inicializando dados...');
    
    // Check if we already have data
    const users = await storage.getUsers();
    if (users && users.length > 0) {
      console.log('Dados já inicializados. Pulando seed.');
      return;
    }
    
    // Create admin user
    await storage.createUser({
      username: 'admin',
      email: 'admin@yoruba.com',
      password: 'admin123',
      role: 'admin'
    });
    
    console.log('Usuário admin criado.');
    
    // Create trails
    const trail1 = await storage.createTrail({
      name: 'Trilha 1',
      theme: 'Saudações',
      order: 1,
      isActive: true
    });
    
    const trail2 = await storage.createTrail({
      name: 'Trilha 2',
      theme: 'Números',
      order: 2,
      isActive: true
    });
    
    const trail3 = await storage.createTrail({
      name: 'Trilha 3',
      theme: 'Cores',
      order: 3,
      isActive: true
    });
    
    console.log('Trilhas criadas.');
    
    // Create levels for trail 1
    const level1Trail1 = await storage.createLevel({
      name: 'Básico',
      color: 'AMARELO',
      xp: 10,
      trailId: trail1.id,
      order: 1
    });
    
    const level2Trail1 = await storage.createLevel({
      name: 'Intermediário',
      color: 'AZUL',
      xp: 15,
      trailId: trail1.id,
      order: 2
    });
    
    const level3Trail1 = await storage.createLevel({
      name: 'Avançado',
      color: 'VERDE',
      xp: 20,
      trailId: trail1.id,
      order: 3
    });
    
    const level4Trail1 = await storage.createLevel({
      name: 'Mestre',
      color: 'DOURADO',
      xp: 30,
      trailId: trail1.id,
      order: 4
    });
    
    // Create levels for trail 2
    const level1Trail2 = await storage.createLevel({
      name: 'Básico',
      color: 'AMARELO',
      xp: 10,
      trailId: trail2.id,
      order: 1
    });
    
    const level2Trail2 = await storage.createLevel({
      name: 'Intermediário',
      color: 'AZUL',
      xp: 15,
      trailId: trail2.id,
      order: 2
    });
    
    const level3Trail2 = await storage.createLevel({
      name: 'Avançado',
      color: 'VERDE',
      xp: 20,
      trailId: trail2.id,
      order: 3
    });
    
    const level4Trail2 = await storage.createLevel({
      name: 'Mestre',
      color: 'DOURADO',
      xp: 30,
      trailId: trail2.id,
      order: 4
    });
    
    // Create levels for trail 3
    const level1Trail3 = await storage.createLevel({
      name: 'Básico',
      color: 'AMARELO',
      xp: 10,
      trailId: trail3.id,
      order: 1
    });
    
    const level2Trail3 = await storage.createLevel({
      name: 'Intermediário',
      color: 'AZUL',
      xp: 15,
      trailId: trail3.id,
      order: 2
    });
    
    const level3Trail3 = await storage.createLevel({
      name: 'Avançado',
      color: 'VERDE',
      xp: 20,
      trailId: trail3.id,
      order: 3
    });
    
    const level4Trail3 = await storage.createLevel({
      name: 'Mestre',
      color: 'DOURADO',
      xp: 30,
      trailId: trail3.id,
      order: 4
    });
    
    console.log('Níveis criados.');
    
    // Create exercises for Trail 1 - Level 1 (Saudações Básico)
    await storage.createExercise({
      question: 'Bom dia',
      type: 'multiple_choice',
      options: JSON.stringify([
        { id: 1, text: 'E kú àárọ̀', isCorrect: true },
        { id: 2, text: 'E kú alẹ́', isCorrect: false },
        { id: 3, text: 'E kú ilẹ̀', isCorrect: false },
        { id: 4, text: 'O dabọ', isCorrect: false }
      ]),
      levelId: level1Trail1.id,
      correctAnswer: null,
      audioUrl: null
    });
    
    await storage.createExercise({
      question: 'Boa tarde',
      type: 'multiple_choice',
      options: JSON.stringify([
        { id: 1, text: 'E kú àárọ̀', isCorrect: false },
        { id: 2, text: 'E kú ọsan', isCorrect: true },
        { id: 3, text: 'E kú ilẹ̀', isCorrect: false },
        { id: 4, text: 'O dabọ', isCorrect: false }
      ]),
      levelId: level1Trail1.id,
      correctAnswer: null,
      audioUrl: null
    });
    
    await storage.createExercise({
      question: 'Boa noite',
      type: 'multiple_choice',
      options: JSON.stringify([
        { id: 1, text: 'E kú àárọ̀', isCorrect: false },
        { id: 2, text: 'E kú ọsan', isCorrect: false },
        { id: 3, text: 'E kú alẹ́', isCorrect: true },
        { id: 4, text: 'O dabọ', isCorrect: false }
      ]),
      levelId: level1Trail1.id,
      correctAnswer: null,
      audioUrl: null
    });
    
    await storage.createExercise({
      question: 'Como você está?',
      type: 'multiple_choice',
      options: JSON.stringify([
        { id: 1, text: 'Báwo ni?', isCorrect: false },
        { id: 2, text: 'Báwo ni o?', isCorrect: false },
        { id: 3, text: 'Báwo ni ọ?', isCorrect: false },
        { id: 4, text: 'Báwo ni o wa?', isCorrect: true }
      ]),
      levelId: level1Trail1.id,
      correctAnswer: null,
      audioUrl: null
    });
    
    await storage.createExercise({
      question: 'Eu estou bem',
      type: 'multiple_choice',
      options: JSON.stringify([
        { id: 1, text: 'Mo wa dada', isCorrect: true },
        { id: 2, text: 'Mo ni dada', isCorrect: false },
        { id: 3, text: 'Mo fe dada', isCorrect: false },
        { id: 4, text: 'Dada ni mo wa', isCorrect: false }
      ]),
      levelId: level1Trail1.id,
      correctAnswer: null,
      audioUrl: null
    });
    
    // Create exercises for Trail 1 - Level 2 (Saudações Intermediário)
    await storage.createExercise({
      question: 'Até logo',
      type: 'multiple_choice',
      options: JSON.stringify([
        { id: 1, text: 'E kú àárọ̀', isCorrect: false },
        { id: 2, text: 'O dabọ', isCorrect: true },
        { id: 3, text: 'E kú alẹ́', isCorrect: false },
        { id: 4, text: 'Adíọs', isCorrect: false }
      ]),
      levelId: level2Trail1.id,
      correctAnswer: null,
      audioUrl: null
    });
    
    await storage.createExercise({
      question: 'Meu nome é ...',
      type: 'fill_blank',
      options: JSON.stringify([
        { id: 1, text: 'Orúkọ mi ni ...', isCorrect: true },
        { id: 2, text: 'Mi ni ...', isCorrect: false },
        { id: 3, text: 'Mi orúkọ ni ...', isCorrect: false }
      ]),
      levelId: level2Trail1.id,
      correctAnswer: 'Orúkọ mi ni ...',
      audioUrl: null
    });
    
    await storage.createExercise({
      question: 'Qual é o seu nome?',
      type: 'multiple_choice',
      options: JSON.stringify([
        { id: 1, text: 'Kí ni orúkọ rẹ?', isCorrect: true },
        { id: 2, text: 'Báwo ni o wa?', isCorrect: false },
        { id: 3, text: 'Níbo ni o wà?', isCorrect: false },
        { id: 4, text: 'Ṣé o ti jẹ?', isCorrect: false }
      ]),
      levelId: level2Trail1.id,
      correctAnswer: null,
      audioUrl: null
    });
    
    // Create exercises for Trail 2 - Level 1 (Números Básico)
    await storage.createExercise({
      question: 'Um',
      type: 'multiple_choice',
      options: JSON.stringify([
        { id: 1, text: 'Ọkan', isCorrect: true },
        { id: 2, text: 'Èjì', isCorrect: false },
        { id: 3, text: 'Ẹta', isCorrect: false },
        { id: 4, text: 'Ẹrin', isCorrect: false }
      ]),
      levelId: level1Trail2.id,
      correctAnswer: null,
      audioUrl: null
    });
    
    await storage.createExercise({
      question: 'Dois',
      type: 'multiple_choice',
      options: JSON.stringify([
        { id: 1, text: 'Ọkan', isCorrect: false },
        { id: 2, text: 'Èjì', isCorrect: true },
        { id: 3, text: 'Ẹta', isCorrect: false },
        { id: 4, text: 'Ẹrin', isCorrect: false }
      ]),
      levelId: level1Trail2.id,
      correctAnswer: null,
      audioUrl: null
    });
    
    await storage.createExercise({
      question: 'Três',
      type: 'multiple_choice',
      options: JSON.stringify([
        { id: 1, text: 'Ọkan', isCorrect: false },
        { id: 2, text: 'Èjì', isCorrect: false },
        { id: 3, text: 'Ẹta', isCorrect: true },
        { id: 4, text: 'Ẹrin', isCorrect: false }
      ]),
      levelId: level1Trail2.id,
      correctAnswer: null,
      audioUrl: null
    });
    
    await storage.createExercise({
      question: 'Quatro',
      type: 'multiple_choice',
      options: JSON.stringify([
        { id: 1, text: 'Ọkan', isCorrect: false },
        { id: 2, text: 'Èjì', isCorrect: false },
        { id: 3, text: 'Ẹta', isCorrect: false },
        { id: 4, text: 'Ẹrin', isCorrect: true }
      ]),
      levelId: level1Trail2.id,
      correctAnswer: null,
      audioUrl: null
    });
    
    await storage.createExercise({
      question: 'Cinco',
      type: 'multiple_choice',
      options: JSON.stringify([
        { id: 1, text: 'Àrún', isCorrect: true },
        { id: 2, text: 'Ẹfà', isCorrect: false },
        { id: 3, text: 'Èje', isCorrect: false },
        { id: 4, text: 'Ẹjọ', isCorrect: false }
      ]),
      levelId: level1Trail2.id,
      correctAnswer: null,
      audioUrl: null
    });
    
    // Create exercises for Trail 3 - Level 1 (Cores Básico)
    await storage.createExercise({
      question: 'Vermelho',
      type: 'multiple_choice',
      options: JSON.stringify([
        { id: 1, text: 'Pupa', isCorrect: true },
        { id: 2, text: 'Dudu', isCorrect: false },
        { id: 3, text: 'Funfun', isCorrect: false },
        { id: 4, text: 'Awọ ewe', isCorrect: false }
      ]),
      levelId: level1Trail3.id,
      correctAnswer: null,
      audioUrl: null
    });
    
    await storage.createExercise({
      question: 'Azul',
      type: 'multiple_choice',
      options: JSON.stringify([
        { id: 1, text: 'Pupa', isCorrect: false },
        { id: 2, text: 'Bluù', isCorrect: true },
        { id: 3, text: 'Funfun', isCorrect: false },
        { id: 4, text: 'Awọ ewe', isCorrect: false }
      ]),
      levelId: level1Trail3.id,
      correctAnswer: null,
      audioUrl: null
    });
    
    await storage.createExercise({
      question: 'Verde',
      type: 'multiple_choice',
      options: JSON.stringify([
        { id: 1, text: 'Pupa', isCorrect: false },
        { id: 2, text: 'Dudu', isCorrect: false },
        { id: 3, text: 'Funfun', isCorrect: false },
        { id: 4, text: 'Awọ ewe', isCorrect: true }
      ]),
      levelId: level1Trail3.id,
      correctAnswer: null,
      audioUrl: null
    });
    
    await storage.createExercise({
      question: 'Branco',
      type: 'multiple_choice',
      options: JSON.stringify([
        { id: 1, text: 'Pupa', isCorrect: false },
        { id: 2, text: 'Dudu', isCorrect: false },
        { id: 3, text: 'Funfun', isCorrect: true },
        { id: 4, text: 'Awọ ewe', isCorrect: false }
      ]),
      levelId: level1Trail3.id,
      correctAnswer: null,
      audioUrl: null
    });
    
    await storage.createExercise({
      question: 'Preto',
      type: 'multiple_choice',
      options: JSON.stringify([
        { id: 1, text: 'Pupa', isCorrect: false },
        { id: 2, text: 'Dudu', isCorrect: true },
        { id: 3, text: 'Funfun', isCorrect: false },
        { id: 4, text: 'Awọ ewe', isCorrect: false }
      ]),
      levelId: level1Trail3.id,
      correctAnswer: null,
      audioUrl: null
    });
    
    console.log('Exercícios criados.');
    console.log('Dados inicializados com sucesso!');
    
  } catch (error) {
    console.error('Erro ao inicializar dados:', error);
  }
}

// Helper function to get all users (using the storage interface)
async function getUsers() {
  return await storage.getUsers();
}
