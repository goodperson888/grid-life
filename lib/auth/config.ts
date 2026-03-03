import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

export const authConfig: NextAuthConfig = {
  // 自定义页面路径
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
        turnstileToken: { label: "Turnstile Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const turnstileToken = credentials.turnstileToken as string | undefined;

        // 验证 Turnstile token
        if (turnstileToken) {
          const isValid = await verifyTurnstile(turnstileToken);
          if (!isValid) {
            throw new Error("人机验证失败");
          }
        }

        // 速率限制：同一邮箱每 15 分钟最多尝试登录 5 次
        const emailLimit = checkRateLimit(`login:email:${email}`, {
          interval: 15 * 60 * 1000, // 15 分钟
          maxRequests: 5,
        });

        if (!emailLimit.allowed) {
          throw new Error("登录尝试次数过多，请稍后再试");
        }

        // 查询用户
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) return null;

        // 验证密码
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    // 将用户 id 注入 session
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
};
