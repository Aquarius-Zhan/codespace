# Hello World 游戏 - 部署指南

## 🚀 快速部署

游戏已经完全配置好，可以直接部署使用。

## 📋 部署前检查

### 1. 环境变量
确认 `.env` 文件中的Supabase配置：
```env
VITE_SUPABASE_URL=https://backend.appmiaoda.com/projects/supabase251261333083832320
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. 数据库迁移
数据库表已自动创建，包括：
- `players` - 玩家表
- `achievements` - 成就表
- `game_records` - 游戏记录表

### 3. 依赖安装
```bash
pnpm install
```

## 🏗️ 构建项目

### 开发模式
```bash
pnpm run dev
```
访问 `http://localhost:5173`

### 生产构建
```bash
pnpm run build
```
构建产物在 `dist/` 目录

### 预览构建
```bash
pnpm run preview
```

## 🌐 部署平台

### Vercel（推荐）
1. 连接GitHub仓库
2. 自动检测Vite项目
3. 添加环境变量
4. 点击部署

### Netlify
1. 连接GitHub仓库
2. 构建命令：`pnpm run build`
3. 发布目录：`dist`
4. 添加环境变量
5. 点击部署

### 其他平台
任何支持静态网站的平台都可以部署：
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront
- 阿里云OSS

## 🔧 配置说明

### 环境变量
必需的环境变量：
- `VITE_SUPABASE_URL` - Supabase项目URL
- `VITE_SUPABASE_ANON_KEY` - Supabase匿名密钥

### 构建配置
- 构建工具：Vite
- 输出目录：`dist/`
- Node版本：>= 18
- 包管理器：pnpm（推荐）

## 📊 性能优化

### 已实现的优化
- ✅ 代码分割
- ✅ Tree shaking
- ✅ 资源压缩
- ✅ Canvas优化
- ✅ 懒加载

### 建议的CDN配置
```
Cache-Control: public, max-age=31536000, immutable
```
适用于：
- `/assets/*` - 静态资源
- `/favicon.png` - 图标

## 🔒 安全配置

### Supabase安全
- ✅ 使用匿名密钥（anon key）
- ✅ 数据库表无RLS（公开访问）
- ✅ 无敏感数据存储

### CORS配置
Supabase已自动配置CORS，无需额外设置。

## 📱 移动端支持

### 响应式设计
- ✅ 自适应布局
- ✅ 触摸控制支持
- ✅ 移动端优化

### PWA支持（可选）
如需PWA支持，可添加：
1. `manifest.json`
2. Service Worker
3. 离线缓存

## 🐛 故障排查

### 常见问题

**问题1：游戏无法加载**
- 检查环境变量是否正确
- 检查Supabase服务是否正常
- 查看浏览器控制台错误

**问题2：数据无法保存**
- 检查Supabase连接
- 检查数据库表是否创建
- 查看网络请求是否成功

**问题3：游戏卡顿**
- 检查浏览器性能
- 关闭其他标签页
- 使用Chrome浏览器

## 📈 监控建议

### 推荐的监控工具
- **Sentry** - 错误追踪
- **Google Analytics** - 用户分析
- **Vercel Analytics** - 性能监控

### 关键指标
- 页面加载时间
- 游戏帧率（FPS）
- 用户留存率
- 关卡完成率

## 🔄 更新部署

### 更新流程
1. 修改代码
2. 运行 `pnpm run lint` 检查
3. 提交到Git
4. 自动触发部署（CI/CD）

### 数据库迁移
如需更新数据库结构：
1. 创建新的迁移文件
2. 使用 `supabase_apply_migration`
3. 更新类型定义

## ✅ 部署检查清单

部署前确认：
- [ ] 环境变量已配置
- [ ] 数据库表已创建
- [ ] 代码检查通过（`pnpm run lint`）
- [ ] 本地测试通过
- [ ] 构建成功（`pnpm run build`）

部署后确认：
- [ ] 网站可以访问
- [ ] 游戏可以正常运行
- [ ] 数据可以保存
- [ ] 移动端正常显示
- [ ] 成就系统正常

## 🎉 部署完成

恭喜！你的Hello World游戏已经成功部署！

现在可以：
1. 分享游戏链接给朋友
2. 收集用户反馈
3. 持续优化改进

祝游戏运营顺利！🚀
