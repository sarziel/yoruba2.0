import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Schema for login validation
const loginSchema = z.object({
  username: z.string().min(1, 'Nome de usuário é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Schema for registration validation
const registerSchema = z.object({
  username: z.string().min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

// Login controller
export const login = async (req: Request, res: Response) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validationResult.error.errors 
      });
    }

    const { username, password } = validationResult.data;

    // Check if user exists
    const user = await storage.getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ message: 'Usuário ou senha incorretos' });
    }

    // Verify password
    const isPasswordValid = await storage.compareUserPassword(username, password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Usuário ou senha incorretos' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    return res.json({ token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Register controller
export const register = async (req: Request, res: Response) => {
  try {
    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validationResult.error.errors 
      });
    }

    const { username, email, password } = validationResult.data;

    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);

    if (existingUser) {
      return res.status(409).json({ message: 'Nome de usuário já está em uso' });
    }

    // Create new user
    const newUser = await storage.createUser({
      username,
      email,
      password,
      role: 'user'
    });

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET);
    res.status(201).json({ token });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Logout controller
export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao encerrar sessão:', err);
      return res.status(500).json({ message: 'Erro ao sair' });
    }
    
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logout realizado com sucesso' });
  });
};

// Get current user controller
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const user = await storage.getUser(userId);

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
      lives: user.lives
    });
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};