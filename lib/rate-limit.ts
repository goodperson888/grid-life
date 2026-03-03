// 简单的内存速率限制器
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

// 清理过期记录（每小时执行一次）
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now > record.resetAt) {
      store.delete(key);
    }
  }
}, 60 * 60 * 1000);

export interface RateLimitOptions {
  interval: number; // 时间窗口（毫秒）
  maxRequests: number; // 最大请求次数
}

/**
 * 检查是否超过速率限制
 * @param identifier 标识符（如 IP 地址或邮箱）
 * @param options 限制选项
 * @returns 是否允许请求
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = store.get(identifier);

  // 如果没有记录或已过期，创建新记录
  if (!record || now > record.resetAt) {
    const resetAt = now + options.interval;
    store.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: options.maxRequests - 1, resetAt };
  }

  // 检查是否超过限制
  if (record.count >= options.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  // 增加计数
  record.count++;
  return {
    allowed: true,
    remaining: options.maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * 获取客户端 IP 地址
 */
export function getClientIP(request: Request): string {
  // Vercel 提供的 IP 头
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  return "unknown";
}
