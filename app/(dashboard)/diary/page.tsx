"use client";

import { Suspense } from "react";
import DiaryPageContent from "./DiaryPageContent";

export default function DiaryPage() {
  return (
    <Suspense fallback={<div className="text-sm text-stone-400">加载中...</div>}>
      <DiaryPageContent />
    </Suspense>
  );
}
