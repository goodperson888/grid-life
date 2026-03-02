"use client";

import { useEffect, useState } from "react";
import LifeGrid from "@/components/grid/LifeGrid";
import type { UserProfile } from "@/types";

export default function GridPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((json) => {
        setProfile(json.data);
        if (json.data?.birthDate) setBirthDate(json.data.birthDate);
      });
  }, []);

  async function saveBirthDate() {
    setSaving(true);
    await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthDate }),
    });
    setProfile((p) => p ? { ...p, birthDate } : p);
    setSaving(false);
  }

  const hasBirthDate = profile?.birthDate;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-800">人生格子</h2>
        <p className="text-sm text-stone-400 mt-1">
          假设你活到 {profile?.expectedLifespan || 90} 岁，你的一生就是下面这些格子，每格代表一周。
        </p>
      </div>

      {/* 未设置生日时的引导 */}
      {!hasBirthDate && (
        <div className="rounded-xl border border-dashed border-stone-200 p-6 text-center space-y-3">
          <p className="text-stone-500 text-sm">输入你的出生日期，看看你已经用掉了多少格子</p>
          <div className="flex justify-center gap-3">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-rose-300"
            />
            <button
              onClick={saveBirthDate}
              disabled={!birthDate || saving}
              className="rounded-lg bg-rose-400 px-4 py-2 text-sm text-white hover:bg-rose-500 disabled:opacity-40"
            >
              {saving ? "保存中..." : "确认"}
            </button>
          </div>
        </div>
      )}

      {/* 格子图 */}
      {hasBirthDate && (
        <LifeGrid
          birthDate={new Date(profile!.birthDate!)}
          expectedLifespan={profile?.expectedLifespan || 90}
        />
      )}
    </div>
  );
}
