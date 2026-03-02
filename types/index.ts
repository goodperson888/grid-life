// 共享 TypeScript 类型定义

export type Mood = "red" | "blue";

// 用户 profile（前端使用）
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  birthDate: string | null;   // ISO date string "YYYY-MM-DD"
  expectedLifespan: number;
}

// 日记条目（前端使用）
export interface DiaryEntryData {
  id: string;
  date: string;               // "YYYY-MM-DD"
  mood: Mood;
  note: string | null;
}

// 计算器事件（前端使用）
export interface CalculatorEventData {
  id: string;
  name: string;
  frequencyPerYear: number;
  activeUntilAge: number;
  qualityDecayAge: number | null;
}

// API 响应通用格式
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
