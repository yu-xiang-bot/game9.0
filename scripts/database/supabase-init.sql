-- Supabase数据库初始化脚本
-- 为塔防游戏创建必要的表结构

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  gender VARCHAR(10) DEFAULT 'other' CHECK (gender IN ('male', 'female', 'other')),
  avatar TEXT,
  bio TEXT,
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

-- 注：如果需要更严格的权限控制，请根据实际情况修改上述安全策略