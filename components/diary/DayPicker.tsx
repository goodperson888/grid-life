"use client";

import { useState, useEffect } from "react";
import type { DiaryEntryData, Mood } from "@/types";

interface DayPickerProps {
  date: string;           // "YYYY-MM-DD"
  existing?: DiaryEntryData;
  onSave: (mood: Mood, note: string) => Promise<void>;
  onClose?: () => void;
}

const moodConfig = {
  red: {
    label: "今天没白活 🔴",
    bg: "bg-rose-400 text-white",
    border: "border-rose-400",
    placeholder: "今天没白活是因为…（可不填）"
  },
  blue: {
    label: "将就的一天 🔵",
    bg: "bg-sky-400 text-white",
    border: "border-sky-400",
    placeholder: "今天为什么将就…（可不填）"
  },
};

export default function DayPicker({ date, existing, onSave, onClose }: DayPickerProps) {
  const [mood, setMood] = useState<Mood | null>(existing?.mood || null);
  const [note, setNote] = useState(existing?.note || "");
  const [saving, setSaving] = useState(false);

  // 当 date 或 existing 改变时，重置状态
  useEffect(() => {
    setMood(existing?.mood || null);
    setNote(existing?.note || "");
  }, [date, existing]);

  async function handleSave() {
    if (!mood) return;
    setSaving(true);
    await onSave(mood, note);
    setSaving(false);
  }

  // 根据选择的心情动态获取 placeholder
  const placeholder = mood ? moodConfig[mood].placeholder : "请先选择心情";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">{date}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="text-sm text-stone-400 hover:text-stone-600"
          >
            ✕ 关闭
          </button>
        )}
      </div>

      {/* 红蓝选择 */}
      <div className="flex gap-3">
        {(["red", "blue"] as Mood[]).map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            className={`flex-1 rounded-lg border-2 py-3 text-sm font-medium transition-all ${
              mood === m
                ? `${moodConfig[m].bg} ${moodConfig[m].border}`
                : "border-stone-200 text-stone-500 hover:border-stone-300"
            }`}
          >
            {moodConfig[m].label}
          </button>
        ))}
      </div>

      {/* 备注（可选） */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full resize-none rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-300"
      />

      <button
        onClick={handleSave}
        disabled={!mood || saving}
        className="w-full rounded-lg bg-stone-800 py-2 text-sm text-white hover:bg-stone-700 disabled:opacity-40 transition-colors"
      >
        {saving ? "保存中..." : "保存"}
      </button>
    </div>
  );
}
