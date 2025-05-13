import { IStorage } from './storage';
import { db } from './db';
import { and, eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import * as schema from '../shared/schema';

export class PostgresStorage implements IStorage {
  // Users
  async getUsers() {
    const users = await db.select().from(schema.users);
    return users || [];
  }

  async getUser(id: number) {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return users?.[0];
  }

  async getUserByUsername(username: string) {
    const users = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return users?.[0];
  }

  async createUser(user: schema.InsertUser) {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const [newUser] = await db.insert(schema.users).values({
      ...user,
      password: hashedPassword
    }).returning();
    return newUser;
  }

  async compareUserPassword(username: string, password: string) {
    const user = await this.getUserByUsername(username);
    if (!user) return false;
    return await bcrypt.compare(password, user.password);
  }

  async updateUser(id: number, data: Partial<schema.InsertUser>) {
    const [updatedUser] = await db.update(schema.users)
      .set(data)
      .where(eq(schema.users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number) {
    await db.delete(schema.users).where(eq(schema.users.id, id));
    return true;
  }

  // Trails
  async getTrails() {
    return await db.select().from(schema.trails);
  }

  async getTrail(id: number) {
    const trails = await db.select().from(schema.trails).where(eq(schema.trails.id, id));
    return trails[0];
  }

  async createTrail(trail: schema.InsertTrail) {
    const [newTrail] = await db.insert(schema.trails).values(trail).returning();
    return newTrail;
  }

  async updateTrail(id: number, data: Partial<schema.InsertTrail>) {
    const [updatedTrail] = await db.update(schema.trails)
      .set(data)
      .where(eq(schema.trails.id, id))
      .returning();
    return updatedTrail;
  }

  async deleteTrail(id: number) {
    await db.delete(schema.trails).where(eq(schema.trails.id, id));
    return true;
  }

  // Levels
  async getLevels() {
    return await db.select().from(schema.levels);
  }

  async getLevel(id: number) {
    const levels = await db.select().from(schema.levels).where(eq(schema.levels.id, id));
    return levels[0];
  }

  async getLevelsByTrail(trailId: number) {
    return await db.select().from(schema.levels).where(eq(schema.levels.trailId, trailId));
  }

  async createLevel(level: schema.InsertLevel) {
    const [newLevel] = await db.insert(schema.levels).values(level).returning();
    return newLevel;
  }

  async updateLevel(id: number, data: Partial<schema.InsertLevel>) {
    const [updatedLevel] = await db.update(schema.levels)
      .set(data)
      .where(eq(schema.levels.id, id))
      .returning();
    return updatedLevel;
  }

  async deleteLevel(id: number) {
    await db.delete(schema.levels).where(eq(schema.levels.id, id));
    return true;
  }

  // Exercises
  async getExercises() {
    return await db.select().from(schema.exercises);
  }

  async getExercise(id: number) {
    const exercises = await db.select().from(schema.exercises).where(eq(schema.exercises.id, id));
    return exercises[0];
  }

  async getExercisesByLevel(levelId: number) {
    return await db.select().from(schema.exercises).where(eq(schema.exercises.levelId, levelId));
  }

  async createExercise(exercise: schema.InsertExercise) {
    const [newExercise] = await db.insert(schema.exercises).values(exercise).returning();
    return newExercise;
  }

  async updateExercise(id: number, data: Partial<schema.InsertExercise>) {
    const [updatedExercise] = await db.update(schema.exercises)
      .set(data)
      .where(eq(schema.exercises.id, id))
      .returning();
    return updatedExercise;
  }

  async deleteExercise(id: number) {
    await db.delete(schema.exercises).where(eq(schema.exercises.id, id));
    return true;
  }

  // User Progress
  async getUserLevel(userId: number, levelId: number) {
    const userLevels = await db.select().from(schema.userLevels)
      .where(and(
        eq(schema.userLevels.userId, userId),
        eq(schema.userLevels.levelId, levelId)
      ));
    return userLevels[0];
  }

  async getUserLevels(userId: number) {
    return await db.select().from(schema.userLevels).where(eq(schema.userLevels.userId, userId));
  }

  async createUserLevel(userLevel: schema.InsertUserLevel) {
    const [newUserLevel] = await db.insert(schema.userLevels).values(userLevel).returning();
    return newUserLevel;
  }

  async updateUserLevel(userId: number, levelId: number, data: Partial<schema.InsertUserLevel>) {
    const [updatedUserLevel] = await db.update(schema.userLevels)
      .set(data)
      .where(and(
        eq(schema.userLevels.userId, userId),
        eq(schema.userLevels.levelId, levelId)
      ))
      .returning();
    return updatedUserLevel;
  }

  async getUserExercise(userId: number, exerciseId: number) {
    const userExercises = await db.select().from(schema.userExercises)
      .where(and(
        eq(schema.userExercises.userId, userId),
        eq(schema.userExercises.exerciseId, exerciseId)
      ));
    return userExercises[0];
  }

  async getUserExercises(userId: number) {
    return await db.select().from(schema.userExercises).where(eq(schema.userExercises.userId, userId));
  }

  async createUserExercise(userExercise: schema.InsertUserExercise) {
    const [newUserExercise] = await db.insert(schema.userExercises).values(userExercise).returning();
    return newUserExercise;
  }

  // Stats and Leaderboard
  async getUserStats(userId: number) {
    const user = await this.getUser(userId);
    const completedLevels = await db.select().from(schema.userLevels)
      .where(and(
        eq(schema.userLevels.userId, userId),
        eq(schema.userLevels.completed, true)
      ));

    return {
      xp: user?.xp || 0,
      completedLevels: completedLevels.length
    };
  }

  async getLeaderboard() {
    return await db.select({
      id: schema.users.id,
      username: schema.users.username,
      xp: schema.users.xp
    })
    .from(schema.users)
    .orderBy(schema.users.xp);
  }

  // User Resources
  async updateUserLives(userId: number, lives: number) {
    const [updatedUser] = await db.update(schema.users)
      .set({ lives })
      .where(eq(schema.users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserDiamonds(userId: number, diamonds: number, type: 'add' | 'subtract' = 'add') {
    const user = await this.getUser(userId);
    if (!user) return;

    const newDiamonds = type === 'add' ? 
      user.diamonds + diamonds : 
      user.diamonds - diamonds;

    const [updatedUser] = await db.update(schema.users)
      .set({ diamonds: newDiamonds })
      .where(eq(schema.users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserXP(userId: number, xp: number) {
    const user = await this.getUser(userId);
    if (!user) return;

    const [updatedUser] = await db.update(schema.users)
      .set({ xp: user.xp + xp })
      .where(eq(schema.users.id, userId))
      .returning();
    return updatedUser;
  }

  // Transactions
  async getTransactions() {
    return await db.select().from(schema.transactions);
  }

  async getTransaction(id: number) {
    const transactions = await db.select().from(schema.transactions).where(eq(schema.transactions.id, id));
    return transactions[0];
  }

  async getUserTransactions(userId: number) {
    return await db.select().from(schema.transactions).where(eq(schema.transactions.userId, userId));
  }

  async createTransaction(transaction: schema.InsertTransaction) {
    const [newTransaction] = await db.insert(schema.transactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransactionStatus(id: number, status: 'pending' | 'completed' | 'failed') {
    const [updatedTransaction] = await db.update(schema.transactions)
      .set({ status })
      .where(eq(schema.transactions.id, id))
      .returning();
    return updatedTransaction;
  }

  // Admin Stats
  async getAdminStats() {
    const users = await this.getUsers();
    const trails = await this.getTrails();
    const levels = await this.getLevels();
    const exercises = await this.getExercises();

    return {
      totalUsers: users.length,
      totalTrails: trails.length,
      totalLevels: levels.length,
      totalExercises: exercises.length
    };
  }

  async getUserTrails(userId: number) {
    const trails = await this.getTrails();
    const userLevels = await this.getUserLevels(userId);

    const result = [];
    for (const trail of trails) {
      const levels = await this.getLevelsByTrail(trail.id);

      // Map levels with user progress
      const mappedLevels = levels.map(level => {
        const userLevel = userLevels.find(ul => ul.levelId === level.id);
        return {
          ...level,
          completed: userLevel?.completed || false,
          current: userLevel?.current || false
        };
      });

      // Determine trail status
      let status: 'active' | 'in_progress' | 'locked' = 'locked';

      // Check progress in current trail
      const hasProgress = mappedLevels.some(l => l.completed || l.current);

      if (trail.order === 1) {
        // First trail - level 1 is always active
        if (hasProgress) {
          status = 'in_progress';
        } else {
          status = 'active';
          // Make first level accessible
          if (mappedLevels.length > 0) {
            mappedLevels[0].current = true;
          }
        }
      } else {
        // For other trails, check if golden level of previous trail is completed
        const previousTrail = result.find(t => t.order === trail.order - 1);
        const previousGoldenCompleted = previousTrail?.levels.some(l => l.color === 'DOURADO' && l.completed);

        if (previousTrail && previousGoldenCompleted) {
          status = hasProgress ? 'in_progress' : 'active';
        }
      }

      result.push({
        ...trail,
        levels: mappedLevels,
        status
      });
    }

    return result;
  }
}

export const storage = new PostgresStorage();