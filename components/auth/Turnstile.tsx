"use client";

import { useEffect, useRef } from "react";

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export default function Turnstile({ siteKey, onVerify, onError }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // 如果没有配置 siteKey，不渲染
    if (!siteKey || siteKey === "your_turnstile_site_key") {
      return;
    }

    // 防止重复加载
    if (scriptLoadedRef.current) {
      return;
    }

    // 检查脚本是否已经存在
    const existingScript = document.querySelector(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
    );

    const renderWidget = () => {
      if (containerRef.current && window.turnstile && !widgetIdRef.current) {
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: onVerify,
            "error-callback": onError,
            theme: "light",
            size: "normal",
          });
        } catch (error) {
          console.error("Turnstile render error:", error);
        }
      }
    };

    if (existingScript) {
      // 脚本已存在，直接渲染
      if (window.turnstile) {
        renderWidget();
      } else {
        existingScript.addEventListener("load", renderWidget);
      }
      scriptLoadedRef.current = true;
    } else {
      // 加载新脚本
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
      scriptLoadedRef.current = true;
    }

    return () => {
      // 清理 widget，但不删除脚本（避免其他实例出问题）
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (error) {
          console.error("Turnstile cleanup error:", error);
        }
      }
    };
  }, [siteKey]);

  // 如果没有配置 siteKey，显示提示
  if (!siteKey || siteKey === "your_turnstile_site_key") {
    return (
      <div className="text-xs text-stone-400 text-center">
        Turnstile 未配置（开发环境可跳过）
      </div>
    );
  }

  return <div ref={containerRef} />;
}

