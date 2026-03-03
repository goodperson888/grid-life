import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

// POST /api/auth/register — 注册新用户
export async function POST(request: Request) {
  // 速率限制：同一 IP 每小时最多注册 3 次
  const clientIP = getClientIP(request);
  const ipLimit = checkRateLimit(`register:ip:${clientIP}`, {
    interval: 60 * 60 * 1000, // 1 小时
    maxRequests: 3,
  });

  if (!ipLimit.allowed) {
    const waitMinutes = Math.ceil((ipLimit.resetAt - Date.now()) / 60000);
    return NextResponse.json(
      { error: `操作太频繁，请 ${waitMinutes} 分钟后再试` },
      { status: 429 }
    );
  }

  const { email, password, name, turnstileToken } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "邮箱和密码不能为空" }, { status: 400 });
  }

  // 验证 Turnstile token
  if (turnstileToken) {
    const isValid = await verifyTurnstile(turnstileToken);
    if (!isValid) {
      return NextResponse.json({ error: "人机验证失败" }, { status: 400 });
    }
  }

  // 检查邮箱是否已注册
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return NextResponse.json({ error: "该邮箱已注册" }, { status: 409 });
  }

  // 速率限制：同一邮箱每天最多尝试注册 5 次
  const emailLimit = checkRateLimit(`register:email:${email}`, {
    interval: 24 * 60 * 60 * 1000, // 24 小时
    maxRequests: 5,
  });

  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "该邮箱注册尝试次数过多，请明天再试" },
      { status: 429 }
    );
  }

  // 加密密码
  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, name: name || null })
    .returning({ id: users.id, email: users.email });

  return NextResponse.json({ data: user }, { status: 201 });
}
