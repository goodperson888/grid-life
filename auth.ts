import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

// 导出 NextAuth 实例，供 middleware 和 API route 使用
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
