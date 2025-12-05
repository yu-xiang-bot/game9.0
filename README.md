# 塔防联盟

 

塔防联盟是一款基于 Vue3 和 TypeScript 开发的网页塔防游戏，支持 PC 端和移动端。游戏采用 Canvas 渲染和 Web Worker 技术实现高性能游戏体验。

**项目已按照现代前端标准进行结构重组，采用清晰的分层架构和模块化组织。**

### 作者信息
- **作者**：yx
- **邮箱**：1829738634@qq.com

 
## 技术栈

### 核心技术
- **Vue 3.3.4** - 响应式前端框架
- **TypeScript 5.1.6** - 类型安全的 JavaScript
- **Vite 3.2.0** - 快速的前端构建工具
- **Vue Router 4.1.6** - 官方路由管理器
- **Pinia 2.0.28** - 现代化状态管理
- **Pinia Plugin Persist** - 状态持久化插件

### 游戏渲染技术
- **Canvas API** - 高性能 2D 渲染
- **OffscreenCanvas** - 离屏画布渲染
- **Web Worker** - 多线程计算支持
- **RequestAnimationFrame** - 流畅的动画帧管理

### UI 与工具
- **Element Plus 2.8.2** - 企业级 UI 组件库
- **Less 3.13.1** - 动态 CSS 预处理器
- **Axios 1.7.7** - HTTP 请求库
- **Lodash 4.17.21** - 实用工具库
- **Crypto-js 4.2.0** - 加密算法库
- **@supabase/supabase-js** - Supabase JavaScript 客户端

## 游戏特色

### 核心玩法
- 🏰 **塔防策略** - 精心设计塔防布局，阻止敌人入侵
- 🧟 **多样敌人** - 10+ 种不同特性敌人，各有独特行为模式
- 🔫 **丰富塔防** - 12 种特色防御塔，各有不同攻击方式和技能
- 🎮 **多关卡挑战** - 普通关卡、试玩模式和无尽模式
- 📱 **跨平台支持** - 完美适配 PC 端和移动端

### 技术亮点
- 🚀 **高性能渲染** - Canvas + Web Worker 确保流畅游戏体验
- 📊 **响应式设计** - 自适应不同屏幕尺寸
- 🔄 **状态持久化** - 使用 Pinia 实现游戏进度保存
- 🎯 **模块化架构** - 清晰的项目结构和组件划分

## 项目结构

