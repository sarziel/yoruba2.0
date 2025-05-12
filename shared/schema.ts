import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const exerciseTypeEnum = pgEnum('exercise_type', ['multiple_choice', 'fill_blank', 'audio']);
export const levelColorEnum = pgEnum('level_color', ['AMARELO', 'AZUL', 'VERDE', 'DOURADO']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed']);
export const paymentMethodEnum = pgEnum('payment_method', ['GOOGLE_PAY', 'DIAMONDS']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email"),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('user'),
  xp: integer("xp").notNull().default(0),
  diamonds: integer("diamonds").notNull().default(0),
  lives: integer("lives").notNull().default(5),
  nextLifeAt: timestamp("next_life_at"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Trails (Learning paths)
export const trails = pgTable("trails", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  theme: text("theme").notNull(),
  order: integer("order").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Levels within trails
export const levels = pgTable("levels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: levelColorEnum("color").notNull(),
  xp: integer("xp").notNull(),
  trailId: integer("trail_id").notNull().references(() => trails.id, { onDelete: 'cascade' }),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Exercises within levels
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  type: exerciseTypeEnum("type").notNull(),
  options: text("options").notNull(), // JSON string of options
  correctAnswer: text("correct_answer"), // for fill_blank type
  audioUrl: text("audio_url"), // for audio type
  levelId: integer("level_id").notNull().references(() => levels.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// User progress on levels
export const userLevels = pgTable("user_levels", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  levelId: integer("level_id").notNull().references(() => levels.id, { onDelete: 'cascade' }),
  completed: boolean("completed").notNull().default(false),
  current: boolean("current").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at")
});

// User progress on exercises
export const userExercises = pgTable("user_exercises", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  exerciseId: integer("exercise_id").notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  correct: boolean("correct").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Transactions for payments
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  status: transactionStatusEnum("status").notNull().default('pending'),
  paymentToken: text("payment_token"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at")
});

// Schemas for insertions
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertTrailSchema = createInsertSchema(trails).omit({
  id: true,
  createdAt: true
});

export const insertLevelSchema = createInsertSchema(levels).omit({
  id: true,
  createdAt: true
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true
});

export const insertUserLevelSchema = createInsertSchema(userLevels).omit({
  id: true,
  createdAt: true,
  completedAt: true
});

export const insertUserExerciseSchema = createInsertSchema(userExercises).omit({
  id: true,
  createdAt: true
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  completedAt: true
});

// Types for insertions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTrail = z.infer<typeof insertTrailSchema>;
export type InsertLevel = z.infer<typeof insertLevelSchema>;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type InsertUserLevel = z.infer<typeof insertUserLevelSchema>;
export type InsertUserExercise = z.infer<typeof insertUserExerciseSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Types for selections
export type User = typeof users.$inferSelect;
export type Trail = typeof trails.$inferSelect;
export type Level = typeof levels.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type UserLevel = typeof userLevels.$inferSelect;
export type UserExercise = typeof userExercises.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
