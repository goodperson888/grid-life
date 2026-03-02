import { pgTable, text, integer, date, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// 心情枚举：red=今天没白活，blue=将就的一天
export const moodEnum = pgEnum("mood", ["red", "blue"]);

// ─── 用户表 ─────────────���─────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  // 出生日期：格子图的核心数据
  birthDate: date("birth_date"),
  // 预期寿命（岁），默认 90
  expectedLifespan: integer("expected_lifespan").default(90),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── 红蓝日记表 ───────────────────────────────────────────
export const diaryEntries = pgTable("diary_entries", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // 记录日期（每个用户每天唯一）
  date: date("date").notNull(),
  mood: moodEnum("mood").notNull(),
  // 可选的一句话备注（今天没白活是因为...）
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── 剩余次数事件表 ───────────────────────────────────────
export const calculatorEvents = pgTable("calculator_events", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // 事件名称，如"和父母团聚"、"出去旅行"
  name: text("name").notNull(),
  // 每年频率
  frequencyPerYear: integer("frequency_per_year").notNull(),
  // 预计能做到几岁（默认 80）
  activeUntilAge: integer("active_until_age").default(80),
  // 质量衰减起始年龄（可选，超过此年龄体验打折）
  qualityDecayAge: integer("quality_decay_age"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 导出类型（供 TypeScript 使用）
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type DiaryEntry = typeof diaryEntries.$inferSelect;
export type NewDiaryEntry = typeof diaryEntries.$inferInsert;
export type CalculatorEvent = typeof calculatorEvents.$inferSelect;
export type NewCalculatorEvent = typeof calculatorEvents.$inferInsert;
