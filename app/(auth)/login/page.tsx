"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Turnstile from "@/components/auth/Turnstile";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 如果配置了 Turnstile 但没有 token，提示用户
    if (siteKey && siteKey !== "your_turnstile_site_key" && !turnstileToken) {
      setError("请完成人机验证");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      turnstileToken,
      redirect: false,
    });

    if (result?.error) {
      setError("邮箱或密码错误");
      setLoading(false);
    } else {
      router.push("/grid");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-8">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-stone-800">格子人生</h1>
          <p className="mt-1 text-sm text-stone-500">用数字照见人生的重量</p>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-stone-600 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-300"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-stone-600 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-300"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Turnstile 验证码 */}
          <Turnstile
            siteKey={siteKey}
            onVerify={(token) => setTurnstileToken(token)}
            onError={() => setError("人机验证失败，请刷新页面重试")}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-rose-400 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-50 transition-colors"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500">
          还没有账号？{" "}
          <Link href="/register" className="text-rose-400 hover:underline">
            注册
          </Link>
        </p>
      </div>
    </div>
  );
}
