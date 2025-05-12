import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authMiddleware, adminMiddleware } from './middlewares/auth';
import * as AuthController from './controllers/auth';
import * as PathsController from './controllers/paths';
import * as ExercisesController from './controllers/exercises';
import * as UsersController from './controllers/users';
import * as AdminController from './controllers/admin';
import * as seedData from './utils/seed';

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize seed data
  await seedData.initializeData();
  
  // Auth routes
  app.post('/api/auth/register', AuthController.register);
  app.post('/api/auth/login', AuthController.login);
  app.post('/api/auth/logout', AuthController.logout);
  app.get('/api/auth/me', AuthController.getCurrentUser);
  
  // User routes
  app.get('/api/users/me', authMiddleware, UsersController.getCurrentUser);
  app.get('/api/users/stats', authMiddleware, UsersController.getUserStats);
  app.patch('/api/users/profile', authMiddleware, UsersController.updateProfile);
  app.patch('/api/users/password', authMiddleware, UsersController.updatePassword);
  app.post('/api/users/decrease-lives', authMiddleware, UsersController.decreaseLives);
  
  // Paths routes
  app.get('/api/paths', authMiddleware, PathsController.getUserPaths);
  
  // Exercises routes
  app.get('/api/exercises', authMiddleware, ExercisesController.getExercises);
  app.post('/api/exercises/progress', authMiddleware, ExercisesController.recordProgress);
  
  // Shop routes
  app.post('/api/shop/buy-lives', authMiddleware, UsersController.buyLives);
  app.post('/api/shop/purchase', authMiddleware, UsersController.processPurchase);
  
  // Leaderboard
  app.get('/api/leaderboard', authMiddleware, UsersController.getLeaderboard);
  
  // Admin routes (all require admin auth)
  app.get('/api/admin/stats', authMiddleware, adminMiddleware, AdminController.getStats);
  
  // Admin Trails
  app.get('/api/admin/trails', authMiddleware, adminMiddleware, AdminController.getTrails);
  app.get('/api/admin/trails/:id', authMiddleware, adminMiddleware, AdminController.getTrail);
  app.post('/api/admin/trails', authMiddleware, adminMiddleware, AdminController.createTrail);
  app.patch('/api/admin/trails/:id', authMiddleware, adminMiddleware, AdminController.updateTrail);
  app.delete('/api/admin/trails/:id', authMiddleware, adminMiddleware, AdminController.deleteTrail);
  
  // Admin Levels
  app.get('/api/admin/levels', authMiddleware, adminMiddleware, AdminController.getLevels);
  app.get('/api/admin/levels/:id', authMiddleware, adminMiddleware, AdminController.getLevel);
  app.post('/api/admin/levels', authMiddleware, adminMiddleware, AdminController.createLevel);
  app.patch('/api/admin/levels/:id', authMiddleware, adminMiddleware, AdminController.updateLevel);
  app.delete('/api/admin/levels/:id', authMiddleware, adminMiddleware, AdminController.deleteLevel);
  
  // Admin Exercises
  app.get('/api/admin/exercises', authMiddleware, adminMiddleware, AdminController.getExercises);
  app.get('/api/admin/exercises/:id', authMiddleware, adminMiddleware, AdminController.getExercise);
  app.post('/api/admin/exercises', authMiddleware, adminMiddleware, AdminController.createExercise);
  app.patch('/api/admin/exercises/:id', authMiddleware, adminMiddleware, AdminController.updateExercise);
  app.delete('/api/admin/exercises/:id', authMiddleware, adminMiddleware, AdminController.deleteExercise);
  
  // Admin Users
  app.get('/api/admin/users', authMiddleware, adminMiddleware, AdminController.getUsers);
  app.get('/api/admin/users/:id', authMiddleware, adminMiddleware, AdminController.getUser);
  app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, AdminController.deleteUser);
  app.patch('/api/admin/users/:id/toggle-admin', authMiddleware, adminMiddleware, AdminController.toggleAdmin);
  
  // Admin Transactions
  app.get('/api/admin/transactions', authMiddleware, adminMiddleware, AdminController.getTransactions);

  const httpServer = createServer(app);
  return httpServer;
}
