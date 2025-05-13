import { 
  users, User, InsertUser,
  trails, Trail, InsertTrail,
  levels, Level, InsertLevel,
  exercises, Exercise, InsertExercise,
  userLevels, UserLevel, InsertUserLevel,
  userExercises, UserExercise, InsertUserExercise,
  transactions, Transaction, InsertTransaction
} from "@shared/schema";
import { db } from './db';

// Export storage interface
export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  compareUserPassword(username: string, password: string): Promise<boolean>;
  getUserStats(userId: number): Promise<any>;
  updateUserLives(userId: number, lives: number): Promise<User | undefined>;
  updateUserDiamonds(userId: number, diamonds: number, type?: 'add' | 'subtract'): Promise<User | undefined>;
  updateUserXP(userId: number, xp: number): Promise<User | undefined>;

  // Trails
  getTrails(): Promise<Trail[]>;
  getTrail(id: number): Promise<Trail | undefined>;
  createTrail(trail: InsertTrail): Promise<Trail>;
  updateTrail(id: number, data: Partial<InsertTrail>): Promise<Trail | undefined>;
  deleteTrail(id: number): Promise<boolean>;
  getUserTrails(userId: number): Promise<any[]>;

  // Levels
  getLevels(): Promise<Level[]>;
  getLevel(id: number): Promise<Level | undefined>;
  getLevelsByTrail(trailId: number): Promise<Level[]>;
  createLevel(level: InsertLevel): Promise<Level>;
  updateLevel(id: number, data: Partial<InsertLevel>): Promise<Level | undefined>;
  deleteLevel(id: number): Promise<boolean>;

  // Exercises
  getExercises(): Promise<Exercise[]>;
  getExercise(id: number): Promise<Exercise | undefined>;
  getExercisesByLevel(levelId: number): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(id: number, data: Partial<InsertExercise>): Promise<Exercise | undefined>;
  deleteExercise(id: number): Promise<boolean>;

  // User Progress
  getUserLevel(userId: number, levelId: number): Promise<UserLevel | undefined>;
  getUserLevels(userId: number): Promise<UserLevel[]>;
  createUserLevel(userLevel: InsertUserLevel): Promise<UserLevel>;
  updateUserLevel(userId: number, levelId: number, data: Partial<InsertUserLevel>): Promise<UserLevel | undefined>;
  getUserExercise(userId: number, exerciseId: number): Promise<UserExercise | undefined>;
  getUserExercises(userId: number, levelId?: number): Promise<UserExercise[]>;
  createUserExercise(userExercise: InsertUserExercise): Promise<UserExercise>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: 'pending' | 'completed' | 'failed'): Promise<Transaction | undefined>;

  // Leaderboard
  getLeaderboard(timeRange?: 'weekly' | 'allTime'): Promise<any[]>;

  // Admin
  getAdminStats(): Promise<any>;
}

export const storage: IStorage = db;