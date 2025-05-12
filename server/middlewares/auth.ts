import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Authentication middleware
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In a real app, we would check session or JWT
    // For now, we'll use a simple user ID in the session
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Não autenticado' });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }
    
    // Attach the user to the request object for use in other middleware/routes
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Admin role middleware
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Permissão de administrador necessária' });
  }
  
  next();
};
