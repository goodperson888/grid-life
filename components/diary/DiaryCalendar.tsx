"use client";

import type { DiaryEntryData } from "@/types";

interface DiaryCalendarProps {
  year: number;
  month: number;           // 1-12
  entries: DiaryEntryData[];
  onDayClick: (date: string) => void;
}

const moodDot: Record<string, string> = {
  red: "bg-rose-400",
  blue: "bg-sky-400",
};

export default function DiaryCalendar({ year, month, entries, onDayClick }: DiaryCalendarProps) {
  // 构建日期 → 日记的映射
  const entryMap = new Map(entries.map((e) => [e.date, e]));

  // 计算当月天数和起始星期
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=周日

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="rounded-xl border border-stone-100 bg-white p-4">
      {/* 星期标题 */}
      <div className="mb-2 grid grid-cols-7 text-center text-xs text-stone-400">
        {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      {/* 日期格子 */}
      <div className="grid grid-cols-7 gap-1">
        {/* 空白占位 */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* 每一天 */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const entry = entryMap.get(dateStr);
          const isToday = dateStr === today;

          return (
            <button
              key={day}
              onClick={() => onDayClick(dateStr)}
              title={entry?.note || undefined}
              className={`group relative flex h-9 w-full flex-col items-center justify-center rounded-lg text-sm transition-colors hover:bg-stone-50 ${
                isToday ? "ring-1 ring-rose-300" : ""
              }`}
            >
              <span className={isToday ? "font-semibold text-rose-400" : "text-stone-700"}>
                {day}
              </span>
              {/* 心情小点 */}
              {entry && (
                <span className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${moodDot[entry.mood]}`} />
              )}
              {/* 悬浮显示备注 */}
              {entry?.note && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-stone-800 px-2 py-1 text-xs text-white group-hover:block">
                  {entry.note}
                  <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-4 border-transparent border-t-stone-800" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
