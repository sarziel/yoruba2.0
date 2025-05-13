import Database from 'better-sqlite3';
import { IStorage } from './storage';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import {
  User, InsertUser,
  Trail, InsertTrail,
  Level, InsertLevel,
  Exercise, InsertExercise,
  UserLevel, InsertUserLevel,
  UserExercise, InsertUserExercise,
  Transaction, InsertTransaction
} from '@shared/schema';

// Ensure directory exists
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export class SqliteStorage implements IStorage {
  private db: Database.Database;

  constructor() {
    this.db = new Database(path.join(dbDir, 'yoruba-app.db'));
    this.initDatabase();
  }

  private initDatabase() {
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'admin')),
        xp INTEGER NOT NULL DEFAULT 0,
        diamonds INTEGER NOT NULL DEFAULT 0,
        lives INTEGER NOT NULL DEFAULT 5,
        nextLifeAt TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS trails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        theme TEXT NOT NULL,
        order_num INTEGER NOT NULL,
        isActive INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT NOT NULL CHECK(color IN ('AMARELO', 'AZUL', 'VERDE', 'DOURADO')),
        xp INTEGER NOT NULL,
        trailId INTEGER NOT NULL,
        order_num INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (trailId) REFERENCES trails(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('multiple_choice', 'fill_blank', 'audio')),
        options TEXT NOT NULL,
        levelId INTEGER NOT NULL,
        correctAnswer TEXT,
        audioUrl TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (levelId) REFERENCES levels(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS user_levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        levelId INTEGER NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        current INTEGER NOT NULL DEFAULT 0,
        completedAt TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (levelId) REFERENCES levels(id) ON DELETE CASCADE,
        UNIQUE(userId, levelId)
      );

      CREATE TABLE IF NOT EXISTS user_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        exerciseId INTEGER NOT NULL,
        correct INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (exerciseId) REFERENCES exercises(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        paymentMethod TEXT NOT NULL CHECK(paymentMethod IN ('GOOGLE_PAY', 'DIAMONDS')),
        status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'failed')),
        paymentToken TEXT,
        completedAt TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  }

  // Users methods
  async getUsers(): Promise<User[]> {
    const rows = this.db.prepare('SELECT * FROM users').all();
    return rows.map(row => this.mapDbRowToUser(row));
  }

  async getUser(id: number): Promise<User | undefined> {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return row ? this.mapDbRowToUser(row) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const row = this.db.prepare('SELECT * FROM users WHERE username = ?').get(username.toLowerCase());
    return row ? this.mapDbRowToUser(row) : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    // Hash password
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const now = new Date().toISOString();

    const result = this.db.prepare(`
      INSERT INTO users (username, email, password, role, xp, diamonds, lives, nextLifeAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user.username.toLowerCase(),
      user.email || null,
      hashedPassword,
      user.role || 'user',
      0,
      0,
      5,
      null,
      now
    );

    const createdUser = await this.getUser(result.lastInsertRowid as number);
    if (!createdUser) {
      throw new Error('Failed to create user');
    }

    return createdUser;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    let hashedPassword = user.password;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    this.db.prepare(`
      UPDATE users SET
        username = ?,
        email = ?,
        password = ?,
        role = ?
      WHERE id = ?
    `).run(
      data.username?.toLowerCase() || user.username,
      data.email || user.email,
      hashedPassword,
      data.role || user.role,
      id
    );

    return await this.getUser(id);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = this.db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  }

  async compareUserPassword(username: string, password: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    if (!user) return false;
    return bcrypt.compare(password, user.password);
  }

  async getUserStats(userId: number): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    // Get completed levels
    const completedLevels = this.db.prepare(`
      SELECT COUNT(*) as count FROM user_levels 
      WHERE userId = ? AND completed = 1
    `).get(userId)?.count || 0;

    // Get correct exercise count
    const correctExercises = this.db.prepare(`
      SELECT COUNT(*) as count FROM user_exercises 
      WHERE userId = ? AND correct = 1
    `).get(userId)?.count || 0;

    // Get current level
    const currentLevelsRows = this.db.prepare(`
      SELECT ul.*, l.name as levelName, l.color as levelColor, t.name as trailName
      FROM user_levels ul
      JOIN levels l ON ul.levelId = l.id
      JOIN trails t ON l.trailId = t.id
      WHERE ul.userId = ? AND ul.current = 1
      ORDER BY t.order_num, l.order_num
    `).all(userId);

    const currentLevels = currentLevelsRows.map(row => ({
      id: row.levelId,
      name: row.levelName,
      color: row.levelColor,
      trailName: row.trailName
    }));

    return {
      xp: user.xp,
      diamonds: user.diamonds,
      lives: user.lives,
      completedLevels,
      correctExercises,
      currentLevels
    };
  }

  async updateUserLives(userId: number, lives: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    let nextLifeAt = null;
    if (lives < 5) {
      // Set next life regeneration in 30 minutes
      const nextLifeTime = new Date();
      nextLifeTime.setMinutes(nextLifeTime.getMinutes() + 30);
      nextLifeAt = nextLifeTime.toISOString();
    }

    this.db.prepare(`
      UPDATE users SET lives = ?, nextLifeAt = ? WHERE id = ?
    `).run(lives, nextLifeAt, userId);

    return await this.getUser(userId);
  }

  async updateUserDiamonds(userId: number, diamonds: number, type: 'add' | 'subtract' = 'add'): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const newDiamonds = type === 'add' 
      ? user.diamonds + diamonds 
      : Math.max(0, user.diamonds - diamonds);

    this.db.prepare(`
      UPDATE users SET diamonds = ? WHERE id = ?
    `).run(newDiamonds, userId);

    return await this.getUser(userId);
  }

  async updateUserXP(userId: number, xp: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const newXP = user.xp + xp;

    this.db.prepare(`
      UPDATE users SET xp = ? WHERE id = ?
    `).run(newXP, userId);

    return await this.getUser(userId);
  }

  // Trails methods
  async getTrails(): Promise<Trail[]> {
    const rows = this.db.prepare('SELECT * FROM trails ORDER BY order_num').all();
    return rows.map(row => this.mapDbRowToTrail(row));
  }

  async getTrail(id: number): Promise<Trail | undefined> {
    const row = this.db.prepare('SELECT * FROM trails WHERE id = ?').get(id);
    return row ? this.mapDbRowToTrail(row) : undefined;
  }

  async createTrail(trail: InsertTrail): Promise<Trail> {
    const now = new Date().toISOString();

    const result = this.db.prepare(`
      INSERT INTO trails (name, theme, order_num, isActive, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      trail.name,
      trail.theme,
      trail.order,
      trail.isActive === false ? 0 : 1,
      now
    );

    const createdTrail = await this.getTrail(result.lastInsertRowid as number);
    if (!createdTrail) {
      throw new Error('Failed to create trail');
    }

    return createdTrail;
  }

  async updateTrail(id: number, data: Partial<InsertTrail>): Promise<Trail | undefined> {
    const trail = await this.getTrail(id);
    if (!trail) return undefined;

    this.db.prepare(`
      UPDATE trails SET
        name = ?,
        theme = ?,
        order_num = ?,
        isActive = ?
      WHERE id = ?
    `).run(
      data.name || trail.name,
      data.theme || trail.theme,
      data.order || trail.order,
      data.isActive === undefined ? trail.isActive ? 1 : 0 : data.isActive ? 1 : 0,
      id
    );

    return await this.getTrail(id);
  }

  async deleteTrail(id: number): Promise<boolean> {
    const result = this.db.prepare('DELETE FROM trails WHERE id = ?').run(id);
    return result.changes > 0;
  }

  async getUserTrails(userId: number): Promise<any[]> {
    // Get all trails with their levels
    const trailsWithLevels = this.db.prepare(`
      SELECT t.*, l.id as levelId, l.name as levelName, l.color as levelColor, 
             l.xp as levelXP, l.order_num as levelOrder,
             ul.completed as levelCompleted, ul.current as levelCurrent 
      FROM trails t
      JOIN levels l ON t.id = l.trailId
      LEFT JOIN user_levels ul ON l.id = ul.levelId AND ul.userId = ?
      ORDER BY t.order_num, l.order_num
    `).all(userId);

    // Group by trail
    const trailMap = new Map<number, any>();

    for (const row of trailsWithLevels) {
      if (!trailMap.has(row.id)) {
        trailMap.set(row.id, {
          id: row.id,
          name: row.name,
          theme: row.theme,
          order: row.order_num,
          isActive: Boolean(row.isActive),
          levels: []
        });
      }

      // Add level to the trail
      const trail = trailMap.get(row.id);
      trail.levels.push({
        id: row.levelId,
        name: row.levelName,
        color: row.levelColor,
        xp: row.levelXP,
        order: row.levelOrder,
        completed: Boolean(row.levelCompleted),
        current: Boolean(row.levelCurrent)
      });
    }

    // Determine the trail status
    const result = [];
    for (const [, trail] of trailMap.entries()) {
      let status: 'active' | 'in_progress' | 'locked' = 'locked';

      // Check progress in current trail
      const hasProgress = trail.levels.some((l: any) => l.completed || l.current);
      const allCompleted = trail.levels.length > 0 && trail.levels.every((l: any) => l.completed);
      const goldenLevelCompleted = trail.levels.some((l: any) => l.color === 'DOURADO' && l.completed);

      if (allCompleted) {
        status = 'active'; // All completed, user can review
      } else if (hasProgress) {
        status = 'in_progress'; // Some progress
      } else {
        // Check if it's the first trail or previous trail is completed
        if (trail.order === 1) {
          status = 'active'; // First trail is always active
        } else {
          // Check if previous trail is completed
          const previousTrail = result.find((t: any) => t.order === trail.order - 1);
          const previousTrailCompleted = previousTrail?.levels.some((l: any) => l.color === 'DOURADO' && l.completed);
          if (previousTrail && previousTrailCompleted) {
            status = 'active';
          }
        }
      }

      trail.status = status;
      result.push(trail);
    }

    return result;
  }

  // Levels methods
  async getLevels(): Promise<Level[]> {
    const rows = this.db.prepare('SELECT * FROM levels ORDER BY trailId, order_num').all();
    return rows.map(row => this.mapDbRowToLevel(row));
  }

  async getLevel(id: number): Promise<Level | undefined> {
    const row = this.db.prepare('SELECT * FROM levels WHERE id = ?').get(id);
    return row ? this.mapDbRowToLevel(row) : undefined;
  }

  async getLevelsByTrail(trailId: number): Promise<Level[]> {
    const rows = this.db.prepare('SELECT * FROM levels WHERE trailId = ? ORDER BY order_num').all(trailId);
    return rows.map(row => this.mapDbRowToLevel(row));
  }

  async createLevel(level: InsertLevel): Promise<Level> {
    const now = new Date().toISOString();

    const result = this.db.prepare(`
      INSERT INTO levels (name, color, xp, trailId, order_num, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      level.name,
      level.color,
      level.xp,
      level.trailId,
      level.order,
      now
    );

    const createdLevel = await this.getLevel(result.lastInsertRowid as number);
    if (!createdLevel) {
      throw new Error('Failed to create level');
    }

    return createdLevel;
  }

  async updateLevel(id: number, data: Partial<InsertLevel>): Promise<Level | undefined> {
    const level = await this.getLevel(id);
    if (!level) return undefined;

    this.db.prepare(`
      UPDATE levels SET
        name = ?,
        color = ?,
        xp = ?,
        trailId = ?,
        order_num = ?
      WHERE id = ?
    `).run(
      data.name || level.name,
      data.color || level.color,
      data.xp || level.xp,
      data.trailId || level.trailId,
      data.order || level.order,
      id
    );

    return await this.getLevel(id);
  }

  async deleteLevel(id: number): Promise<boolean> {
    const result = this.db.prepare('DELETE FROM levels WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // Exercises methods
  async getExercises(): Promise<Exercise[]> {
    const rows = this.db.prepare('SELECT * FROM exercises').all();
    return rows.map(row => this.mapDbRowToExercise(row));
  }

  async getExercise(id: number): Promise<Exercise | undefined> {
    const row = this.db.prepare('SELECT * FROM exercises WHERE id = ?').get(id);
    return row ? this.mapDbRowToExercise(row) : undefined;
  }

  async getExercisesByLevel(levelId: number): Promise<Exercise[]> {
    const rows = this.db.prepare('SELECT * FROM exercises WHERE levelId = ?').all(levelId);
    return rows.map(row => this.mapDbRowToExercise(row));
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const now = new Date().toISOString();

    const result = this.db.prepare(`
      INSERT INTO exercises (question, type, options, levelId, correctAnswer, audioUrl, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      exercise.question,
      exercise.type,
      exercise.options,
      exercise.levelId,
      exercise.correctAnswer || null,
      exercise.audioUrl || null,
      now
    );

    const createdExercise = await this.getExercise(result.lastInsertRowid as number);
    if (!createdExercise) {
      throw new Error('Failed to create exercise');
    }

    return createdExercise;
  }

  async updateExercise(id: number, data: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const exercise = await this.getExercise(id);
    if (!exercise) return undefined;

    this.db.prepare(`
      UPDATE exercises SET
        question = ?,
        type = ?,
        options = ?,
        levelId = ?,
        correctAnswer = ?,
        audioUrl = ?
      WHERE id = ?
    `).run(
      data.question || exercise.question,
      data.type || exercise.type,
      data.options || exercise.options,
      data.levelId || exercise.levelId,
      data.correctAnswer !== undefined ? data.correctAnswer : exercise.correctAnswer,
      data.audioUrl !== undefined ? data.audioUrl : exercise.audioUrl,
      id
    );

    return await this.getExercise(id);
  }

  async deleteExercise(id: number): Promise<boolean> {
    const result = this.db.prepare('DELETE FROM exercises WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // User Progress methods
  async getUserLevel(userId: number, levelId: number): Promise<UserLevel | undefined> {
    const row = this.db.prepare('SELECT * FROM user_levels WHERE userId = ? AND levelId = ?').get(userId, levelId);
    return row ? this.mapDbRowToUserLevel(row) : undefined;
  }

  async getUserLevels(userId: number): Promise<UserLevel[]> {
    const rows = this.db.prepare('SELECT * FROM user_levels WHERE userId = ?').all(userId);
    return rows.map(row => this.mapDbRowToUserLevel(row));
  }

  async createUserLevel(userLevel: InsertUserLevel): Promise<UserLevel> {
    const now = new Date().toISOString();

    const result = this.db.prepare(`
      INSERT INTO user_levels (userId, levelId, completed, current, completedAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      userLevel.userId,
      userLevel.levelId,
      userLevel.completed ? 1 : 0,
      userLevel.current ? 1 : 0,
      null,
      now
    );

    const createdUserLevel = await this.getUserLevel(userLevel.userId, userLevel.levelId);
    if (!createdUserLevel) {
      throw new Error('Failed to create user level');
    }

    return createdUserLevel;
  }

  async updateUserLevel(userId: number, levelId: number, data: Partial<InsertUserLevel>): Promise<UserLevel | undefined> {
    const userLevel = await this.getUserLevel(userId, levelId);
    if (!userLevel) return undefined;

    let completedAt = userLevel.completedAt;
    if (data.completed && !userLevel.completed) {
      completedAt = new Date().toISOString();
    }

    this.db.prepare(`
      UPDATE user_levels SET
        completed = ?,
        current = ?,
        completedAt = ?
      WHERE userId = ? AND levelId = ?
    `).run(
      data.completed !== undefined ? (data.completed ? 1 : 0) : (userLevel.completed ? 1 : 0),
      data.current !== undefined ? (data.current ? 1 : 0) : (userLevel.current ? 1 : 0),
      completedAt,
      userId,
      levelId
    );

    return await this.getUserLevel(userId, levelId);
  }

  async getUserExercise(userId: number, exerciseId: number): Promise<UserExercise | undefined> {
    const row = this.db.prepare('SELECT * FROM user_exercises WHERE userId = ? AND exerciseId = ?').get(userId, exerciseId);
    return row ? this.mapDbRowToUserExercise(row) : undefined;
  }

  async getUserExercises(userId: number, levelId?: number): Promise<UserExercise[]> {
    if (levelId) {
      const rows = this.db.prepare(`
        SELECT ue.* FROM user_exercises ue
        JOIN exercises e ON ue.exerciseId = e.id
        WHERE ue.userId = ? AND e.levelId = ?
      `).all(userId, levelId);
      return rows.map(row => this.mapDbRowToUserExercise(row));
    } else {
      const rows = this.db.prepare('SELECT * FROM user_exercises WHERE userId = ?').all(userId);
      return rows.map(row => this.mapDbRowToUserExercise(row));
    }
  }

  async createUserExercise(userExercise: InsertUserExercise): Promise<UserExercise> {
    const now = new Date().toISOString();

    const result = this.db.prepare(`
      INSERT INTO user_exercises (userId, exerciseId, correct, createdAt)
      VALUES (?, ?, ?, ?)
    `).run(
      userExercise.userId,
      userExercise.exerciseId,
      userExercise.correct ? 1 : 0,
      now
    );

    // Get the newly created user exercise
    const row = this.db.prepare('SELECT * FROM user_exercises WHERE id = ?').get(result.lastInsertRowid);
    if (!row) {
      throw new Error('Failed to create user exercise');
    }

    return this.mapDbRowToUserExercise(row);
  }

  // Transactions methods
  async getTransactions(): Promise<Transaction[]> {
    const rows = this.db.prepare('SELECT * FROM transactions ORDER BY createdAt DESC').all();
    return rows.map(row => this.mapDbRowToTransaction(row));
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const row = this.db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    return row ? this.mapDbRowToTransaction(row) : undefined;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    const rows = this.db.prepare('SELECT * FROM transactions WHERE userId = ? ORDER BY createdAt DESC').all(userId);
    return rows.map(row => this.mapDbRowToTransaction(row));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const now = new Date().toISOString();

    const result = this.db.prepare(`
      INSERT INTO transactions (userId, amount, description, paymentMethod, status, paymentToken, completedAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      transaction.userId,
      transaction.amount,
      transaction.description,
      transaction.paymentMethod,
      transaction.status || 'pending',
      transaction.paymentToken || null,
      transaction.completedAt || null,
      now
    );

    const createdTransaction = await this.getTransaction(result.lastInsertRowid as number);
    if (!createdTransaction) {
      throw new Error('Failed to create transaction');
    }

    return createdTransaction;
  }

  async updateTransactionStatus(id: number, status: 'pending' | 'completed' | 'failed'): Promise<Transaction | undefined> {
    const transaction = await this.getTransaction(id);
    if (!transaction) return undefined;

    let completedAt = transaction.completedAt;
    if (status === 'completed' && !transaction.completedAt) {
      completedAt = new Date().toISOString();
    }

    this.db.prepare(`
      UPDATE transactions SET status = ?, completedAt = ? WHERE id = ?
    `).run(status, completedAt, id);

    return await this.getTransaction(id);
  }

  // Leaderboard
  async getLeaderboard(timeRange: 'weekly' | 'allTime' = 'allTime'): Promise<any[]> {
    if (timeRange === 'weekly') {
      // Get date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const weekStart = sevenDaysAgo.toISOString();

      // Get weekly XP from completed exercises within the last 7 days
      const rows = this.db.prepare(`
        SELECT u.id, u.username, COUNT(ue.id) * 5 as weeklyXP
        FROM users u
        LEFT JOIN user_exercises ue ON u.id = ue.userId
          AND ue.correct = 1
          AND ue.createdAt >= ?
        GROUP BY u.id
        HAVING weeklyXP > 0
        ORDER BY weeklyXP DESC
        LIMIT 20
      `).all(weekStart);

      return rows.map((row, index) => ({
        id: row.id,
        username: row.username,
        avatar: null, // We don't have avatars yet
        xp: row.weeklyXP,
        rank: index + 1
      }));
    } else {
      // All-time leaderboard
      const rows = this.db.prepare(`
        SELECT id, username, xp
        FROM users
        WHERE xp > 0
        ORDER BY xp DESC
        LIMIT 20
      `).all();

      return rows.map((row, index) => ({
        id: row.id,
        username: row.username,
        avatar: null, // We don't have avatars yet
        xp: row.xp,
        rank: index + 1
      }));
    }
  }

  // Admin stats
  async getAdminStats(): Promise<any> {
    const usersCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const trailsCount = this.db.prepare('SELECT COUNT(*) as count FROM trails').get().count;
    const levelsCount = this.db.prepare('SELECT COUNT(*) as count FROM levels').get().count;
    const exercisesCount = this.db.prepare('SELECT COUNT(*) as count FROM exercises').get().count;
    const transactionsCount = this.db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
    const totalXP = this.db.prepare('SELECT SUM(xp) as total FROM users').get().total || 0;
    const completedExercisesCount = this.db.prepare('SELECT COUNT(*) as count FROM user_exercises WHERE correct = 1').get().count;

    // Get recent users
    const recentUsers = this.db.prepare(`
      SELECT id, username, email, createdAt
      FROM users
      ORDER BY createdAt DESC
      LIMIT 5
    `).all();

    // Get recent transactions
    const recentTransactions = this.db.prepare(`
      SELECT t.id, t.amount, t.status, t.createdAt, t.paymentMethod, u.username
      FROM transactions t
      JOIN users u ON t.userId = u.id
      ORDER BY t.createdAt DESC
      LIMIT 5
    `).all();

    return {
      usersCount,
      trailsCount,
      levelsCount,
      exercisesCount,
      transactionsCount,
      totalXP,
      completedExercisesCount,
      recentUsers,
      recentTransactions
    };
  }

  // Helper methods to map database rows to our types
  private mapDbRowToUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password,
      role: row.role,
      xp: row.xp,
      diamonds: row.diamonds,
      lives: row.lives,
      nextLifeAt: row.nextLifeAt ? new Date(row.nextLifeAt) : null,
      createdAt: new Date(row.createdAt)
    };
  }

  private mapDbRowToTrail(row: any): Trail {
    return {
      id: row.id,
      name: row.name,
      theme: row.theme,
      order: row.order_num,
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt)
    };
  }

  private mapDbRowToLevel(row: any): Level {
    return {
      id: row.id,
      name: row.name,
      color: row.color,
      xp: row.xp,
      trailId: row.trailId,
      order: row.order_num,
      createdAt: new Date(row.createdAt)
    };
  }

  private mapDbRowToExercise(row: any): Exercise {
    return {
      id: row.id,
      question: row.question,
      type: row.type,
      options: row.options,
      levelId: row.levelId,
      correctAnswer: row.correctAnswer,
      audioUrl: row.audioUrl,
      createdAt: new Date(row.createdAt)
    };
  }

  private mapDbRowToUserLevel(row: any): UserLevel {
    return {
      id: row.id,
      userId: row.userId,
      levelId: row.levelId,
      completed: Boolean(row.completed),
      current: Boolean(row.current),
      completedAt: row.completedAt ? new Date(row.completedAt) : null,
      createdAt: new Date(row.createdAt)
    };
  }

  private mapDbRowToUserExercise(row: any): UserExercise {
    return {
      id: row.id,
      userId: row.userId,
      exerciseId: row.exerciseId,
      correct: Boolean(row.correct),
      createdAt: new Date(row.createdAt)
    };
  }

  private mapDbRowToTransaction(row: any): Transaction {
    return {
      id: row.id,
      userId: row.userId,
      amount: row.amount,
      description: row.description,
      paymentMethod: row.paymentMethod,
      status: row.status,
      paymentToken: row.paymentToken,
      completedAt: row.completedAt ? new Date(row.completedAt) : null,
      createdAt: new Date(row.createdAt)
    };
  }
}

// Create and export the SQLite storage instance
export const sqliteStorage = new SqliteStorage();