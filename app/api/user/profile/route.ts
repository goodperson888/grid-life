import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/user/profile — 获取当前用户信息
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      birthDate: users.birthDate,
      expectedLifespan: users.expectedLifespan,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return NextResponse.json({ data: user });
}

// PUT /api/user/profile — 更新出生日期和预期寿命
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { birthDate, expectedLifespan, name } = await request.json();

  await db
    .update(users)
    .set({
      ...(birthDate && { birthDate }),
      ...(expectedLifespan && { expectedLifespan }),
      ...(name !== undefined && { name }),
    })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ data: { success: true } });
}
