import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// 加载 .env.local 文件
dotenv.config({ path: ".env.local" });

export default defineConfig({
  // Schema 文件路径
  schema: "./lib/db/schema.ts",
  // 迁移文件输出目录
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
