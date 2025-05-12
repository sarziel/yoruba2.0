import { Request, Response } from 'express';
import { storage } from '../storage';

// Get all paths with user progress
export const getUserPaths = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Get all trails with user progress
    const trails = await storage.getUserTrails(userId);
    
    res.status(200).json(trails);
  } catch (error) {
    console.error('Erro ao obter trilhas:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};
