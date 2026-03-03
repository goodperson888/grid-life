/**
 * 验证 Cloudflare Turnstile token
 * @param token 前端返回的 token
 * @returns 是否验证成功
 */
export async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // 如果没有配置密钥，跳过验证（开发环境）
  if (!secretKey || secretKey === "your_turnstile_secret_key") {
    return true;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Turnstile 验证失败:", error);
    return false;
  }
}
