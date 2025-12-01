# 塔防联盟

 

塔防联盟是一款基于 Vue3 和 TypeScript 开发的网页塔防游戏，支持 PC 端和移动端。游戏采用 Canvas 渲染和 Web Worker 技术实现高性能游戏体验。

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
d:/实训课/game1.0/
├── src/
│   ├── assets/              # 静态资源
│   ├── components/          # 公共组件
│   │   ├── AdminDashboard.vue   # 后台管理面板组件
│   │   ├── coverCanvas.vue      # 关卡封面画布组件
│   │   ├── enemyInfoPop.vue      # 敌人信息弹窗组件
│   │   ├── gitHubBall.vue        # GitHub 链接球组件
│   │   ├── loading.vue           # 加载组件
│   │   ├── login.vue             # 登录组件
│   │   ├── rankList.vue          # 排行榜组件
│   │   ├── selectLevelPop.vue    # 选择关卡弹窗组件
│   │   ├── selectTips.vue        # 选择提示组件
│   │   ├── selectTowerPop.vue    # 选择塔防弹窗组件
│   │   ├── towerCanvas.vue       # 塔防画布组件
│   │   ├── userBall.vue          # 用户信息球组件
│   │   └── userInfo.vue          # 用户信息组件
│   ├── config/              # 配置文件
│   ├── dataSource/          # 游戏数据源
│   │   ├── audioData.ts         # 音频数据
│   │   ├── enemyData.ts         # 敌人数据
│   │   ├── levelData.ts         # 关卡数据
│   │   ├── mapData.ts           # 地图数据
│   │   ├── skillData.ts         # 技能数据
│   │   └── towerData.ts         # 塔防数据
│   ├── hooks/               # 自定义 Hooks
│   ├── router/              # 路由配置
│   ├── service/             # API 服务
│   │   ├── adminService.ts    # 后台管理服务
│   │   ├── login.ts          # 登录注册服务
│   │   ├── rank.ts          # 排行榜服务
│   │   ├── supabaseService.ts # Supabase数据库服务
│   │   └── userInfo.ts       # 用户信息服务
│   ├── stores/              # 状态管理
│   ├── type/                # 类型定义
│   ├── utils/               # 工具函数
│   │   └── adminAuth.ts      # 管理员认证工具
│   ├── views/               # 页面视图
│   │   └── admin/           # 管理后台页面
│   │       └── index.vue     # 管理后台主界面
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
└── vite.config.ts          # Vite 配置
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
3. 运行 `supabase-init.sql` 文件中的SQL脚本

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

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

如有问题或建议，请联系作者：1829738634@qq.com