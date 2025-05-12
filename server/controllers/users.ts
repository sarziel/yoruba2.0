import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { EXTRA_LIVES_COST, MAX_LIVES } from '../../client/src/lib/constants';
import * as bcrypt from 'bcrypt';

// Schema for updating profile
const profileSchema = z.object({
  username: z.string().min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido')
});

// Schema for updating password
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres')
});

// Schema for buying lives
const buyLivesSchema = z.object({
  diamonds: z.number().int().positive()
});

// Schema for processing purchase
const purchaseSchema = z.object({
  paymentMethod: z.enum(['GOOGLE_PAY']),
  amount: z.number().positive(),
  paymentToken: z.string().optional()
});

// Get current user data
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Check if it's time to regenerate a life
    if (user.lives < MAX_LIVES && user.nextLifeAt) {
      const now = new Date();
      const nextLifeAt = new Date(user.nextLifeAt);
      
      if (now >= nextLifeAt) {
        // Regenerate a life
        const newLives = Math.min(user.lives + 1, MAX_LIVES);
        await storage.updateUserLives(userId, newLives);
        user.lives = newLives;
        
        // Set next life regeneration time if needed
        if (newLives < MAX_LIVES) {
          const nextLifeTime = new Date();
          nextLifeTime.setMinutes(nextLifeTime.getMinutes() + 30); // 30 minutes for next life
          user.nextLifeAt = nextLifeTime;
        } else {
          user.nextLifeAt = null;
        }
      }
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
      nextLifeAt: user.nextLifeAt
    });
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Get user stats
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const stats = await storage.getUserStats(userId);
    
    if (!stats) {
      return res.status(404).json({ message: 'Estatísticas não encontradas' });
    }
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const validationResult = profileSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validationResult.error.errors 
      });
    }
    
    const { username, email } = validationResult.data;
    const userId = req.user.id;
    
    // Check if username is already taken by another user
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser && existingUser.id !== userId) {
      return res.status(409).json({ message: 'Nome de usuário já está em uso' });
    }
    
    // Update user
    const updatedUser = await storage.updateUser(userId, { username, email });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.status(200).json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Update password
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const validationResult = passwordSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validationResult.error.errors 
      });
    }
    
    const { currentPassword, newPassword } = validationResult.data;
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Senha atual incorreta' });
    }
    
    // Update password
    await storage.updateUser(userId, { password: newPassword });
    
    res.status(200).json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Decrease lives
export const decreaseLives = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Check if user has lives
    if (user.lives <= 0) {
      return res.status(400).json({ message: 'Sem vidas disponíveis' });
    }
    
    // Decrease lives
    const newLives = user.lives - 1;
    const updatedUser = await storage.updateUserLives(userId, newLives);
    
    res.status(200).json({
      lives: updatedUser?.lives || 0,
      nextLifeAt: updatedUser?.nextLifeAt
    });
  } catch (error) {
    console.error('Erro ao diminuir vidas:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Buy lives with diamonds
export const buyLives = async (req: Request, res: Response) => {
  try {
    const validationResult = buyLivesSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validationResult.error.errors 
      });
    }
    
    const { diamonds } = validationResult.data;
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Check if user has enough diamonds
    if (user.diamonds < diamonds) {
      return res.status(400).json({ message: 'Diamantes insuficientes' });
    }
    
    // Subtract diamonds
    await storage.updateUserDiamonds(userId, diamonds, 'subtract');
    
    // Add lives
    await storage.updateUserLives(userId, MAX_LIVES);
    
    // Record transaction
    await storage.createTransaction({
      userId,
      amount: 0, // No real money involved
      description: 'Compra de vidas com diamantes',
      paymentMethod: 'DIAMONDS',
      status: 'completed',
      paymentToken: null,
      completedAt: new Date()
    });
    
    res.status(200).json({
      message: 'Vidas compradas com sucesso',
      lives: MAX_LIVES,
      diamonds: user.diamonds - diamonds
    });
  } catch (error) {
    console.error('Erro ao comprar vidas:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Process purchase with Google Pay
export const processPurchase = async (req: Request, res: Response) => {
  try {
    const validationResult = purchaseSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validationResult.error.errors 
      });
    }
    
    const { paymentMethod, amount, paymentToken } = validationResult.data;
    const userId = req.user.id;
    
    // Create transaction
    const transaction = await storage.createTransaction({
      userId,
      amount,
      description: 'Compra de diamantes',
      paymentMethod,
      status: 'pending',
      paymentToken: paymentToken || null,
      completedAt: null
    });
    
    // In a real implementation, we would call a payment gateway API
    // For now, we'll just simulate a successful payment
    
    // Award diamonds based on amount
    let diamondsToAward = 0;
    
    if (amount <= 15) {
      diamondsToAward = 100;
    } else if (amount <= 30) {
      diamondsToAward = 250;
    } else if (amount <= 50) {
      diamondsToAward = 500;
    } else {
      diamondsToAward = 1000;
    }
    
    // Update user diamonds
    const updatedUser = await storage.updateUserDiamonds(userId, diamondsToAward, 'add');
    
    // Update transaction
    await storage.updateTransactionStatus(transaction.id, 'completed');
    
    res.status(200).json({
      message: 'Compra processada com sucesso',
      transaction: {
        id: transaction.id,
        status: 'completed'
      },
      diamonds: updatedUser?.diamonds || 0
    });
  } catch (error) {
    console.error('Erro ao processar compra:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Get leaderboard
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const timeRange = req.query.timeRange as 'weekly' | 'allTime' || 'weekly';
    
    const leaderboard = await storage.getLeaderboard(timeRange);
    
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Erro ao obter classificação:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};
