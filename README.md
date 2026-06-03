# 🧩 方块大师（BlockMaster）

一款基于微信小游戏平台的几何填充解谜游戏，对标实体桌游"计客超级积木"。

## 玩法
用指定颜色的积木块，填满目标区域。规则简单，难度递增，1000+ 关挑战。

## 技术栈
- **平台**：微信小游戏（原生 JS / Canvas2D）
- **关卡**：算法离线生成 + JSON 配置
- **后端**：微信云开发（存档 + 关卡热更）
- **变现**：IAA（激励视频 + Banner + 插屏）

## 目录结构
```
games/
├── tools/                  # 离线工具（关卡生成器等）
│   ├── level-generator.js  # 关卡生成器
│   ├── solver.js           # 求解器（验证关卡）
│   ├── block-shapes.js     # 积木形状定义
│   └── build-levels.js     # 批量生成入口
├── minigame/               # 微信小游戏工程
│   ├── game.js             # 入口
│   ├── game.json           # 配置
│   ├── project.config.json # 项目配置
│   ├── src/                # 源码
│   │   ├── core/           # 核心玩法
│   │   ├── ui/             # 界面
│   │   ├── system/         # 业务系统
│   │   ├── ad/             # 广告
│   │   └── utils/          # 工具
│   ├── data/               # 数据
│   │   ├── levels/         # 关卡 JSON（500 关）
│   │   ├── skins.json      # 皮肤配置
│   │   └── stickers.json   # 贴纸配置
│   └── assets/             # 美术资源
└── docs/                   # 设计文档
```

## 快速开始

### 1. 生成关卡数据
```bash
cd tools
node build-levels.js
```
将在 `minigame/data/levels/` 下生成 500 关 JSON。

### 2. 在微信开发者工具打开
- 打开微信开发者工具
- 导入项目，选择 `minigame/` 目录
- 填入小游戏 AppID（测试号或正式号）
- 即可预览

## 开发进度
- [x] 工程脚手架
- [x] 关卡生成器（500 关）
- [x] 核心玩法（网格/拖拽/旋转/判定）
- [ ] 皮肤系统
- [ ] 奖励系统
- [ ] 广告接入
- [ ] 云开发存档
