"use client";

import { useState, useEffect } from "react";
import type { CalculatorEventData } from "@/types";

interface EventFormProps {
  initialData?: CalculatorEventData; // 编辑时传入初始数据
  onSubmit: (data: {
    name: string;
    frequencyPerYear: number;
    activeUntilAge: number;
    qualityDecayAge?: number;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function EventForm({ initialData, onSubmit, onCancel }: EventFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    frequencyPerYear: initialData?.frequencyPerYear || 2,
    activeUntilAge: initialData?.activeUntilAge || 80,
    qualityDecayAge: initialData?.qualityDecayAge?.toString() || "",
  });
  const [saving, setSaving] = useState(false);

  // 当 initialData 改变时更新表单
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        frequencyPerYear: initialData.frequencyPerYear,
        activeUntilAge: initialData.activeUntilAge,
        qualityDecayAge: initialData.qualityDecayAge?.toString() || "",
      });
    }
  }, [initialData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSubmit({
      name: form.name,
      frequencyPerYear: form.frequencyPerYear,
      activeUntilAge: form.activeUntilAge,
      qualityDecayAge: form.qualityDecayAge ? Number(form.qualityDecayAge) : undefined,
    });
    setSaving(false);
  }

  const isEditing = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
      <div>
        <label className="block text-xs text-stone-500 mb-1">事件名称</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          placeholder="例如：和父母团聚"
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-300"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs text-stone-500 mb-1">每年几次</label>
          <input
            type="number"
            min={1}
            value={form.frequencyPerYear}
            onChange={(e) => setForm({ ...form, frequencyPerYear: Number(e.target.value) })}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-300"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-stone-500 mb-1">做到几岁</label>
          <input
            type="number"
            min={1}
            value={form.activeUntilAge}
            onChange={(e) => setForm({ ...form, activeUntilAge: Number(e.target.value) })}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-300"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-stone-500 mb-1">质量衰减年龄（可选）</label>
          <input
            type="number"
            value={form.qualityDecayAge}
            onChange={(e) => setForm({ ...form, qualityDecayAge: e.target.value })}
            placeholder="如 60"
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-300"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-stone-800 py-2 text-sm text-white hover:bg-stone-700 disabled:opacity-40"
        >
          {saving ? (isEditing ? "保存中..." : "添加中...") : (isEditing ? "保存" : "添加")}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-500 hover:bg-stone-100">
          取消
        </button>
      </div>
    </form>
  );
}
