"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DiaryCalendar from "@/components/diary/DiaryCalendar";
import DayPicker from "@/components/diary/DayPicker";
import MoodChart from "@/components/diary/MoodChart";
import type { DiaryEntryData, Mood } from "@/types";

type DateRangePreset = "week" | "month" | "7days" | "30days" | "custom";

export default function DiaryPage() {
  const searchParams = useSearchParams();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [entries, setEntries] = useState<DiaryEntryData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 新增：日期范围选择
  const [rangeMode, setRangeMode] = useState<DateRangePreset>("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 从 URL 参数读取日期范围（从格子图跳转过来）
  useEffect(() => {
    const urlStart = searchParams.get("start");
    const urlEnd = searchParams.get("end");

    if (urlStart && urlEnd) {
      setRangeMode("custom");
      setStartDate(urlStart);
      setEndDate(urlEnd);
    }
  }, [searchParams]);

  // 根据 rangeMode 计算实际的查询日期范围
  function getDateRange(): { start: string; end: string } {
    const today = new Date();
    let start: Date;
    let end: Date = today;

    switch (rangeMode) {
      case "week":
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        start = new Date(today);
        start.setDate(today.getDate() + diff);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case "month":
        start = new Date(year, month - 1, 1);
        end = new Date(year, month, 0);
        break;
      case "7days":
        start = new Date(today);
        start.setDate(today.getDate() - 6);
        break;
      case "30days":
        start = new Date(today);
        start.setDate(today.getDate() - 29);
        break;
      case "custom":
        if (!startDate || !endDate) {
          start = new Date(year, month - 1, 1);
          end = new Date(year, month, 0);
        } else {
          return { start: startDate, end: endDate };
        }
        break;
      default:
        start = new Date(year, month - 1, 1);
        end = new Date(year, month, 0);
    }

    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  }

  // 加载日记数据
  useEffect(() => {
    const range = getDateRange();
    fetch(`/api/diary?startDate=${range.start}&endDate=${range.end}`)
      .then((r) => r.json())
      .then((json) => setEntries(json.data || []));
  }, [year, month, rangeMode, startDate, endDate]);

  async function handleSave(mood: Mood, note: string) {
    if (!selectedDate) return;
    const res = await fetch("/api/diary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, mood, note }),
    });
    const json = await res.json();

    setEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== selectedDate);
      return [...filtered, json.data];
    });
  }

  // 月份切换（仅在 month 模式下使用）
  function prevMonth() {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
    setSelectedDate(null);
  }

  function nextMonth() {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDate(null);
  }

  const redCount = entries.filter((e) => e.mood === "red").length;
  const blueCount = entries.filter((e) => e.mood === "blue").length;

  const range = getDateRange();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-800">红蓝日记</h2>
        <p className="text-sm text-stone-400 mt-1">今天有没有一件事，让你觉得今天没白活？</p>
      </div>

      {/* 时间范围选择 */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setRangeMode("week")}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              rangeMode === "week"
                ? "bg-rose-400 text-white"
                : "border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            本周
          </button>
          <button
            onClick={() => setRangeMode("month")}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              rangeMode === "month"
                ? "bg-rose-400 text-white"
                : "border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            本月
          </button>
          <button
            onClick={() => setRangeMode("7days")}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              rangeMode === "7days"
                ? "bg-rose-400 text-white"
                : "border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            最近7天
          </button>
          <button
            onClick={() => setRangeMode("30days")}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              rangeMode === "30days"
                ? "bg-rose-400 text-white"
                : "border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            最近30天
          </button>
          <button
            onClick={() => setRangeMode("custom")}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              rangeMode === "custom"
                ? "bg-rose-400 text-white"
                : "border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            自定义
          </button>
        </div>

        {/* 自定义日期范围 */}
        {rangeMode === "custom" && (
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm outline-none focus:border-rose-300"
            />
            <span className="text-sm text-stone-400">至</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm outline-none focus:border-rose-300"
            />
          </div>
        )}

        {/* 月份模式下的上下月切换 */}
        {rangeMode === "month" && (
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="rounded-lg border border-stone-200 px-3 py-1 text-sm text-stone-600 hover:bg-stone-50"
            >
              ← 上月
            </button>
            <span className="text-sm font-medium text-stone-700">
              {year} 年 {month} 月
            </span>
            <button
              onClick={nextMonth}
              className="rounded-lg border border-stone-200 px-3 py-1 text-sm text-stone-600 hover:bg-stone-50"
            >
              下月 →
            </button>
          </div>
        )}
      </div>

      {/* 统计数据 */}
      <div className="flex gap-6 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400 inline-block" />
          红色 <strong>{redCount}</strong> 天
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-400 inline-block" />
          蓝色 <strong>{blueCount}</strong> 天
        </span>
        <span className="text-stone-400">
          {range.start} 至 {range.end}
        </span>
      </div>

      {/* 趋势图 */}
      {entries.length > 0 && (
        <MoodChart entries={entries} startDate={range.start} endDate={range.end} />
      )}

      {/* 月历（仅在月份模式下显示） */}
      {rangeMode === "month" && (
        <DiaryCalendar
          year={year}
          month={month}
          entries={entries}
          onDayClick={setSelectedDate}
        />
      )}

      {/* 列表视图（非月份模式） */}
      {rangeMode !== "month" && (
        <div className="space-y-2">
          {entries.length === 0 ? (
            <p className="text-center text-sm text-stone-400 py-8">该时间段暂无记录</p>
          ) : (
            entries
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedDate(entry.date)}
                  className="w-full flex items-center gap-3 rounded-lg border border-stone-100 bg-white p-3 text-left hover:border-stone-200 transition-colors"
                >
                  <span
                    className={`h-3 w-3 rounded-full ${
                      entry.mood === "red" ? "bg-rose-400" : "bg-sky-400"
                    }`}
                  />
                  <span className="text-sm font-medium text-stone-700">{entry.date}</span>
                  {entry.note && (
                    <span className="text-sm text-stone-400 truncate">{entry.note}</span>
                  )}
                </button>
              ))
          )}
        </div>
      )}

      {/* 点击某天后弹出记录面板 */}
      {selectedDate && (
        <div className="rounded-xl border border-stone-100 bg-white p-4">
          <DayPicker
            date={selectedDate}
            existing={entries.find((e) => e.date === selectedDate)}
            onSave={handleSave}
            onClose={() => setSelectedDate(null)}
          />
        </div>
      )}
    </div>
  );
}
