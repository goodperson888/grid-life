import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// 创建 Neon HTTP 连接（无需连接池，适合 serverless 环境）
const sql = neon(process.env.DATABASE_URL!);

// 导出 Drizzle 实例，带完整 schema 类型
export const db = drizzle(sql, { schema });
