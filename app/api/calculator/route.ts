import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { calculatorEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/calculator — 获取用户所有事件
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const events = await db
    .select()
    .from(calculatorEvents)
    .where(eq(calculatorEvents.userId, session.user.id));

  return NextResponse.json({ data: events });
}

// POST /api/calculator — 新增事件
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { name, frequencyPerYear, activeUntilAge, qualityDecayAge } = await request.json();
  if (!name || !frequencyPerYear) {
    return NextResponse.json({ error: "事件名称和频率不能为空" }, { status: 400 });
  }

  const [event] = await db
    .insert(calculatorEvents)
    .values({
      userId: session.user.id,
      name,
      frequencyPerYear,
      activeUntilAge: activeUntilAge || 80,
      qualityDecayAge: qualityDecayAge || null,
    })
    .returning();

  return NextResponse.json({ data: event }, { status: 201 });
}
