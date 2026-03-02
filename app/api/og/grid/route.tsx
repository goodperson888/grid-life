import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weeksLived = searchParams.get("weeksLived") || "0";
    const weeksTotal = searchParams.get("weeksTotal") || "4680";
    const percentage = searchParams.get("percentage") || "0";
    const age = searchParams.get("age") || "0";

    console.log("[OG] Generating poster:", { weeksLived, weeksTotal, percentage, age });

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fafaf9",
            padding: "60px",
          }}
        >
          {/* 标题 */}
          <div
            style={{
              fontSize: 48,
              fontWeight: "bold",
              color: "#1c1917",
              marginBottom: "20px",
            }}
          >
            我的人生格子图
          </div>

          {/* 统计数据 */}
          <div
            style={{
              display: "flex",
              gap: "40px",
              marginBottom: "40px",
              fontSize: 24,
              color: "#57534e",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 48, fontWeight: "bold", color: "#fb7185" }}>
                {percentage}%
              </div>
              <div>已使用</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 48, fontWeight: "bold", color: "#1c1917" }}>
                {weeksLived}
              </div>
              <div>已过周数</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 48, fontWeight: "bold", color: "#1c1917" }}>
                {parseInt(weeksTotal) - parseInt(weeksLived)}
              </div>
              <div>剩余周数</div>
            </div>
          </div>

          {/* 文案 */}
          <div
            style={{
              fontSize: 28,
              color: "#57534e",
              textAlign: "center",
              maxWidth: "800px",
              lineHeight: 1.6,
            }}
          >
            我已经用掉了 {percentage}% 的人生，
            <br />
            剩下的每一格，我想认真填。
          </div>

          {/* 底部信息 */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              fontSize: 20,
              color: "#a8a29e",
            }}
          >
            格子人生 · 让每一天都值得被填红
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("[OG] Error generating poster:", error);
    return new Response("Error generating poster", { status: 500 });
  }
}
