# Hello World Roguelite Platformer - 项目概览

## 🎮 项目简介

/workspace/app-7s0h4s9cj85d/'EOF'Web平台跳跃游戏，结合了Roguelite元素，所有陷阱设计灵感来源于"Hello World"字母形态。

## ✨ 核心特性

- **三种难度模式**：简单、普通、困难
- **10个随机关卡**：每次游戏体验都不同
- **字母陷阱系统**：基于H、E、L、O、W、R、D设计
- **道具收集**：10种独特的字母道具
- **成就系统**：永久铭牌奖励
- **数据持久化**：Supabase云端存储

## 🛠️ 技术栈

- **前端**：React 18 + TypeScript + Tailwind CSS
- **UI组件**：shadcn/ui
- **游戏引擎**：Canvas 2D API
- **后端**：Supabase (PostgreSQL)
- **构建工具**：Vite

## 📁 项目结构

```
src/
 components/
   ├── game/           # 游戏组件
   └── ui/             # UI组件库
 db/                 # 数据库API
 game/               # 游戏逻辑
 pages/              # 页面组件
 types/              # 类型定义
```

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建生产版本
pnpm run build
```

## 📚 文档

- [游戏指南](./GAME_GUIDE.md) - 游戏玩法说明
- [快速开始](./docs/QUICK_START.md) - 新手入门
- [功能清单](./docs/FEATURES.md) - 完整功能列表
- [项目总结](./docs/PROJECT_SUMMARY.md) - 技术详解
- [部署指南](./docs/DEPLOYMENT.md) - 部署说明

## 🎯 游戏玩法

1. 选择难度（简单/普通/困难）
2. 使用方向键控制角色移动和跳跃
3. 避开红色字母陷阱
4. 收集金色道具
5. 到达绿色星星终点
6. 完成10个关卡获得铭牌成就

## 🎨 设计理念

- **配色**：橙黄色系 + 薄荷绿 + 活力紫
- **风格**：简洁现代，圆润可爱
- **体验**：流畅操作，即时反馈

## 📊 项目状态

- ✅ 核心功能：100%完成
- ✅ UI设计：100%完成
- ✅ 数据持久化：100%完成
- ✅ 代码质量：通过所有检查
- ⏳ 扩展功能：30%完成

## 🤝 贡献

Issue和Pull Request！

## 📄 许可

2025 Hello World Game
