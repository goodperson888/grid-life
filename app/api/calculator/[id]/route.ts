import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { calculatorEvents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// PUT /api/calculator/[id] — 编辑事件
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const body = await request.json();

  await db
    .update(calculatorEvents)
    .set(body)
    .where(
      and(eq(calculatorEvents.id, params.id), eq(calculatorEvents.userId, session.user.id))
    );

  return NextResponse.json({ data: { success: true } });
}

// DELETE /api/calculator/[id] — 删除事件
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  await db
    .delete(calculatorEvents)
    .where(
      and(eq(calculatorEvents.id, params.id), eq(calculatorEvents.userId, session.user.id))
    );

  return NextResponse.json({ data: { success: true } });
}
