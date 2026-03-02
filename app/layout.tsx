import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "格子人生",
  description: "用数字照见人生的重量，让每一天都值得被填红",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-stone-50 text-stone-800 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
