import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { diaryEntries } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// DELETE /api/diary/[id] — 删除一条日记
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  await db
    .delete(diaryEntries)
    .where(
      and(eq(diaryEntries.id, id), eq(diaryEntries.userId, session.user.id))
    );

  return NextResponse.json({ data: { success: true } });
}
