import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { diaryEntries } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

// GET /api/diary?startDate=2026-02-01&endDate=2026-02-28 — 获取日期范围内的日记
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { searchParams } = new URL(request.url);

  // 支持两种查询方式：
  // 1. startDate + endDate（新方式，优先）
  // 2. year + month（旧方式，兼容）
  let startDate = searchParams.get("startDate");
  let endDate = searchParams.get("endDate");

  if (!startDate || !endDate) {
    // 兼容旧的 year/month 查询方式
    const year = searchParams.get("year") || new Date().getFullYear().toString();
    const month = searchParams.get("month") || (new Date().getMonth() + 1).toString();
    startDate = `${year}-${month.padStart(2, "0")}-01`;
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    endDate = `${year}-${month.padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }

  console.log(`[Diary API] Fetching entries: ${startDate} to ${endDate}`);

  const entries = await db
    .select()
    .from(diaryEntries)
    .where(
      and(
        eq(diaryEntries.userId, session.user.id),
        gte(diaryEntries.date, startDate),
        lte(diaryEntries.date, endDate)
      )
    );

  console.log(`[Diary API] Found ${entries.length} entries`);

  return NextResponse.json({ data: entries });
}

// POST /api/diary — 新增或覆盖当天记录
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { date, mood, note } = await request.json();
  if (!date || !mood) return NextResponse.json({ error: "日期和心情不能为空" }, { status: 400 });

  console.log(`[Diary API] Saving entry for ${date}: mood=${mood}`);

  // 如果当天已有记录则更新，否则插入
  const [existing] = await db
    .select()
    .from(diaryEntries)
    .where(and(eq(diaryEntries.userId, session.user.id), eq(diaryEntries.date, date)))
    .limit(1);

  if (existing) {
    console.log(`[Diary API] Updating existing entry ${existing.id}`);
    const [updated] = await db
      .update(diaryEntries)
      .set({ mood, note: note || null, updatedAt: new Date() })
      .where(eq(diaryEntries.id, existing.id))
      .returning();
    return NextResponse.json({ data: updated });
  }

  console.log(`[Diary API] Creating new entry`);
  const [entry] = await db
    .insert(diaryEntries)
    .values({ userId: session.user.id, date, mood, note: note || null })
    .returning();

  return NextResponse.json({ data: entry }, { status: 201 });
}