```
GAME1.0/
├── .github/                # GitHub 配置（Actions、Issues 等）
├── .vercel/                # Vercel 部署配置
├── docs/                   # 📚 项目文档
│   ├── 参考代码.md           # 参考代码文档
│   ├── 功能文档.md           # 功能说明文档
│   ├── 需求设计文档.md       # 需求设计说明
│   └── API文档.md           # API 接口文档
├── scripts/                # 🔧 脚本目录
│   ├── add-test-data.js     # 测试数据生成脚本
│   ├── check-db.js          # 数据库检查脚本
│   ├── create-simple-test.js # 简单测试创建脚本
│   ├── setup-database.js    # 数据库初始化脚本
│   ├── update-database.js   # 数据库更新脚本
│   └── database/           # 数据库脚本
│       ├── supabase-init.sql    # Supabase 数据库初始化
│       └── update-user-profile.sql # 用户表更新脚本
├── src/                    # 💻 前端源代码（按技术/功能分层）
│   ├── api/                # API 请求封装
│   │   └── request.ts      # 统一请求封装
│   ├── components/         # 通用 UI 组件
│   │   ├── AdminDashboard.vue    # 后台管理面板
│   │   ├── coverCanvas.vue       # 关卡封面画布
│   │   ├── enemyInfoPop.vue      # 敌人信息弹窗
│   │   ├── loading.vue           # 加载组件
│   │   ├── rankList.vue          # 排行榜组件
│   │   ├── selectLevelPop.vue    # 选择关卡弹窗
│   │   ├── selectTips.vue        # 选择提示组件
│   │   ├── selectTowerPop.vue    # 选择塔防弹窗
│   │   ├── towerCanvas.vue       # 塔防画布组件
│   │   ├── userBall.vue          # 用户信息球
│   │   └── userInfo.vue          # 用户信息组件
│   ├── views/              # 页面级组件
│   │   ├── index.vue       # 主页面
│   │   ├── login.vue       # 登录页面
│   │   ├── admin/          # 管理后台页面
│   │   │   └── index.vue   # 管理后台主界面
│   │   ├── gameWorker/     # 游戏工作区
│   │   │   ├── game.vue    # 游戏主界面
│   │   │   ├── index.vue   # 游戏入口
│   │   │   ├── components/ # 游戏组件
│   │   │   ├── hooks/      # 游戏专用 Hooks
│   │   │   └── workers/    # Web Worker 脚本
│   │   ├── dev/            # 开发工具
│   │   │   └── createMap/  # 地图编辑器
│   │   └── teamfightTactics/ # 策略模式
│   ├── hooks/              # 自定义 Hooks
│   │   └── useKeepInterval.ts  # 间隔控制 Hook
│   ├── stores/             # 状态管理（Pinia）
│   │   ├── setting.ts      # 设置状态
│   │   ├── source.ts       # 资源状态
│   │   ├── sourceInstance.ts # 资源实例
│   │   └── userInfo.ts     # 用户信息状态
│   ├── types/              # ✨ TypeScript 类型定义（已整合）
│   │   ├── enemy.ts        # 敌人相关类型
│   │   ├── game.ts         # 游戏核心类型
│   │   ├── other.ts        # 其他类型定义
│   │   ├── tower.ts        # 塔防相关类型
│   │   └── index.d.ts      # 类型导出与声明
│   ├── utils/              # 工具函数
│   │   ├── adminAuth.ts     # 管理员认证
│   │   ├── direction.ts    # 方向处理
│   │   ├── format.ts       # 格式化工具
│   │   ├── handleCircle.ts  # 圆形处理
│   │   ├── handleDom.ts     # DOM 操作
│   │   ├── handleImg.ts     # 图片处理
│   │   ├── keepInterval.ts  # 间隔控制
│   │   ├── tools.ts        # 通用工具
│   │   ├── validate.ts     # 验证工具
│   │   └── props.ts        # 属性处理
│   ├── config/             # 配置文件
│   │   ├── index.ts        # 基础配置
│   │   └── supabase.ts     # Supabase 配置
│   ├── dataSource/         # 游戏数据源
│   │   ├── audioData.ts    # 音频数据
│   │   ├── enemyData.ts    # 敌人数据
│   │   ├── levelData.ts    # 关卡数据
│   │   ├── levelEnemyArr.ts # 关卡敌人配置
│   │   ├── mapData.ts      # 地图数据
│   │   ├── otherImgData.ts # 其他图片数据
│   │   ├── skillData.ts    # 技能数据
│   │   └── towerData.ts    # 塔防数据
│   ├── service/            # API 服务层
│   │   ├── adminService.ts # 后台管理服务
│   │   ├── login.ts        # 登录注册服务
│   │   ├── rank.ts         # 排行榜服务
│   │   ├── request.ts      # 请求封装
│   │   ├── supabaseService.ts # Supabase 数据库服务
│   │   └── userInfo.ts     # 用户信息服务
│   ├── router/             # 路由配置
│   │   └── index.ts        # 路由定义
│   ├── assets/             # 静态资源
│   │   └── img/            # 图片资源
│   ├── style.less          # 全局样式
│   ├── style2.css          # 补充样式
│   ├── vite-env.d.ts       # Vite 环境类型
│   ├── App.vue             # 根组件
│   └── main.ts             # 应用入口（Vue 3 + TypeScript）
├── public/                 # 🔓 静态公共资源（直接复制到输出）
│   ├── assets/             # 公共静态资源
│   ├── audio/              # 音频文件
│   └── supabase-test.html # Supabase 连接测试
├── dist/                   # 🏗️ 构建输出目录（Vite 自动生成）
├── node_modules/           # 项目依赖（自动安装）
├── .env.local              # 本地环境变量（.gitignore 中忽略）
├── .gitignore              # Git 忽略规则
├── index.html              # 前端入口 HTML
├── package.json            # 依赖管理
├── package-lock.json       # 锁定依赖版本
├── README.md               # 项目根说明（本文件）
├── tsconfig.json           # TypeScript 全局配置
├── tsconfig.node.json      # TypeScript Node 环境配置
└── vite.config.ts          # Vite 构建配置
```

## 后台管理系统

项目包含完整的后台管理系统，用于实时查看和管理用户数据：

### 功能特性
- 📊 **数据统计**：用户总数、游戏记录、活跃用户等关键指标
- 👥 **用户管理**：查看用户详情、删除用户及其游戏记录
- 🏆 **排行榜管理**：查看所有游戏记录、按关卡筛选、删除单条记录
- 📈 **数据导出**：CSV格式导出完整用户数据
- 🔒 **安全认证**：简单密码验证机制

