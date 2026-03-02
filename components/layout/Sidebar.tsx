"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/grid", label: "人生格子", icon: "⬜" },
  { href: "/diary", label: "红蓝日记", icon: "🔴" },
  { href: "/calculator", label: "剩余次数", icon: "🔢" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-52 flex-col border-r border-stone-100 bg-white px-4 py-6">
      {/* Logo */}
      <div className="mb-8 px-2">
        <h1 className="text-lg font-semibold text-stone-800">格子人生</h1>
        <p className="text-xs text-stone-400">用数字照见人生的重量</p>
      </div>

      {/* 导航 */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-rose-50 text-rose-500 font-medium"
                  : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 退出登录 */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="rounded-lg px-3 py-2 text-left text-sm text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-colors"
      >
        退出登录
      </button>
    </aside>
  );
}
