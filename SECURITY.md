# 安全防护配置指南

## 已实现的防护措施

### 1. 内存速率限制 ✅
**无需配置，已自动启用**

- **注册限制**：
  - 同一 IP 每小时最多注册 3 次
  - 同一邮箱每天最多尝试注册 5 次

- **登录限制**：
  - 同一邮箱每 15 分钟最多尝试登录 5 次

**效果**：防止脚本批量注册和暴力破解，正常用户不受影响

---

### 2. Cloudflare Turnstile 验证码（可选）

#### 为什么需要？
- 内存速率限制只能防止高频攻击
- Turnstile 可以防止低频但持续的机器人攻击
- 用户体验好，大部分情况下自动通过

#### 如何配置？

**步骤 1：注册 Cloudflare Turnstile**
1. 访问 https://dash.cloudflare.com/sign-up/turnstile
2. 使用 GitHub 或 Google 账号登录
3. 点击 "Add Site"
4. 填写信息：
   - Site Name: `grid-life`
   - Domain: 你的域名（如 `grid-life.vercel.app`）
   - Widget Mode: 选择 `Managed`
5. 获取两个密钥：
   - **Site Key**（公开，前端使用）
   - **Secret Key**（私密，后端使用）

**步骤 2：配置环境变量**

在 Vercel 项目设置中添加：
```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=你的_site_key
TURNSTILE_SECRET_KEY=你的_secret_key
```

**步骤 3：重新部署**

配置完成后，Vercel 会自动重新部署，Turnstile 验证码就会出现在注册和登录页面。

---

### 3. Vercel DDoS 防护 ✅
**无需配置，Vercel 自动提供**

- 自动识别异常流量
- 自动限制单个 IP 的请求频率
- 分布式 Edge Network 防护

---

## 开发环境说明

- 如果没有配置 Turnstile 密钥，验证码会显示提示文字但不会阻止操作
- 速率限制在开发环境也会生效，但服务器重启后会重置

---

## 推荐配置

### 个人项目（低风险）
✅ 内存速率限制（已启用）
✅ Vercel DDoS 防护（已启用）
❌ Turnstile（可选）

### 公开项目（中等风险）
✅ 内存速率限制（已启用）
✅ Vercel DDoS 防护（已启用）
✅ Turnstile（推荐配置）

---

## 常见问题

**Q: 我忘记密码了，多次尝试登录被限制怎么办？**
A: 等待 15 分钟后自动解除限制

**Q: Turnstile 在中国能用吗？**
A: 可以，但可能比国外慢 1-2 秒（Cloudflare 在中国有节点）

**Q: 如果不配置 Turnstile 会怎样？**
A: 不影响使用，只是少了一层防护。对个人项目来说，速率限制已经足够

**Q: 服务器重启后速率限制会失效吗？**
A: 会清空记录，但攻击者也需要重新开始计数。如果需要持久化，可以考虑使用 Upstash Redis

---

## 监控建议

定期检查 Vercel 的日志，关注：
- 429 状态码（速率限制触发）
- 大量来自同一 IP 的请求
- 异常的注册/登录模式

如果发现异常，可以考虑：
1. 降低速率限制阈值
2. 启用 Turnstile
3. 使用 Upstash Redis 实现持久化速率限制
