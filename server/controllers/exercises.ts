import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { DIAMONDS_PER_LEVEL } from '../../client/src/lib/constants';

// Schema for recording exercise progress
const progressSchema = z.object({
  levelId: z.number().int().positive(),
  exerciseId: z.number().int().positive(),
  correct: z.boolean()
});

// Schema for getting exercises
const getExercisesSchema = z.object({
  levelId: z.string().transform(val => parseInt(val)),
  first: z.string().optional()
});

// Get exercises for a specific level
export const getExercises = async (req: Request, res: Response) => {
  try {
    const validationResult = getExercisesSchema.safeParse(req.query);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validationResult.error.errors 
      });
    }
    
    const { levelId, first } = validationResult.data;
    const userId = req.user.id;
    
    // Get all exercises for the level
    const exercises = await storage.getExercisesByLevel(levelId);
    
    if (exercises.length === 0) {
      return res.status(404).json({ message: 'Nenhum exercício encontrado para este nível' });
    }
    
    // Check if this is the first request (to start a level)
    if (first) {
      // Get the user's progress for this level
      let userLevel = await storage.getUserLevel(userId, levelId);
      
      // If there's no user level record yet, create one
      if (!userLevel) {
        // First, check if user has completed the previous levels
        const level = await storage.getLevel(levelId);
        if (!level) {
          return res.status(404).json({ message: 'Nível não encontrado' });
        }
        
        const trail = await storage.getTrail(level.trailId);
        if (!trail) {
          return res.status(404).json({ message: 'Trilha não encontrada' });
        }
        
        // Find the previous level
        let previousLevelId: number | null = null;
        
        // Check if this is the first level of the first trail
        if (!(trail.order === 1 && level.order === 1)) {
          if (level.order > 1) {
            // Previous level in the same trail
            const levels = await storage.getLevelsByTrail(level.trailId);
            const previousLevel = levels.find(l => l.order === level.order - 1);
            if (previousLevel) previousLevelId = previousLevel.id;
          } else {
            // Last level of the previous trail
            const trails = await storage.getTrails();
            const previousTrail = trails.find(t => t.order === trail.order - 1);
            if (previousTrail) {
              const previousTrailLevels = await storage.getLevelsByTrail(previousTrail.id);
              const lastLevel = previousTrailLevels.sort((a, b) => b.order - a.order)[0];
              if (lastLevel) previousLevelId = lastLevel.id;
            }
          }
          
          if (previousLevelId) {
            const previousUserLevel = await storage.getUserLevel(userId, previousLevelId);
            if (!previousUserLevel || !previousUserLevel.completed) {
              return res.status(403).json({ 
                message: 'Você precisa completar o nível anterior primeiro',
                previousLevelIncomplete: true
              });
            }
          }
        }
        
        // Create new user level record
        userLevel = await storage.createUserLevel({
          userId,
          levelId,
          completed: false,
          current: true
        });
        
        // Mark previous level as not current
        if (previousLevelId) {
          await storage.updateUserLevel(userId, previousLevelId, { current: false });
        }
      }
      
      // Get the first exercise that the user hasn't completed yet
      const userExercises = await storage.getUserExercises(userId, levelId);
      const completedExerciseIds = new Set(userExercises.map(ue => ue.exerciseId));
      
      const nextExercise = exercises.find(ex => !completedExerciseIds.has(ex.id));
      
      if (!nextExercise) {
        // User has completed all exercises but not the level
        if (!userLevel.completed) {
          // Mark level as completed
          await storage.updateUserLevel(userId, levelId, { completed: true, current: false });
          
          // Award XP and diamonds
          const level = await storage.getLevel(levelId);
          if (level) {
            await storage.updateUserXP(userId, level.xp);
            
            // Award diamonds based on level color
            let diamondsToAward = 1; // Default
            if (level.color === 'AMARELO') diamondsToAward = DIAMONDS_PER_LEVEL.AMARELO;
            else if (level.color === 'AZUL') diamondsToAward = DIAMONDS_PER_LEVEL.AZUL;
            else if (level.color === 'VERDE') diamondsToAward = DIAMONDS_PER_LEVEL.VERDE;
            else if (level.color === 'DOURADO') diamondsToAward = DIAMONDS_PER_LEVEL.DOURADO;
            
            await storage.updateUserDiamonds(userId, diamondsToAward, 'add');
          }
          
          // Find the next level in the same trail
          const currentLevel = await storage.getLevel(levelId);
          if (currentLevel) {
            const levels = await storage.getLevelsByTrail(currentLevel.trailId);
            const nextLevel = levels.find(l => l.order === currentLevel.order + 1);
            
            if (nextLevel) {
              // Set next level as current
              const nextUserLevel = await storage.getUserLevel(userId, nextLevel.id);
              if (!nextUserLevel) {
                await storage.createUserLevel({
                  userId,
                  levelId: nextLevel.id,
                  completed: false,
                  current: true
                });
              } else {
                await storage.updateUserLevel(userId, nextLevel.id, { current: true });
              }
            }
          }
        }
        
        return res.status(200).json({
          message: 'Todos os exercícios foram concluídos',
          levelCompleted: true
        });
      }
      
      // Return the exercise with parsed options
      const exerciseWithParsedOptions = {
        ...nextExercise,
        options: JSON.parse(nextExercise.options)
      };
      
      return res.status(200).json({
        exercise: exerciseWithParsedOptions,
        progress: completedExerciseIds.size,
        totalExercises: exercises.length
      });
    } else {
      // Return all exercises for the level
      const exercisesWithParsedOptions = exercises.map(ex => ({
        ...ex,
        options: JSON.parse(ex.options)
      }));
      
      res.status(200).json(exercisesWithParsedOptions);
    }
  } catch (error) {
    console.error('Erro ao obter exercícios:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Record user progress on an exercise
export const recordProgress = async (req: Request, res: Response) => {
  try {
    const validationResult = progressSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validationResult.error.errors 
      });
    }
    
    const { levelId, exerciseId, correct } = validationResult.data;
    const userId = req.user.id;
    
    // Check if exercise exists
    const exercise = await storage.getExercise(exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercício não encontrado' });
    }
    
    // Check if level matches the exercise
    if (exercise.levelId !== levelId) {
      return res.status(400).json({ message: 'O exercício não pertence a este nível' });
    }
    
    // Record the user's attempt
    await storage.createUserExercise({
      userId,
      exerciseId,
      correct
    });
    
    // Get all exercises for the level
    const exercises = await storage.getExercisesByLevel(levelId);
    
    // Get user exercises for this level
    const userExercises = await storage.getUserExercises(userId, levelId);
    const completedExerciseIds = new Set(userExercises.map(ue => ue.exerciseId));
    
    // Check if all exercises are completed
    if (completedExerciseIds.size >= exercises.length) {
      // Mark level as completed
      await storage.updateUserLevel(userId, levelId, { completed: true, current: false });
      
      // Award XP and diamonds
      const levelData = await storage.getLevel(levelId);
      if (levelData) {
        await storage.updateUserXP(userId, levelData.xp);
        
        // Award diamonds based on level color
        let diamondsToAward = 1; // Default
        if (levelData.color === 'AMARELO') diamondsToAward = DIAMONDS_PER_LEVEL.AMARELO;
        else if (levelData.color === 'AZUL') diamondsToAward = DIAMONDS_PER_LEVEL.AZUL;
        else if (levelData.color === 'VERDE') diamondsToAward = DIAMONDS_PER_LEVEL.VERDE;
        else if (levelData.color === 'DOURADO') diamondsToAward = DIAMONDS_PER_LEVEL.DOURADO;
        
        await storage.updateUserDiamonds(userId, diamondsToAward, 'add');
      }
      
      // Find the next level in the same trail
      const currentLevel = await storage.getLevel(levelId);
      if (currentLevel) {
        const levels = await storage.getLevelsByTrail(currentLevel.trailId);
        const nextLevel = levels.find(l => l.order === currentLevel.order + 1);
        
        if (nextLevel) {
          // Set next level as current
          const nextUserLevel = await storage.getUserLevel(userId, nextLevel.id);
          if (!nextUserLevel) {
            await storage.createUserLevel({
              userId,
              levelId: nextLevel.id,
              completed: false,
              current: true
            });
          } else {
            await storage.updateUserLevel(userId, nextLevel.id, { current: true });
          }
        }
      }
      
      return res.status(200).json({
        message: 'Nível completo!',
        levelCompleted: true
      });
    }
    
    // Find the next exercise that the user hasn't completed yet
    const nextExercise = exercises.find(ex => !completedExerciseIds.has(ex.id));
    
    if (nextExercise) {
      // Return the next exercise with parsed options
      const exerciseWithParsedOptions = {
        ...nextExercise,
        options: JSON.parse(nextExercise.options)
      };
      
      return res.status(200).json({
        nextExercise: exerciseWithParsedOptions,
        progress: completedExerciseIds.size,
        totalExercises: exercises.length
      });
    } else {
      // This should not happen, but just in case
      return res.status(200).json({
        message: 'Todos os exercícios foram concluídos',
        levelCompleted: true
      });
    }
  } catch (error) {
    console.error('Erro ao registrar progresso:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};
