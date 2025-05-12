import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { insertTrailSchema, insertLevelSchema, insertExerciseSchema } from '@shared/schema';
import * as fs from 'fs';
import * as path from 'path';
import { MAX_LIVES } from '../../client/src/lib/constants';

// Get admin dashboard stats
export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await storage.getAdminStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// TRAILS CONTROLLERS
// Get all trails
export const getTrails = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;
    
    const trails = await storage.getTrails();
    
    // Pagination
    const startIndex = (page - 1) * pageSize;
    const paginatedTrails = trails.slice(startIndex, startIndex + pageSize);
    
    res.status(200).json({
      trails: paginatedTrails,
      totalPages: Math.ceil(trails.length / pageSize),
      currentPage: page
    });
  } catch (error) {
    console.error('Erro ao obter trilhas:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Get a single trail
export const getTrail = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const trail = await storage.getTrail(id);
    
    if (!trail) {
      return res.status(404).json({ message: 'Trilha não encontrada' });
    }
    
    res.status(200).json(trail);
  } catch (error) {
    console.error('Erro ao obter trilha:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Create new trail
export const createTrail = async (req: Request, res: Response) => {
  try {
    const validationResult = insertTrailSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validationResult.error.errors 
      });
    }
    
    const newTrail = await storage.createTrail(validationResult.data);
    
    res.status(201).json(newTrail);
  } catch (error) {
    console.error('Erro ao criar trilha:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Update trail
export const updateTrail = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const validationResult = insertTrailSchema.partial().safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validationResult.error.errors 
      });
    }
    
    const updatedTrail = await storage.updateTrail(id, validationResult.data);
    
    if (!updatedTrail) {
      return res.status(404).json({ message: 'Trilha não encontrada' });
    }
    
    res.status(200).json(updatedTrail);
  } catch (error) {
    console.error('Erro ao atualizar trilha:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Delete trail
export const deleteTrail = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteTrail(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Trilha não encontrada' });
    }
    
    res.status(200).json({ message: 'Trilha excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir trilha:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// LEVELS CONTROLLERS
// Get all levels
export const getLevels = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;
    
    const levels = await storage.getLevels();
    
    // Get trail information for each level
    const levelsWithTrailInfo = await Promise.all(levels.map(async (level) => {
      const trail = await storage.getTrail(level.trailId);
      return {
        ...level,
        trailName: trail?.name || 'Desconhecido',
        trailTheme: trail?.theme || 'Desconhecido'
      };
    }));
    
    // Pagination
    const startIndex = (page - 1) * pageSize;
    const paginatedLevels = levelsWithTrailInfo.slice(startIndex, startIndex + pageSize);
    
    res.status(200).json({
      levels: paginatedLevels,
      totalPages: Math.ceil(levels.length / pageSize),
      currentPage: page
    });
  } catch (error) {
    console.error('Erro ao obter níveis:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Get a single level
export const getLevel = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const level = await storage.getLevel(id);
    
    if (!level) {
      return res.status(404).json({ message: 'Nível não encontrado' });
    }
    
    res.status(200).json(level);
  } catch (error) {
    console.error('Erro ao obter nível:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Create new level
export const createLevel = async (req: Request, res: Response) => {
  try {
    const validationResult = insertLevelSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validationResult.error.errors 
      });
    }
    
    // Check if trail exists
    const trail = await storage.getTrail(validationResult.data.trailId);
    if (!trail) {
      return res.status(404).json({ message: 'Trilha não encontrada' });
    }
    
    const newLevel = await storage.createLevel(validationResult.data);
    
    res.status(201).json(newLevel);
  } catch (error) {
    console.error('Erro ao criar nível:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Update level
export const updateLevel = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const validationResult = insertLevelSchema.partial().safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validationResult.error.errors 
      });
    }
    
    // If trailId is being updated, check if trail exists
    if (validationResult.data.trailId) {
      const trail = await storage.getTrail(validationResult.data.trailId);
      if (!trail) {
        return res.status(404).json({ message: 'Trilha não encontrada' });
      }
    }
    
    const updatedLevel = await storage.updateLevel(id, validationResult.data);
    
    if (!updatedLevel) {
      return res.status(404).json({ message: 'Nível não encontrado' });
    }
    
    res.status(200).json(updatedLevel);
  } catch (error) {
    console.error('Erro ao atualizar nível:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Delete level
export const deleteLevel = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteLevel(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Nível não encontrado' });
    }
    
    res.status(200).json({ message: 'Nível excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir nível:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// EXERCISES CONTROLLERS
// Get all exercises
export const getExercises = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;
    
    const exercises = await storage.getExercises();
    
    // Get level and trail information for each exercise
    const exercisesWithInfo = await Promise.all(exercises.map(async (exercise) => {
      const level = await storage.getLevel(exercise.levelId);
      const trail = level ? await storage.getTrail(level.trailId) : null;
      
      return {
        ...exercise,
        levelName: level?.name || 'Desconhecido',
        trailName: trail?.name || 'Desconhecido'
      };
    }));
    
    // Pagination
    const startIndex = (page - 1) * pageSize;
    const paginatedExercises = exercisesWithInfo.slice(startIndex, startIndex + pageSize);
    
    res.status(200).json({
      exercises: paginatedExercises,
      totalPages: Math.ceil(exercises.length / pageSize),
      currentPage: page
    });
  } catch (error) {
    console.error('Erro ao obter exercícios:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Get a single exercise
export const getExercise = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const exercise = await storage.getExercise(id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercício não encontrado' });
    }
    
    // Parse options from JSON string to object
    const exerciseWithParsedOptions = {
      ...exercise,
      options: JSON.parse(exercise.options)
    };
    
    res.status(200).json(exerciseWithParsedOptions);
  } catch (error) {
    console.error('Erro ao obter exercício:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Create new exercise
export const createExercise = async (req: Request, res: Response) => {
  try {
    const { question, type, options, levelId, correctAnswer, audioUrl } = req.body;
    
    if (!question || !type || !options || !levelId) {
      return res.status(400).json({ message: 'Dados incompletos' });
    }
    
    // Check if level exists
    const level = await storage.getLevel(parseInt(levelId));
    if (!level) {
      return res.status(404).json({ message: 'Nível não encontrado' });
    }
    
    // Handle file upload for audio if present
    let finalAudioUrl = audioUrl;
    if (req.file) {
      const audioFile = req.file;
      const uploadDir = path.join(process.cwd(), 'public', 'audio');
      
      // Ensure the upload directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const fileName = `${Date.now()}-${audioFile.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      
      fs.writeFileSync(filePath, audioFile.buffer);
      finalAudioUrl = fileName;
    }
    
    // Convert options to JSON string if it's an object
    const optionsString = typeof options === 'string' 
      ? options 
      : JSON.stringify(options);
    
    const newExercise = await storage.createExercise({
      question,
      type,
      options: optionsString,
      levelId: parseInt(levelId),
      correctAnswer: correctAnswer || null,
      audioUrl: finalAudioUrl || null
    });
    
    res.status(201).json(newExercise);
  } catch (error) {
    console.error('Erro ao criar exercício:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Update exercise
export const updateExercise = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { question, type, options, levelId, correctAnswer, audioUrl } = req.body;
    
    // Check if exercise exists
    const exercise = await storage.getExercise(id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercício não encontrado' });
    }
    
    // If levelId is being updated, check if level exists
    if (levelId && parseInt(levelId) !== exercise.levelId) {
      const level = await storage.getLevel(parseInt(levelId));
      if (!level) {
        return res.status(404).json({ message: 'Nível não encontrado' });
      }
    }
    
    // Handle file upload for audio if present
    let finalAudioUrl = audioUrl || exercise.audioUrl;
    if (req.file) {
      const audioFile = req.file;
      const uploadDir = path.join(process.cwd(), 'public', 'audio');
      
      // Ensure the upload directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const fileName = `${Date.now()}-${audioFile.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      
      fs.writeFileSync(filePath, audioFile.buffer);
      finalAudioUrl = fileName;
      
      // Remove old audio file if it exists
      if (exercise.audioUrl) {
        const oldFilePath = path.join(uploadDir, exercise.audioUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }
    
    // Convert options to JSON string if it's an object and provided
    const optionsString = options 
      ? (typeof options === 'string' ? options : JSON.stringify(options))
      : exercise.options;
    
    const updatedExercise = await storage.updateExercise(id, {
      question: question || exercise.question,
      type: type || exercise.type,
      options: optionsString,
      levelId: levelId ? parseInt(levelId) : exercise.levelId,
      correctAnswer: correctAnswer !== undefined ? correctAnswer : exercise.correctAnswer,
      audioUrl: finalAudioUrl
    });
    
    res.status(200).json(updatedExercise);
  } catch (error) {
    console.error('Erro ao atualizar exercício:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Delete exercise
export const deleteExercise = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Get exercise to check if it has an audio file
    const exercise = await storage.getExercise(id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercício não encontrado' });
    }
    
    // Remove audio file if it exists
    if (exercise.audioUrl) {
      const audioPath = path.join(process.cwd(), 'public', 'audio', exercise.audioUrl);
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    }
    
    const deleted = await storage.deleteExercise(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Exercício não encontrado' });
    }
    
    res.status(200).json({ message: 'Exercício excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir exercício:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// USERS CONTROLLERS
// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;
    
    const users = Array.from((await storage.getUser(0))?.values() || []);
    
    // Pagination
    const startIndex = (page - 1) * pageSize;
    const paginatedUsers = users.slice(startIndex, startIndex + pageSize);
    
    res.status(200).json({
      users: paginatedUsers.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        xp: user.xp,
        createdAt: user.createdAt
      })),
      totalPages: Math.ceil(users.length / pageSize),
      currentPage: page
    });
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Get a single user
export const getUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      xp: user.xp,
      diamonds: user.diamonds,
      lives: user.lives,
      maxLives: MAX_LIVES,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if user is trying to delete themselves
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Você não pode excluir sua própria conta' });
    }
    
    const deleted = await storage.deleteUser(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.status(200).json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Toggle admin role
export const toggleAdmin = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if user is trying to change their own role
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Você não pode alterar sua própria função' });
    }
    
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Toggle role
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const updatedUser = await storage.updateUser(id, { role: newRole });
    
    res.status(200).json({
      id: updatedUser?.id,
      username: updatedUser?.username,
      role: updatedUser?.role
    });
  } catch (error) {
    console.error('Erro ao alterar função de usuário:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// TRANSACTIONS CONTROLLERS
// Get all transactions
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;
    
    const transactions = await storage.getTransactions();
    
    // Get user information for each transaction
    const transactionsWithUserInfo = await Promise.all(transactions.map(async (transaction) => {
      const user = await storage.getUser(transaction.userId);
      return {
        ...transaction,
        username: user ? user.username : 'Usuário Excluído'
      };
    }));
    
    // Pagination
    const startIndex = (page - 1) * pageSize;
    const paginatedTransactions = transactionsWithUserInfo.slice(startIndex, startIndex + pageSize);
    
    res.status(200).json({
      transactions: paginatedTransactions,
      totalPages: Math.ceil(transactions.length / pageSize),
      currentPage: page
    });
  } catch (error) {
    console.error('Erro ao obter transações:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};
