"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { calculateGridCells, calculateGridStats, type GridCell } from "@/lib/calculations/grid";
import type { DiaryEntryData } from "@/types";

interface LifeGridProps {
  birthDate: Date;
  expectedLifespan?: number;
}

const cellColors: Record<string, string> = {
  past_no_data: "bg-stone-400", // 更深的灰色，让无记录更明显
  past_red: "bg-rose-400",
  past_blue: "bg-sky-400",
  past_equal: "bg-purple-400",
  current: "bg-rose-400 animate-pulse",
  future: "bg-stone-100 border border-stone-200",
};

// 获取某个日期所在周的周一
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // 周日是0，需要往回6天；其他往回到周一
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function LifeGrid({ birthDate, expectedLifespan = 90 }: LifeGridProps) {
  const router = useRouter();
  const cells = calculateGridCells(birthDate, expectedLifespan);
  const stats = calculateGridStats(birthDate, expectedLifespan);
  const [diaryData, setDiaryData] = useState<DiaryEntryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 计算出生日期所在周的周一（作为第0周的起点）
  const birthWeekMonday = useMemo(() => getMonday(birthDate), [birthDate]);

  useEffect(() => {
    const startDate = birthDate.toISOString().split("T")[0];
    const endDate = new Date().toISOString().split("T")[0];

    fetch(`/api/diary?startDate=${startDate}&endDate=${endDate}`)
      .then((r) => r.json())
      .then((json) => {
        setDiaryData(json.data || []);
        setLoading(false);
      });
  }, [birthDate]);

  const weekStatsMap = useMemo(() => {
    const map = new Map<number, { red: number; blue: number; color: string }>();

    // 遍历日记条目，计算每个条目属于哪个格子
    diaryData.forEach((entry) => {
      const entryDate = new Date(entry.date);

      // 计算该日期对应的格子索引（基于 birthWeekMonday）
      const daysSinceBirthWeekMonday = Math.floor(
        (entryDate.getTime() - birthWeekMonday.getTime()) / (24 * 60 * 60 * 1000)
      );
      const cellIndex = Math.floor(daysSinceBirthWeekMonday / 7);

      // 获取或初始化该格子的统计数据
      if (!map.has(cellIndex)) {
        map.set(cellIndex, { red: 0, blue: 0, color: "past_no_data" });
      }

      const stats = map.get(cellIndex)!;
      if (entry.mood === "red") stats.red++;
      if (entry.mood === "blue") stats.blue++;
    });

    // 计算每周的颜色
    map.forEach((stats, cellIndex) => {
      if (stats.red > 0 || stats.blue > 0) {
        if (stats.red > stats.blue) stats.color = "past_red";
        else if (stats.blue > stats.red) stats.color = "past_blue";
        else stats.color = "past_equal";

        // 调试：输出前几周的数据
        if (map.size <= 5) {
          console.log(`[LifeGrid] Cell ${cellIndex}: red=${stats.red}, blue=${stats.blue}, color=${stats.color}`);
        }
      }
    });

    console.log(`[LifeGrid] Total cells with data: ${map.size}`);
    return map;
  }, [diaryData, birthWeekMonday]);

  function handleCellClick(cell: GridCell) {
    if (cell.status === "future") return;

    // 计算该格子对应的自然周（周一到周日）
    const weekStart = new Date(birthWeekMonday);
    weekStart.setDate(weekStart.getDate() + cell.index * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const startDate = weekStart.toISOString().split("T")[0];
    const endDate = weekEnd.toISOString().split("T")[0];

    router.push(`/diary?start=${startDate}&end=${endDate}`);
  }

  function handleCellMouseEnter(e: React.MouseEvent, tooltipText: string) {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    const timeout = setTimeout(() => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setTooltip({
        text: tooltipText,
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
      });
    }, 500);

    hoverTimeoutRef.current = timeout;
  }

  function handleCellMouseLeave() {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setTooltip(null);
  }

  const COLS = 52;
  const rows = Math.ceil(cells.length / COLS);

  return (
    <div className="space-y-4">
      <div className="flex gap-6 text-sm text-stone-500">
        <span>已过 <strong className="text-stone-800">{stats.weeksLived}</strong> 周</span>
        <span>剩余 <strong className="text-stone-800">{stats.weeksRemaining}</strong> 周</span>
        <span>已用 <strong className="text-rose-400">{stats.percentageLived}%</strong></span>
        <span>当前 <strong className="text-stone-800">{stats.currentAge}</strong> 岁</span>
      </div>

      {loading && <p className="text-sm text-stone-400">加载日记数据中...</p>}
      {!loading && diaryData.length > 0 && (
        <p className="text-sm text-stone-400">已加载 {diaryData.length} 条日记</p>
      )}

      {/* 自定义 Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 text-xs text-white bg-stone-800 rounded whitespace-pre-line pointer-events-none"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          {tooltip.text}
        </div>
      )}

      <div className="h-[600px] overflow-auto rounded-xl border border-stone-100 bg-white p-4">
        <div className="space-y-1">
          {Array.from({ length: rows }, (_, rowIndex) => {
            const rowCells = cells.slice(rowIndex * COLS, rowIndex * COLS + COLS);
            const rowAge = rowIndex;

            return (
              <div key={rowIndex} className="flex gap-[2px] mb-[2px] items-center">
                {rowAge % 5 === 0 && (
                  <span className="mr-2 w-6 text-right text-[10px] text-stone-400">
                    {rowAge}
                  </span>
                )}
                {rowAge % 5 !== 0 && <span className="mr-2 w-6" />}

                {rowCells.map((cell) => {
                  let colorClass = cellColors[cell.status];
                  let tooltipText = `${cell.age} 岁第 ${(cell.index % 52) + 1} 周`;

                  if (cell.status === "past" && !loading) {
                    // cell.index 直接对应自然周索引（因为 handleCellClick 也是这样计算的）
                    const weekStats = weekStatsMap.get(cell.index);
                    if (weekStats && (weekStats.red > 0 || weekStats.blue > 0)) {
                      // 有日记数据，使用心情颜色
                      colorClass = cellColors[weekStats.color];
                      tooltipText += `\n红: ${weekStats.red} 天, 蓝: ${weekStats.blue} 天`;
                    } else {
                      // 没有日记数据，使用无记录颜色
                      colorClass = cellColors["past_no_data"];
                      tooltipText += "\n无记录";
                    }
                  }

                  return (
                    <button
                      key={cell.index}
                      onClick={() => handleCellClick(cell)}
                      onMouseEnter={(e) => handleCellMouseEnter(e, tooltipText)}
                      onMouseLeave={handleCellMouseLeave}
                      className={`h-[10px] w-[10px] rounded-[1px] ${colorClass} ${
                        cell.status !== "future" ? "cursor-pointer hover:opacity-80" : "cursor-default"
                      }`}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4 text-xs text-stone-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-[1px] bg-rose-400" /> 红色多
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-[1px] bg-sky-400" /> 蓝色多
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-[1px] bg-purple-400" /> 红蓝相等
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-[1px] bg-stone-400" /> 无记录
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-[1px] border border-stone-200 bg-stone-100" /> 未来
        </span>
      </div>
    </div>
  );
}