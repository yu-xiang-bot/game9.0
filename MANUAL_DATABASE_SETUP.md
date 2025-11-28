# 手动数据库设置指南

## 📋 步骤概述

由于安全限制，我们需要手动在 Supabase 控制台中创建数据库表。请按照以下步骤操作：

## 🚀 步骤 1: 登录 Supabase 控制台

1. 打开浏览器，访问: https://app.supabase.com
2. 使用您的 Supabase 账户登录
3. 选择项目: `vcmrpbysnxzqhxjfvshf`

## 🗄️ 步骤 2: 执行 SQL 脚本

1. 在左侧导航栏中，点击 "SQL Editor"
2. 点击 "New query" 创建新的查询
3. 复制并粘贴以下完整的 SQL 代码：

```sql
-- Supabase数据库初始化脚本
-- 为塔防游戏创建必要的表结构

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 游戏分数表
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, level)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_game_scores_user_id ON game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_score ON game_scores(score DESC);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为users表添加更新时间触发器
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略(RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- 用户表安全策略
-- 允许所有用户注册
CREATE POLICY "Allow public insert for registration" ON users
FOR INSERT WITH CHECK (true);

-- 允许用户查看自己的信息
CREATE POLICY "Allow users to view own profile" ON users
FOR SELECT USING (auth.uid()::text = id::text);

-- 允许用户更新自己的信息
CREATE POLICY "Allow users to update own profile" ON users
FOR UPDATE USING (auth.uid()::text = id::text);

-- 游戏分数表安全策略
-- 允许所有用户查看分数排行榜
CREATE POLICY "Allow public read for leaderboard" ON game_scores
FOR SELECT USING (true);

-- 允许认证用户插入和更新自己的分数
CREATE POLICY "Allow users to manage own scores" ON game_scores
FOR ALL USING (auth.uid()::text = user_id::text);

-- 插入测试数据
INSERT INTO users (username, password, phone, avatar) VALUES 
('testuser1', 'password123', '13800138001', 'https://example.com/avatar1.jpg'),
('testuser2', 'password456', '13800138002', 'https://example.com/avatar2.jpg'),
('testuser3', 'password789', '13800138003', 'https://example.com/avatar3.jpg')
ON CONFLICT (username) DO NOTHING;

-- 插入测试分数
INSERT INTO game_scores (user_id, level, score) 
SELECT 
  u.id,
  unnest(ARRAY[1, 2, 3]) as level,
  unnest(ARRAY[100, 200, 300]) * (SELECT ROW_NUMBER() OVER (ORDER BY username)) as score
FROM users u
WHERE username IN ('testuser1', 'testuser2', 'testuser3')
ON CONFLICT (user_id, level) DO NOTHING;
```

4. 点击 "RUN" 按钮执行 SQL 脚本
5. 等待执行完成，应该看到 "Success" 消息

## 🧪 步骤 3: 验证表创建

1. 在左侧导航栏中，点击 "Table Editor"
2. 您应该能看到以下表：
   - `users` (用户表)
   - `game_scores` (游戏分数表)

3. 点击每个表可以查看结构和数据：
   - `users` 表应包含测试用户数据
   - `game_scores` 表应包含测试分数数据

## 🧪 步骤 4: 测试应用连接

执行完数据库设置后，您可以：

1. 运行应用: `npm run dev`
2. 尝试登录测试账号:
   - 用户名: `testuser1`, 密码: `password123`
   - 用户名: `testuser2`, 密码: `password456`
   - 用户名: `testuser3`, 密码: `password789`

3. 查看排行榜功能是否正常工作

## ⚠️ 重要提示

1. **安全性**: 当前使用明文密码存储，实际项目应使用加密存储
2. **权限**: 已配置行级安全策略(RLS)，确保数据访问安全
3. **备份**: 建议定期备份数据库
4. **扩展**: 可以根据需要添加更多表或字段

## 🎯 完成

一旦上述步骤完成，您的塔防游戏应用将完全连接到 Supabase 数据库，所有功能都应该正常工作！