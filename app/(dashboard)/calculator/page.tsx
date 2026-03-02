"use client";

import { useEffect, useState } from "react";
import EventCard from "@/components/calculator/EventCard";
import EventForm from "@/components/calculator/EventForm";
import type { CalculatorEventData, UserProfile } from "@/types";

// 预设场景，方便用户快速添加
const PRESETS = [
  { name: "和父母团聚", frequencyPerYear: 2, activeUntilAge: 85 },
  { name: "和老朋友见面", frequencyPerYear: 1, activeUntilAge: 85 },
  { name: "出去旅行", frequencyPerYear: 4, activeUntilAge: 75, qualityDecayAge: 55 },
];

export default function CalculatorPage() {
  const [events, setEvents] = useState<CalculatorEventData[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalculatorEventData | null>(null);

  useEffect(() => {
    fetch("/api/calculator").then((r) => r.json()).then((j) => setEvents(j.data || []));
    fetch("/api/user/profile").then((r) => r.json()).then((j) => setProfile(j.data));
  }, []);

  async function handleAdd(data: {
    name: string;
    frequencyPerYear: number;
    activeUntilAge: number;
    qualityDecayAge?: number | null;
  }) {
    const payload = { ...data, qualityDecayAge: data.qualityDecayAge ?? null };
    const res = await fetch("/api/calculator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setEvents((prev) => [...prev, json.data]);
    setShowForm(false);
  }

  async function handleEdit(data: {
    name: string;
    frequencyPerYear: number;
    activeUntilAge: number;
    qualityDecayAge?: number | null;
  }) {
    if (!editingEvent) return;
    const payload = { ...data, qualityDecayAge: data.qualityDecayAge ?? null };
    const res = await fetch(`/api/calculator/${editingEvent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await res.json();
    // 更新本地状态
    setEvents((prev) =>
      prev.map((e) => (e.id === editingEvent.id ? { ...e, ...payload } : e))
    );
    setEditingEvent(null);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/calculator/${id}`, { method: "DELETE" });
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  function startEdit(id: string) {
    const event = events.find((e) => e.id === id);
    if (event) {
      setEditingEvent(event);
      setShowForm(false);
    }
  }

  // 从出生日期计算当前年龄
  const currentAge = profile?.birthDate
    ? Math.floor((Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 30; // 未设置生日时默认 30 岁

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-800">剩余次数</h2>
        <p className="text-sm text-stone-400 mt-1">你想做的事情，用一次少一次。</p>
      </div>

      {/* 预设场景快速添加 */}
      {events.length === 0 && !showForm && !editingEvent && (
        <div className="space-y-2">
          <p className="text-xs text-stone-400">快速添加预设场景：</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => handleAdd({ ...p, qualityDecayAge: (p as any).qualityDecayAge || null })}
                className="rounded-full border border-stone-200 px-3 py-1 text-sm text-stone-600 hover:bg-stone-50"
              >
                + {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 事件列表 */}
      <div className="space-y-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            currentAge={currentAge}
            onDelete={handleDelete}
            onEdit={startEdit}
          />
        ))}
      </div>

      {/* 编辑表单 */}
      {editingEvent && (
        <EventForm
          initialData={editingEvent}
          onSubmit={handleEdit}
          onCancel={() => setEditingEvent(null)}
        />
      )}

      {/* 添加表单 */}
      {showForm && !editingEvent ? (
        <EventForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      ) : !editingEvent ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-xl border border-dashed border-stone-200 py-3 text-sm text-stone-400 hover:border-stone-300 hover:text-stone-500 transition-colors"
        >
          + 添加自定义事件
        </button>
      ) : null}
    </div>
  );
}
