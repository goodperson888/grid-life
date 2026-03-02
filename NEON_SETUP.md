# Neon 数据库配置详细教程

## 第一步：创建 Neon 账号和项目

### 1. 注册/登录 Neon

访问 https://neon.tech 并注册账号（支持 GitHub/Google 登录）

### 2. 创建新项目

登录后会看到控制台，点击 **"Create a project"** 或 **"New Project"** 按钮

### 3. 填写项目信息

在创建项目页面，你会看到以下选项：

**Project name（项目名称）**
```
建议填写：grid-life
```

**Region（数据中心位置）**
```
选择离你最近的区域，推荐：
- 中国用户：Singapore (aws-ap-southeast-1)
- 其他：根据你的位置选择
```

**Postgres version（PostgreSQL 版本）**
```
保持默认：16（最新稳定版）
```

**Compute size（计算资源）**
```
免费套餐默认：0.25 vCPU, 1 GB RAM
保持默认即可
```

### 4. 点击 "Create Project"

等待几秒钟，项目创建完成。

---

## 第二步：获取数据库连接字符串

### 1. 项目创建成功后

你会看到一个弹窗显示连接信息，**重要：先不要关闭这个弹窗！**

### 2. 复制连接字符串

在弹窗中找到 **"Connection string"** 部分，你会看到类似这样的字符串：

```
postgresql://grid-life_owner:npg_xxxxxxxxxxxxx@ep-cool-name-12345678.ap-southeast-1.aws.neon.tech/grid-life?sslmode=require
```

**点击右侧的复制按钮** 📋

### 3. 如果不小心关闭了弹窗

不用担心，可以这样找回：

1. 在左侧菜单点击 **"Dashboard"**
2. 找到 **"Connection Details"** 区域
3. 确保选择了 **"Pooled connection"**（推荐）
4. 点击 **"Show password"** 按钮
5. 复制完整的连接字符串

---

## 第三步：配置项目环境变量

### 1. 打开项目目录

```bash
cd /Users/a1/Documents/test/grid-life
```

### 2. 编辑 .env.local 文件

用文本编辑器打开 `.env.local`，你会看到：

```bash
# 数据库连接（从 Neon 控制台获取）
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/gridlife?sslmode=require

# NextAuth 密钥（运行 openssl rand -base64 32 生成）
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### 3. 替换 DATABASE_URL

把刚才从 Neon 复制的连接字符串粘贴进去：

```bash
DATABASE_URL=postgresql://grid-life_owner:npg_xxxxxxxxxxxxx@ep-cool-name-12345678.ap-southeast-1.aws.neon.tech/grid-life?sslmode=require
```

### 4. 生成 NEXTAUTH_SECRET

在终端运行：

```bash
openssl rand -base64 32
```

会输出类似这样的字符串：
```
Xk7mP9qR2sT4vW8yZ1aC3dE5fG7hJ9kL0mN2oP4qR6s=
```

把它复制到 `.env.local`：

```bash
NEXTAUTH_SECRET=Xk7mP9qR2sT4vW8yZ1aC3dE5fG7hJ9kL0mN2oP4qR6s=
```

### 5. 最终的 .env.local 应该长这样

```bash
DATABASE_URL=postgresql://grid-life_owner:npg_xxxxxxxxxxxxx@ep-cool-name-12345678.ap-southeast-1.aws.neon.tech/grid-life?sslmode=require
NEXTAUTH_SECRET=Xk7mP9qR2sT4vW8yZ1aC3dE5fG7hJ9kL0mN2oP4qR6s=
NEXTAUTH_URL=http://localhost:3000
```

**保存文件！**

---

## 第四步：创建数据库表

### 1. 确保在项目目录

```bash
cd /Users/a1/Documents/test/grid-life
```

### 2. 运行 Drizzle 迁移命令

```bash
npx drizzle-kit push
```

你会看到类似这样的输出：

```
✓ Pulling schema from database...
✓ Changes detected
  + users
  + diary_entries
  + calculator_events
✓ Applying changes...
✓ Done!
```

这表示 3 张表已经成功创建。

---

## 第五步：启动项目

```bash
npm run dev
```

看到这样的输出就成功了：

```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

打开浏览器访问 http://localhost:3000

---

## 常见问题

### Q1: 提示 "Connection refused" 或 "ECONNREFUSED"

**原因**：DATABASE_URL 配置错误

**解决**：
1. 检查 `.env.local` 中的连接字符串是否完整
2. 确保没有多余的空格或换行
3. 重新从 Neon 控制台复制连接字符串

### Q2: 提示 "password authentication failed"

**原因**：密码错误或连接字符串过期

**解决**：
1. 去 Neon 控制台重置数据库密码
2. 在 Dashboard → Connection Details → Reset password
3. 重新复制新的连接字符串

### Q3: drizzle-kit push 报错 "relation already exists"

**原因**：表已经存在

**解决**：
- 这是正常的，说明表已经创建过了
- 可以直接跳过这一步，运行 `npm run dev`

### Q4: 免费套餐有什么限制？

Neon 免费套餐包括：
- ✅ 0.5 GB 存储空间（够用很久）
- ✅ 无限查询次数
- ✅ 无闲置暂停（不像 Supabase）
- ✅ 支持分支功能

---

## 验证配置是否成功

启动项目后：

1. 访问 http://localhost:3000
2. 点击"注册"
3. 输入邮箱和密码
4. 如果注册成功并跳转到格子图页面，说明数据库配置正确！

---

## Neon 控制台常用功能

### 查看数据

1. 进入 Neon 控制台
2. 点击左侧 **"SQL Editor"**
3. 可以运行 SQL 查询查看数据：

```sql
-- 查看所有用户
SELECT * FROM users;

-- 查看日记记录
SELECT * FROM diary_entries;

-- 查看计算器事件
SELECT * FROM calculator_events;
```

### 监控使用情况

1. 点击左侧 **"Monitoring"**
2. 可以看到：
   - 存储空间使用量
   - 查询次数
   - 连接数

---

配置完成！现在可以开始使用"格子人生"了 🎉
