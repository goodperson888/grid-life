"use client";

import { useState } from "react";
import { calculateRemainingTimes } from "@/lib/calculations/remaining";
import type { CalculatorEventData } from "@/types";

interface EventCardProps {
  event: CalculatorEventData;
  currentAge: number;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export default function EventCard({ event, currentAge, onDelete, onEdit }: EventCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const result = calculateRemainingTimes(
    currentAge,
    event.activeUntilAge,
    event.frequencyPerYear,
    event.qualityDecayAge ?? undefined
  );

  return (
    <div className="rounded-xl border border-stone-100 bg-white p-5 space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="font-medium text-stone-800">{event.name}</h3>
        {/* 编辑和删除按钮 */}
        {showConfirm ? (
          <div className="flex gap-2 text-xs">
            <button onClick={() => onDelete(event.id)} className="text-red-400 hover:underline">确认删除</button>
            <button onClick={() => setShowConfirm(false)} className="text-stone-400 hover:underline">取消</button>
          </div>
        ) : (
          <div className="flex gap-2 text-xs">
            <button onClick={() => onEdit(event.id)} className="text-stone-400 hover:text-stone-600">编辑</button>
            <button onClick={() => setShowConfirm(true)} className="text-stone-300 hover:text-stone-400">删除</button>
          </div>
        )}
      </div>

      {/* 剩余次数 */}
      <div className="flex gap-4">
        <div>
          <p className="text-3xl font-bold text-stone-800">{result.totalRemaining}</p>
          <p className="text-xs text-stone-400">总剩余次数</p>
        </div>
        {event.qualityDecayAge && result.highQualityRemaining !== result.totalRemaining && (
          <div>
            <p className="text-3xl font-bold text-rose-400">{result.highQualityRemaining}</p>
            <p className="text-xs text-stone-400">高质量次数</p>
          </div>
        )}
      </div>

      {/* 参数说明 */}
      <p className="text-xs text-stone-400">
        每年 {event.frequencyPerYear} 次 · 预计做到 {event.activeUntilAge} 岁 · 还剩 {result.yearsLeft} 年
      </p>
    </div>
  );
}
