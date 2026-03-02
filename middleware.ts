import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isDashboard = req.nextUrl.pathname.startsWith("/grid") ||
    req.nextUrl.pathname.startsWith("/diary") ||
    req.nextUrl.pathname.startsWith("/calculator");

  // 未登录访问 dashboard 路由，跳转到登录页
  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 已登录访问登录/注册页，跳转到格子图
  if (isLoggedIn && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")) {
    return NextResponse.redirect(new URL("/grid", req.nextUrl));
  }
});

export const config = {
  matcher: ["/grid/:path*", "/diary/:path*", "/calculator/:path*", "/login", "/register"],
};
