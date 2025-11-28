# Supabase 数据库集成指南

本项目已成功集成了 Supabase 数据库服务，用于替代原有的外部API服务。

## 🎯 已完成的配置

### 1. 依赖安装
- 已安装 `@supabase/supabase-js` 客户端库

### 2. 环境变量配置
在 `.env.local` 中添加了以下配置：
```
VITE_SUPABASE_URL=https://vcmrpbysnxzqhxjfvshf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbXJwYnlzbnh6cWh4amZ2c2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Njc3MDYsImV4cCI6MjA3OTU0MzcwNn0.QrC98Co6699N8-3KDbRvRHtAxayCP93NxSclRB8P1Dg
```

### 3. 创建的文件

#### 配置文件
- `src/config/supabase.ts` - Supabase 客户端配置和类型定义

#### 服务封装
- `src/service/supabaseService.ts` - Supabase 数据操作服务封装

#### 数据库初始化
- `supabase-init.sql` - 数据库表结构初始化脚本

#### 更新的现有服务
- `src/service/login.ts` - 登录、注册服务
- `src/service/userInfo.ts` - 用户信息管理服务
- `src/service/rank.ts` - 排行榜和分数服务

## 🗄️ 数据库结构

### users 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，自动生成 |
| username | VARCHAR(50) | 用户名，唯一 |
| password | VARCHAR(255) | 密码（实际项目应使用加密存储） |
| phone | VARCHAR(20) | 电话号码 |
| avatar | TEXT | 头像URL |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### game_scores 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，自动生成 |
| user_id | UUID | 用户ID，外键关联users表 |
| level | INTEGER | 关卡等级 |
| score | INTEGER | 得分 |
| created_at | TIMESTAMP | 创建时间 |

## 🚀 如何使用

### 1. 初始化数据库

1. 登录 Supabase 控制台
2. 进入 SQL 编辑器
3. 运行 `supabase-init.sql` 文件中的SQL脚本

### 2. 测试连接

游戏启动后会自动使用 Supabase 进行数据操作，包括：
- 用户登录/注册
- 用户信息修改
- 游戏分数上传和排行榜查询

## ⚠️ 重要提示

1. **密码安全**：当前密码以明文存储，实际项目应使用加密方式存储

2. **权限配置**：数据库已启用行级安全策略(RLS)，确保数据访问安全

3. **API兼容性**：所有原有API接口已更新为使用Supabase，保持与现有代码的兼容性

4. **开发环境**：本地开发时，确保 `.env.local` 中的 Supabase 配置正确

## 🔧 常见问题解决

### 1. 连接失败
- 检查环境变量配置是否正确
- 确认 Supabase 项目是否已激活

### 2. 权限错误
- 确保已运行初始化SQL脚本
- 检查行级安全策略配置

### 3. 数据不显示
- 检查表结构是否正确创建
- 确认是否有测试数据

## 📞 技术支持

如有问题，请参考 Supabase 官方文档：
- https://supabase.com/docs
- JavaScript/TypeScript 客户端文档：https://supabase.com/docs/reference/javascript