import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;

// ============================================
// Training Plan & Session Tables
// ============================================

export const userPlan = sqliteTable(
  "user_plan",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    focusDuration: integer("focus_duration").notNull(),
    daysPerWeek: integer("days_per_week").notNull(),
    workDaysSchedule: text("work_days_schedule", { mode: "json" })
      .notNull()
      .$type<number[]>(),
    currentProgressionWeek: integer("current_progression_week")
      .notNull()
      .default(1),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("user_plan_user_id_idx").on(table.userId),
    index("user_plan_active_idx").on(table.userId, table.isActive),
  ]
);

export const workSession = sqliteTable(
  "work_session",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    planId: text("plan_id")
      .notNull()
      .references(() => userPlan.id, { onDelete: "cascade" }),
    scheduledDate: text("scheduled_date").notNull(),
    plannedDuration: integer("planned_duration").notNull(),
    actualDuration: integer("actual_duration"),
    isRestDay: integer("is_rest_day", { mode: "boolean" })
      .notNull()
      .default(false),
    status: text("status", {
      enum: ["scheduled", "completed", "missed", "skipped"],
    })
      .notNull()
      .default("scheduled"),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    difficultyRating: text("difficulty_rating", {
      enum: ["easy", "just_right", "challenging"],
    }),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("work_session_user_id_idx").on(table.userId),
    index("work_session_date_idx").on(table.userId, table.scheduledDate),
    index("work_session_status_idx").on(table.userId, table.status),
    index("work_session_plan_idx").on(table.planId),
  ]
);

export const progression = sqliteTable(
  "progression",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    previousDuration: integer("previous_duration").notNull(),
    previousFrequency: integer("previous_frequency").notNull(),
    newDuration: integer("new_duration").notNull(),
    newFrequency: integer("new_frequency").notNull(),
    progressionType: text("progression_type", {
      enum: ["auto", "manual", "custom"],
    }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("progression_user_id_idx").on(table.userId),
    index("progression_date_idx").on(table.userId, table.createdAt),
  ]
);

// ============================================
// Type Exports
// ============================================

export type UserPlan = typeof userPlan.$inferSelect;
export type NewUserPlan = typeof userPlan.$inferInsert;

export type WorkSession = typeof workSession.$inferSelect;
export type NewWorkSession = typeof workSession.$inferInsert;

export type Progression = typeof progression.$inferSelect;
export type NewProgression = typeof progression.$inferInsert;

// Enum types for application code
export type WorkSessionStatus = "scheduled" | "completed" | "missed" | "skipped";
export type DifficultyRating = "easy" | "just_right" | "challenging";
export type ProgressionType = "auto" | "manual" | "custom";
export type FocusDuration = 15 | 25 | 45 | 60 | 90;
