"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { DiaryEntryData } from "@/types";

interface MoodChartProps {
  entries: DiaryEntryData[];
  startDate: string;
  endDate: string;
}

export default function MoodChart({ entries, startDate, endDate }: MoodChartProps) {
  // 计算时间跨度（天数）
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // 根据时间跨度决定聚合方式
  let chartData: Array<{ name: string; 红色: number; 蓝色: number }> = [];

  if (daysDiff <= 31) {
    // 31天以内：按天显示
    chartData = generateDailyData(entries, start, end);
  } else if (daysDiff <= 90) {
    // 31-90天：按周显示
    chartData = generateWeeklyData(entries, start, end);
  } else {
    // 90天以上：按月显示
    chartData = generateMonthlyData(entries, start, end);
  }

  return (
    <div className="rounded-xl border border-stone-100 bg-white p-4">
      <p className="mb-3 text-sm font-medium text-stone-600">
        趋势图 ({daysDiff} 天)
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="红色" stroke="#fb7185" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="蓝色" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// 按天聚合
function generateDailyData(
  entries: DiaryEntryData[],
  start: Date,
  end: Date
): Array<{ name: string; 红色: number; 蓝色: number }> {
  const data: Array<{ name: string; 红色: number; 蓝色: number }> = [];
  const entryMap = new Map(entries.map((e) => [e.date, e]));

  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0];
    const entry = entryMap.get(dateStr);

    data.push({
      name: `${current.getMonth() + 1}/${current.getDate()}`,
      红色: entry?.mood === "red" ? 1 : 0,
      蓝色: entry?.mood === "blue" ? 1 : 0,
    });

    current.setDate(current.getDate() + 1);
  }

  return data;
}

// 按周聚合
function generateWeeklyData(
  entries: DiaryEntryData[],
  start: Date,
  end: Date
): Array<{ name: string; 红色: number; 蓝色: number }> {
  const data: Array<{ name: string; 红色: number; 蓝色: number }> = [];
  const entryMap = new Map(entries.map((e) => [e.date, e]));

  let weekStart = new Date(start);
  let weekNum = 1;

  while (weekStart <= end) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    let redCount = 0;
    let blueCount = 0;

    const current = new Date(weekStart);
    while (current <= weekEnd && current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      const entry = entryMap.get(dateStr);
      if (entry?.mood === "red") redCount++;
      if (entry?.mood === "blue") blueCount++;
      current.setDate(current.getDate() + 1);
    }

    data.push({
      name: `第${weekNum}周`,
      红色: redCount,
      蓝色: blueCount,
    });

    weekStart.setDate(weekStart.getDate() + 7);
    weekNum++;
  }

  return data;
}

// 按月聚合
function generateMonthlyData(
  entries: DiaryEntryData[],
  start: Date,
  end: Date
): Array<{ name: string; 红色: number; 蓝色: number }> {
  const data: Array<{ name: string; 红色: number; 蓝色: number }> = [];
  const monthMap = new Map<string, { red: number; blue: number }>();

  entries.forEach((entry) => {
    const date = new Date(entry.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { red: 0, blue: 0 });
    }

    const counts = monthMap.get(monthKey)!;
    if (entry.mood === "red") counts.red++;
    if (entry.mood === "blue") counts.blue++;
  });

  // 按时间顺序排序
  const sortedMonths = Array.from(monthMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  sortedMonths.forEach(([monthKey, counts]) => {
    const [year, month] = monthKey.split("-");
    data.push({
      name: `${year}年${month}月`,
      红色: counts.red,
      蓝色: counts.blue,
    });
  });

  return data;
}