### 访问方式
1. **主界面入口**：游戏主页面右下角点击设置图标 ⚙️
2. **直接访问**：运行项目后访问 `http://localhost:16666/admin`
3. **登录密码**：默认密码为 `admin123456`

### 技术实现
- **Vue 3 + TypeScript**：管理界面技术栈
- **Element Plus**：UI组件库
- **Supabase API**：实时数据获取和管理
- **响应式设计**：支持桌面端和移动端

## 脚本工具

项目提供了多个实用脚本来简化开发和部署流程：

### 数据库脚本
```bash
# 初始化数据库
node scripts/setup-database.js

# 检查数据库连接
node scripts/check-db.js

# 添加测试数据
node scripts/add-test-data.js

# 更新数据库结构
node scripts/update-database.js
```

### 开发工具
```bash
# 创建简单测试数据
node scripts/create-simple-test.js
```

### 脚本文件说明
- `setup-database.js` - 数据库初始化脚本
- `check-db.js` - 数据库连接测试
- `add-test-data.js` - 添加测试用户和游戏数据
- `create-simple-test.js` - 创建基础测试数据
- `update-database.js` - 数据库结构更新

## 游戏数据配置

### 敌人类型
- **普通僵尸** - 基础敌人，低生命值和速度
- **铁门僵尸** - 高防御，移动缓慢
- **橄榄球僵尸** - 高速移动，高生命值
- **报纸僵尸** - 低生命值但高奖励
- **舞蹈僵尸** - 特殊行动模式
- **更多类型** - 游戏中还有更多独特敌人

### 防御塔类型
- **冰之星辉** - 减速敌人，控制型防御塔
- **破阵枪骑** - 多目标攻击，范围伤害
- **炼狱之爪** - 快速连发，单体高伤害
- **幽影射手** - 远程高伤害，大攻击范围
- **奥术弹幕** - 穿透攻击，可攻击多个敌人
- **烈焰熔炉** - 群体伤害，范围攻击
- **寒冰射手** - 减速与多重箭矢
- **回旋战斧** - 旋转飞斧，可攻击多个目标
- **烈焰法师** - 持续火焰伤害
- **暗影毒师** - 中毒效果，持续伤害
- **更多塔防** - 每种塔都有独特技能和定位

## 快速开始

### 环境要求
- Node.js 16.0+
- npm 或 yarn 包管理器

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
访问 http://localhost:16666

### 构建生产版本
```bash
npm run build
```

### 类型检查
```bash
npm run tsc
```

## 数据库配置

项目已集成 Supabase 数据库服务，替代了原有的外部API服务。

### 环境变量配置

在 `.env.local` 中添加以下配置：
```
VITE_SUPABASE_URL=https://vcmrpbysnxzqhxjfvshf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbXJwYnlzbnh6cWh4amZ2c2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Njc3MDYsImV4cCI6MjA3OTU0MzcwNn0.QrC98Co6699N8-3KDbRvRHtAxayCP93NxSclRB8P1Dg
```

### 数据库初始化

1. 登录 Supabase 控制台
2. 进入 SQL 编辑器
3. 运行 `scripts/database/supabase-init.sql` 文件中的SQL脚本

### 数据库更新

如需更新现有数据库表结构，可运行：
- `scripts/database/update-user-profile.sql` - 用户信息表更新脚本

### 测试连接

访问 `public/supabase-test.html` 测试数据库连接是否正常

## API 接口

项目使用 Supabase 作为后端数据库服务：

### 用户相关
- **用户登录**：验证用户身份，返回用户信息
- **用户注册**：创建新用户账户
- **用户信息修改**：更新用户个人信息
- **密码修改**：更新用户密码

### 游戏数据
- **排行榜查询**：获取游戏分数排行榜
- **分数上传**：保存玩家游戏成绩

原有API接口已更新为使用Supabase，保持与现有代码的兼容性。

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目！

### 开发规范
- 使用 TypeScript 进行类型安全开发
- 遵循 Vue 3 Composition API 规范
- 保持代码风格一致
- 添加适当的注释和类型定义
- 遵循项目标准目录结构：
  - 新增组件放在 `src/components/`
  - 页面级组件放在 `src/views/`
  - 类型定义统一在 `src/types/`
  - 工具函数放在 `src/utils/`
  - API 服务放在 `src/service/`
  - 脚本文件放在 `scripts/`

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

如有问题或建议，请联系作者：1829738634@qq.com