import { 
  users, User, InsertUser,
  trails, Trail, InsertTrail,
  levels, Level, InsertLevel,
  exercises, Exercise, InsertExercise,
  userLevels, UserLevel, InsertUserLevel,
  userExercises, UserExercise, InsertUserExercise,
  transactions, Transaction, InsertTransaction
} from "@shared/schema";
import * as bcrypt from 'bcrypt';

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  compareUserPassword(username: string, password: string): Promise<boolean>;
  getUserStats(userId: number): Promise<any>;
  updateUserLives(userId: number, lives: number): Promise<User | undefined>;
  updateUserDiamonds(userId: number, diamonds: number, type: 'add' | 'subtract'): Promise<User | undefined>;
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private trails: Map<number, Trail>;
  private levels: Map<number, Level>;
  private exercises: Map<number, Exercise>;
  private userLevels: Map<string, UserLevel>;
  private userExercises: Map<string, UserExercise>;
  private transactions: Map<number, Transaction>;
  
  private userCurrentId: number;
  private trailCurrentId: number;
  private levelCurrentId: number;
  private exerciseCurrentId: number;
  private userLevelCurrentId: number;
  private userExerciseCurrentId: number;
  private transactionCurrentId: number;
  
  constructor() {
    this.users = new Map();
    this.trails = new Map();
    this.levels = new Map();
    this.exercises = new Map();
    this.userLevels = new Map();
    this.userExercises = new Map();
    this.transactions = new Map();
    
    this.userCurrentId = 1;
    this.trailCurrentId = 1;
    this.levelCurrentId = 1;
    this.exerciseCurrentId = 1;
    this.userLevelCurrentId = 1;
    this.userExerciseCurrentId = 1;
    this.transactionCurrentId = 1;
  }
  
  // Users methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { 
      id,
      username: insertUser.username,
      email: insertUser.email || null,
      password: hashedPassword,
      role: insertUser.role || 'user',
      xp: 0,
      diamonds: 0,
      lives: 5,
      nextLifeAt: null,
      createdAt: now
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    // Hash password if present
    let hashedPassword = user.password;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }
    
    const updatedUser: User = {
      ...user,
      ...data,
      password: hashedPassword,
      id
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  async compareUserPassword(username: string, password: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    if (!user) return false;
    
    return bcrypt.compare(password, user.password);
  }
  
  async getUserStats(userId: number): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) return null;
    
    // Get completed trails and levels
    const userLevels = await this.getUserLevels(userId);
    const completedLevels = userLevels.filter(level => level.completed);
    
    // Get completed trails
    const trailCompletionStatus = new Map<number, boolean>();
    const trails = await this.getTrails();
    
    for (const trail of trails) {
      const trailLevels = await this.getLevelsByTrail(trail.id);
      const allLevelsCompleted = trailLevels.every(level => {
        const userLevel = userLevels.find(ul => ul.levelId === level.id);
        return userLevel && userLevel.completed;
      });
      
      trailCompletionStatus.set(trail.id, allLevelsCompleted);
    }
    
    const completedTrails = Array.from(trailCompletionStatus.entries())
      .filter(([_, completed]) => completed)
      .length;
    
    // Get correct exercises
    const userExercises = await this.getUserExercises(userId);
    const correctExercises = userExercises.filter(ex => ex.correct);
    
    // Recent activities
    const recentActivities = [
      // From userExercises (most recent first)
      ...userExercises
        .map(ex => ({
          type: 'exercise_completed',
          description: `Exercício completo: ${ex.correct ? 'Correto' : 'Incorreto'}`,
          createdAt: ex.createdAt
        })),
      
      // From userLevels (completed levels)
      ...completedLevels
        .filter(level => level.completedAt)
        .map(level => ({
          type: 'level_completed',
          description: `Nível concluído: ${this.getLevelString(level.levelId)}`,
          createdAt: level.completedAt || level.createdAt
        }))
    ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);
    
    return {
      xp: user.xp,
      diamonds: user.diamonds,
      lives: user.lives,
      completedLevels: completedLevels.length,
      completedTrails,
      correctExercises: correctExercises.length,
      createdAt: user.createdAt,
      recentActivities
    };
  }
  
  private async getLevelString(levelId: number): Promise<string> {
    const level = await this.getLevel(levelId);
    if (!level) return `Nível ID ${levelId}`;
    
    const trail = await this.getTrail(level.trailId);
    if (!trail) return `${level.name} (ID ${levelId})`;
    
    return `${level.name} da trilha ${trail.name}`;
  }
  
  async updateUserLives(userId: number, lives: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      lives
    };
    
    // Set the nextLifeAt timestamp if lives < 5
    if (lives < 5) {
      const nextLifeTime = new Date();
      nextLifeTime.setMinutes(nextLifeTime.getMinutes() + 30); // 30 minutes for next life
      updatedUser.nextLifeAt = nextLifeTime;
    } else {
      updatedUser.nextLifeAt = null;
    }
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserDiamonds(userId: number, diamonds: number, type: 'add' | 'subtract' = 'add'): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedDiamonds = type === 'add' 
      ? user.diamonds + diamonds 
      : Math.max(0, user.diamonds - diamonds);
    
    const updatedUser: User = {
      ...user,
      diamonds: updatedDiamonds
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserXP(userId: number, xp: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      xp: user.xp + xp
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Trails methods
  async getTrails(): Promise<Trail[]> {
    return Array.from(this.trails.values())
      .sort((a, b) => a.order - b.order);
  }
  
  async getTrail(id: number): Promise<Trail | undefined> {
    return this.trails.get(id);
  }
  
  async createTrail(insertTrail: InsertTrail): Promise<Trail> {
    const id = this.trailCurrentId++;
    const now = new Date();
    const trail: Trail = { ...insertTrail, id, createdAt: now };
    
    this.trails.set(id, trail);
    return trail;
  }
  
  async updateTrail(id: number, data: Partial<InsertTrail>): Promise<Trail | undefined> {
    const trail = this.trails.get(id);
    if (!trail) return undefined;
    
    const updatedTrail: Trail = { ...trail, ...data, id };
    this.trails.set(id, updatedTrail);
    return updatedTrail;
  }
  
  async deleteTrail(id: number): Promise<boolean> {
    // First delete all levels associated with this trail
    const trailLevels = await this.getLevelsByTrail(id);
    for (const level of trailLevels) {
      await this.deleteLevel(level.id);
    }
    
    return this.trails.delete(id);
  }
  
  async getUserTrails(userId: number): Promise<any[]> {
    const user = await this.getUser(userId);
    if (!user) return [];
    
    const trails = await this.getTrails();
    const userLevels = await this.getUserLevels(userId);
    
    const result = [];
    
    for (const trail of trails) {
      const levels = await this.getLevelsByTrail(trail.id);
      
      // Sort levels by order
      levels.sort((a, b) => a.order - b.order);
      
      const levelsWithProgress = levels.map(level => {
        const userLevel = userLevels.find(ul => ul.levelId === level.id) || {
          completed: false,
          current: false
        };
        
        return {
          id: level.id,
          name: level.name,
          color: level.color,
          xp: level.xp,
          order: level.order,
          completed: userLevel.completed,
          current: userLevel.current
        };
      });
      
      // Determine trail status
      // - in_progress: if any level is current or completed
      // - active: if previous trail is completed
      // - locked: otherwise
      
      const anyLevelActive = levelsWithProgress.some(level => level.current || level.completed);
      const previousTrailIndex = trail.order - 2; // -1 for zero index, -1 for previous
      
      let status = 'locked';
      
      if (anyLevelActive) {
        status = 'in_progress';
      } else if (previousTrailIndex < 0) {
        // First trail is always active
        status = 'active';
      } else if (previousTrailIndex >= 0 && trails[previousTrailIndex]) {
        const previousTrailLevels = await this.getLevelsByTrail(trails[previousTrailIndex].id);
        const previousTrailCompleted = previousTrailLevels.every(level => {
          const userLevel = userLevels.find(ul => ul.levelId === level.id);
          return userLevel && userLevel.completed;
        });
        
        if (previousTrailCompleted) {
          status = 'active';
        }
      }
      
      result.push({
        id: trail.id,
        name: trail.name,
        theme: trail.theme,
        order: trail.order,
        levels: levelsWithProgress,
        status
      });
    }
    
    return result;
  }
  
  // Levels methods
  async getLevels(): Promise<Level[]> {
    return Array.from(this.levels.values())
      .sort((a, b) => {
        // Sort by trail ID first, then by order within trail
        if (a.trailId !== b.trailId) {
          return a.trailId - b.trailId;
        }
        return a.order - b.order;
      });
  }
  
  async getLevel(id: number): Promise<Level | undefined> {
    return this.levels.get(id);
  }
  
  async getLevelsByTrail(trailId: number): Promise<Level[]> {
    return Array.from(this.levels.values())
      .filter(level => level.trailId === trailId)
      .sort((a, b) => a.order - b.order);
  }
  
  async createLevel(insertLevel: InsertLevel): Promise<Level> {
    const id = this.levelCurrentId++;
    const now = new Date();
    const level: Level = { ...insertLevel, id, createdAt: now };
    
    this.levels.set(id, level);
    return level;
  }
  
  async updateLevel(id: number, data: Partial<InsertLevel>): Promise<Level | undefined> {
    const level = this.levels.get(id);
    if (!level) return undefined;
    
    const updatedLevel: Level = { ...level, ...data, id };
    this.levels.set(id, updatedLevel);
    return updatedLevel;
  }
  
  async deleteLevel(id: number): Promise<boolean> {
    // First delete all exercises associated with this level
    const levelExercises = await this.getExercisesByLevel(id);
    for (const exercise of levelExercises) {
      await this.deleteExercise(exercise.id);
    }
    
    return this.levels.delete(id);
  }
  
  // Exercises methods
  async getExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }
  
  async getExercise(id: number): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }
  
  async getExercisesByLevel(levelId: number): Promise<Exercise[]> {
    return Array.from(this.exercises.values())
      .filter(exercise => exercise.levelId === levelId);
  }
  
  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = this.exerciseCurrentId++;
    const now = new Date();
    const exercise: Exercise = { ...insertExercise, id, createdAt: now };
    
    this.exercises.set(id, exercise);
    return exercise;
  }
  
  async updateExercise(id: number, data: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const exercise = this.exercises.get(id);
    if (!exercise) return undefined;
    
    const updatedExercise: Exercise = { ...exercise, ...data, id };
    this.exercises.set(id, updatedExercise);
    return updatedExercise;
  }
  
  async deleteExercise(id: number): Promise<boolean> {
    return this.exercises.delete(id);
  }
  
  // User Progress methods
  async getUserLevel(userId: number, levelId: number): Promise<UserLevel | undefined> {
    const key = `${userId}-${levelId}`;
    return this.userLevels.get(key);
  }
  
  async getUserLevels(userId: number): Promise<UserLevel[]> {
    return Array.from(this.userLevels.values())
      .filter(userLevel => userLevel.userId === userId);
  }
  
  async createUserLevel(insertUserLevel: InsertUserLevel): Promise<UserLevel> {
    const id = this.userLevelCurrentId++;
    const now = new Date();
    const userLevel: UserLevel = { 
      ...insertUserLevel, 
      id, 
      createdAt: now,
      completedAt: null
    };
    
    const key = `${userLevel.userId}-${userLevel.levelId}`;
    this.userLevels.set(key, userLevel);
    return userLevel;
  }
  
  async updateUserLevel(userId: number, levelId: number, data: Partial<InsertUserLevel>): Promise<UserLevel | undefined> {
    const key = `${userId}-${levelId}`;
    const userLevel = this.userLevels.get(key);
    if (!userLevel) return undefined;
    
    const now = new Date();
    const updatedUserLevel: UserLevel = { 
      ...userLevel,
      ...data,
      completedAt: data.completed && !userLevel.completed ? now : userLevel.completedAt
    };
    
    this.userLevels.set(key, updatedUserLevel);
    return updatedUserLevel;
  }
  
  async getUserExercise(userId: number, exerciseId: number): Promise<UserExercise | undefined> {
    const key = `${userId}-${exerciseId}`;
    return this.userExercises.get(key);
  }
  
  async getUserExercises(userId: number, levelId?: number): Promise<UserExercise[]> {
    let userExercises = Array.from(this.userExercises.values())
      .filter(userExercise => userExercise.userId === userId);
    
    if (levelId !== undefined) {
      // Filter by level ID
      const levelExercises = await this.getExercisesByLevel(levelId);
      const levelExerciseIds = new Set(levelExercises.map(e => e.id));
      
      userExercises = userExercises.filter(ue => 
        levelExerciseIds.has(ue.exerciseId)
      );
    }
    
    return userExercises;
  }
  
  async createUserExercise(insertUserExercise: InsertUserExercise): Promise<UserExercise> {
    const id = this.userExerciseCurrentId++;
    const now = new Date();
    const userExercise: UserExercise = { ...insertUserExercise, id, createdAt: now };
    
    const key = `${userExercise.userId}-${userExercise.exerciseId}`;
    this.userExercises.set(key, userExercise);
    return userExercise;
  }
  
  // Transactions methods
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionCurrentId++;
    const now = new Date();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt: now,
      completedAt: null
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  async updateTransactionStatus(id: number, status: 'pending' | 'completed' | 'failed'): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const now = new Date();
    const updatedTransaction: Transaction = { 
      ...transaction,
      status,
      completedAt: status === 'completed' ? now : transaction.completedAt
    };
    
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  // Leaderboard methods
  async getLeaderboard(timeRange: 'weekly' | 'allTime' = 'allTime'): Promise<any[]> {
    const users = Array.from(this.users.values());
    
    // For weekly, we need to filter userExercises and calculate XP from that
    if (timeRange === 'weekly') {
      const now = new Date();
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const userScores = new Map<number, number>();
      
      // Calculate XP from exercises completed in the last week
      const userExercises = Array.from(this.userExercises.values())
        .filter(ue => ue.correct && new Date(ue.createdAt) >= oneWeekAgo);
      
      for (const ue of userExercises) {
        const exercise = this.exercises.get(ue.exerciseId);
        if (!exercise) continue;
        
        const level = this.levels.get(exercise.levelId);
        if (!level) continue;
        
        const userId = ue.userId;
        userScores.set(userId, (userScores.get(userId) || 0) + level.xp);
      }
      
      // Sort and format the results
      const leaderboard = users
        .map(user => ({
          id: user.id,
          username: user.username,
          avatar: undefined,
          xp: userScores.get(user.id) || 0
        }))
        .filter(entry => entry.xp > 0)
        .sort((a, b) => b.xp - a.xp)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));
      
      return leaderboard;
    } else {
      // All-time leaderboard uses total XP from user
      const leaderboard = users
        .map(user => ({
          id: user.id,
          username: user.username,
          avatar: undefined,
          xp: user.xp
        }))
        .filter(entry => entry.xp > 0)
        .sort((a, b) => b.xp - a.xp)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));
      
      return leaderboard;
    }
  }
  
  // Admin methods
  async getAdminStats(): Promise<any> {
    const users = Array.from(this.users.values());
    const trails = Array.from(this.trails.values());
    const levels = Array.from(this.levels.values());
    const exercises = Array.from(this.exercises.values());
    const transactions = Array.from(this.transactions.values());
    
    // Get recent users
    const recentUsers = users
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }));
    
    // Get recent transactions
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(async (transaction) => {
        const user = await this.getUser(transaction.userId);
        return {
          id: transaction.id,
          username: user ? user.username : 'Usuário Excluído',
          amount: transaction.amount,
          description: transaction.description,
          status: transaction.status,
          createdAt: transaction.createdAt
        };
      });
    
    return {
      usersCount: users.length,
      trailsCount: trails.length,
      levelsCount: levels.length,
      exercisesCount: exercises.length,
      recentUsers,
      recentTransactions: await Promise.all(recentTransactions)
    };
  }
}

export const storage = new MemStorage();
