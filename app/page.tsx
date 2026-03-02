import { redirect } from "next/navigation";

// 根路径重定向到格子图页面
export default function Home() {
  redirect("/grid");
}
