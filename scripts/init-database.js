// 初始化Supabase数据库的脚本
// 在Supabase SQL编辑器中运行以下SQL命令

const sqlCommands = `
-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(50),
  avatar_url VARCHAR(255) DEFAULT '/images/default_avatar.png',
  phone VARCHAR(20),
  
  -- 游戏进度相关字段
  current_level INT DEFAULT 1,
  total_score BIGINT DEFAULT 0,
  games_played INT DEFAULT 0,
  games_won INT DEFAULT 0,
  
  -- 游戏货币和资源
  coins INT DEFAULT 1000,
  gems INT DEFAULT 50,
  experience_points INT DEFAULT 0,
  player_level INT DEFAULT 1,
  
  -- 游戏统计
  total_enemies_killed INT DEFAULT 0,
  total_towers_built INT DEFAULT 0,
  best_combo INT DEFAULT 0,
  play_time_total INT DEFAULT 0,
  
  -- 个人信息字段
  gender VARCHAR(10) DEFAULT 'other' CHECK (gender IN ('male', 'female', 'other')),
  bio TEXT,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  last_game_played TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建游戏关卡表
CREATE TABLE IF NOT EXISTS game_levels (
  level_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level_name VARCHAR(100) NOT NULL,
  level_number INT NOT NULL UNIQUE,
  difficulty VARCHAR(20) DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  map_data JSONB,
  initial_coins INT DEFAULT 200,
  max_waves INT DEFAULT 10,
  time_limit INT DEFAULT 300, -- 秒
  required_stars INT DEFAULT 1,
  unlock_level VARCHAR(50),
  star_rewards JSONB,
  completion_bonus_coins INT DEFAULT 100,
  completion_bonus_gems INT DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建防御塔类型表
CREATE TABLE IF NOT EXISTS tower_types (
  tower_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tower_name VARCHAR(100) NOT NULL,
  tower_code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  damage INT NOT NULL,
  attack_range DECIMAL(3,1) NOT NULL,
  attack_speed DECIMAL(3,1) NOT NULL,
  cost INT NOT NULL,
  upgrade_levels JSONB,
  max_level INT DEFAULT 3,
  special_abilities JSONB,
  projectile_type VARCHAR(50) DEFAULT 'bullet',
  element_type VARCHAR(50) DEFAULT 'physical',
  icon_url VARCHAR(255),
  is_available BOOLEAN DEFAULT true
);

-- 创建敌人类型表
CREATE TABLE IF NOT EXISTS enemy_types (
  enemy_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enemy_name VARCHAR(100) NOT NULL,
  enemy_code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  health INT NOT NULL,
  speed DECIMAL(3,1) NOT NULL,
  armor INT DEFAULT 0,
  magic_resist INT DEFAULT 0,
  coin_reward INT DEFAULT 10,
  score_reward INT DEFAULT 100,
  abilities JSONB,
  size VARCHAR(20) DEFAULT 'medium',
  immunities JSONB,
  icon_url VARCHAR(255)
);

-- 创建游戏会话表
CREATE TABLE IF NOT EXISTS game_sessions (
  session_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  level_id UUID NOT NULL REFERENCES game_levels(level_id) ON DELETE CASCADE,
  score INT NOT NULL,
  stars_earned INT DEFAULT 0,
  is_victory BOOLEAN DEFAULT false,
  completion_time INT,
  waves_completed INT DEFAULT 0,
  enemies_killed INT DEFAULT 0,
  towers_built INT DEFAULT 0,
  coins_spent INT DEFAULT 0,
  coins_earned INT DEFAULT 0,
  damage_dealt BIGINT DEFAULT 0,
  damage_taken BIGINT DEFAULT 0,
  max_combo INT DEFAULT 0,
  towers_used JSONB,
  tower_upgrades JSONB,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP WITH TIME ZONE,
  device_type VARCHAR(20) DEFAULT 'desktop',
  game_version VARCHAR(20) DEFAULT '1.0.0'
);

-- 创建排行榜表
CREATE TABLE IF NOT EXISTS leaderboards (
  leaderboard_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level_id UUID NOT NULL REFERENCES game_levels(level_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  score INT NOT NULL,
  completion_time INT,
  waves_completed INT DEFAULT 0,
  stars_earned INT DEFAULT 0,
  rank_position INT DEFAULT 0,
  session_id UUID NOT NULL REFERENCES game_sessions(session_id) ON DELETE CASCADE,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (level_id, user_id, session_id)
);

-- 创建用户关卡进度表
CREATE TABLE IF NOT EXISTS user_level_progress (
  progress_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  level_id UUID NOT NULL REFERENCES game_levels(level_id) ON DELETE CASCADE,
  
  -- 进度统计
  best_score INT DEFAULT 0,
  stars_earned INT DEFAULT 0,
  completion_time INT DEFAULT 0,
  times_played INT DEFAULT 0,
  times_completed INT DEFAULT 0,
  
  -- 详细统计
  enemies_killed INT DEFAULT 0,
  towers_built INT DEFAULT 0,
  damage_dealt BIGINT DEFAULT 0,
  damage_taken BIGINT DEFAULT 0,
  last_played TIMESTAMP WITH TIME ZONE,
  best_combo INT DEFAULT 0,
  
  UNIQUE (user_id, level_id)
);

-- 创建触发器函数，用于更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加updated_at触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_level_progress_updated_at BEFORE UPDATE ON user_level_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认防御塔数据
INSERT INTO tower_types (tower_name, tower_code, description, damage, attack_range, attack_speed, cost, max_level, element_type)
VALUES 
  ('基础炮塔', 'basic', '基础攻击型防御塔，对单个敌人造成中等伤害', 20, 2.0, 1.5, 100, 3, 'physical'),
  ('冰冻塔', 'ice', '减速敌人，控制型防御塔', 25, 3.5, 1.2, 150, 3, 'ice'),
  ('闪电塔', 'lightning', '连锁闪电，可攻击多个敌人', 30, 2.5, 1.8, 200, 3, 'lightning'),
  ('火焰塔', 'fire', '范围伤害，对群体敌人有效', 35, 2.2, 1.3, 180, 3, 'fire'),
  ('狙击塔', 'sniper', '远程高伤害，攻击速度慢', 50, 5.0, 0.8, 250, 3, 'physical')
ON CONFLICT (tower_code) DO NOTHING;

-- 插入默认敌人数据
INSERT INTO enemy_types (enemy_name, enemy_code, description, health, speed, coin_reward, score_reward)
VALUES
  ('小兵', 'basic', '基础敌人，速度慢但数量多', 50, 1.0, 10, 100),
  ('快速兵', 'fast', '移动速度快，血量少', 30, 2.5, 15, 150),
  ('坦克兵', 'tank', '血量高，速度慢', 150, 0.5, 30, 300),
  ('飞行兵', 'flying', '空中单位，部分防御塔无法攻击', 70, 1.8, 25, 250),
  ('Boss', 'boss', '高血量，高攻击力的首领单位', 500, 0.8, 100, 1000)
ON CONFLICT (enemy_code) DO NOTHING;

-- 插入默认关卡数据
INSERT INTO game_levels (level_name, level_number, difficulty, initial_coins, max_waves, time_limit, required_stars)
VALUES
  ('新手入门', 1, 'easy', 200, 5, 300, 1),
  ('初级挑战', 2, 'easy', 250, 8, 400, 2),
  ('中级防御', 3, 'medium', 300, 10, 500, 3),
  ('高级挑战', 4, 'hard', 350, 12, 600, 4),
  ('专家模式', 5, 'expert', 400, 15, 720, 5)
ON CONFLICT (level_number) DO NOTHING;

-- 创建RLS策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_level_progress ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 游戏会话的RLS策略
CREATE POLICY "Users can view own game sessions" ON game_sessions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own game sessions" ON game_sessions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 排行榜的RLS策略
CREATE POLICY "Users can view all leaderboards" ON leaderboards FOR SELECT USING (true);
CREATE POLICY "Users can insert own leaderboard entries" ON leaderboards FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 用户进度的RLS策略
CREATE POLICY "Users can view own progress" ON user_level_progress FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own progress" ON user_level_progress FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own progress" ON user_level_progress FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
`;

console.log('数据库初始化SQL命令已生成');
console.log('请将以下SQL复制到Supabase SQL编辑器中执行:');
console.log(sqlCommands);