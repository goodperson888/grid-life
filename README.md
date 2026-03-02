# 格子人生 — 启动指南

## 项目已完成 ✅

所有核心功能已实现：
- ✅ 用户认证（邮箱密码注册/登录）
- ✅ 人生格子图（虚拟化渲染 + 年龄标注）
- ✅ 红蓝日记（月历 + 趋势图 + 月份切换）
- ✅ 剩余次数计算器（自定义事件 + 预设场景）
- ✅ SessionProvider 配置
- ✅ 所有 API Routes

---

## 启动步骤

### 1. 配置数据库

去 [neon.tech](https://neon.tech) 注册并创建数据库，复制连接字符串。

编辑 `.env.local`：

```bash
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/gridlife?sslmode=require
NEXTAUTH_SECRET=（运行 openssl rand -base64 32 生成）
NEXTAUTH_URL=http://localhost:3000
```

### 2. ��表

```bash
cd /Users/a1/Documents/test/grid-life
npx drizzle-kit push
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 使用流程

1. 首次访问自动跳转到登录页
2. 点击"注册"创建账号
3. 登录后进入格子图页面
4. 输入出生日期，查看人生格子
5. 左侧导航切换到红蓝日记、剩余次数

---

## 核心功能说明

### 人生格子图
- 每格代表一周，灰色=已过去，红色闪烁=当前，空白=未来
- 使用 @tanstack/react-virtual 虚拟化渲染 4696 个格子
- 每 5 年显示一次年龄标注

### 红蓝日记
- 点击日历上的日期记录当天心情
- 红色=今天没白活，蓝色=将就的一天
- 月趋势图显示每周红蓝分布
- 支持上下月切换

### 剩余次数计算器
- 预设场景：和父母团聚、和老朋友见面、出去旅行
- 自定义事件：设置频率、年龄上限、质量衰减年龄
- 实时计算剩余次数和高质量次数

---

## 技术栈

- **前端**: Next.js 15 + React 18 + TypeScript
- **样式**: Tailwind CSS
- **认证**: NextAuth v5 (邮箱密码)
- **数据库**: PostgreSQL (Neon) + Drizzle ORM
- **图表**: Recharts
- **虚拟化**: @tanstack/react-virtual

---

项目已完整可用，祝开发顺利！🎉

---

## 部署到 Vercel

### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. 在 Vercel 部署

1. 访问 [vercel.com](https://vercel.com)，用 GitHub 登录
2. 点击 "Import Project"
3. 选择 `grid-life` 仓库
4. 配置环境变量：
   - `DATABASE_URL`: 你的 Neon 数据库连接字符串
   - `NEXTAUTH_SECRET`: 你的密钥（和本地一样）
   - `NEXTAUTH_URL`: `https://your-app.vercel.app`（部署后 Vercel 会提供）
5. 点击 "Deploy"

### 3. 部署后配置

部署完成后，Vercel 会给你一个域名（如 `grid-life-xxx.vercel.app`）：

1. 回到 Vercel 项目设置 → Environment Variables
2. 更新 `NEXTAUTH_URL` 为你的 Vercel 域名
3. 重新部署（Vercel 会自动触发）

完成！访问你的 Vercel 域名即可使用。
