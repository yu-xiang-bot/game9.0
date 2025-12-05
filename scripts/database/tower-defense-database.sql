-- 塔防联盟专用数据库设计 (PostgreSQL版本)
-- 针对 Vue3 + TypeScript 塔防游戏优化

-- 用户表：存储玩家基本信息（适配塔防游戏特性）
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
    
    -- 系统字段
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    last_game_played TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    
    -- 时间戳字段
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 游戏关卡表：存储所有关卡配置
CREATE TABLE IF NOT EXISTS game_levels (
    level_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level_name VARCHAR(100) NOT NULL,
    level_number INT NOT NULL UNIQUE,
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    
    -- 关卡配置
    map_data JSONB NOT NULL,
    initial_coins INT DEFAULT 500,
    max_waves INT NOT NULL,
    time_limit INT DEFAULT 0,
    
    -- 关卡要求
    required_stars INT DEFAULT 0,
    unlock_level UUID REFERENCES game_levels(level_id),
    
    -- 奖励配置
    star_rewards JSONB,
    completion_bonus_coins INT DEFAULT 100,
    completion_bonus_gems INT DEFAULT 5,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 防御塔类型表
CREATE TABLE IF NOT EXISTS tower_types (
    tower_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tower_name VARCHAR(50) NOT NULL UNIQUE,
    tower_code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    
    -- 基础属性
    damage INT NOT NULL,
    attack_range DECIMAL(5,2) NOT NULL,
    attack_speed DECIMAL(4,2) NOT NULL,
    cost INT NOT NULL,
    
    -- 升级配置
    upgrade_levels JSONB NOT NULL,
    max_level INT DEFAULT 3,
    
    -- 特殊属性
    special_abilities JSONB,
    projectile_type VARCHAR(20) DEFAULT 'bullet' CHECK (projectile_type IN ('bullet', 'laser', 'splash', 'dot')),
    element_type VARCHAR(20) DEFAULT 'physical' CHECK (element_type IN ('fire', 'ice', 'lightning', 'poison', 'physical')),
    
    icon_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE
);

-- 敌人类型表
CREATE TABLE IF NOT EXISTS enemy_types (
    enemy_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    enemy_name VARCHAR(50) NOT NULL UNIQUE,
    enemy_code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    
    -- 基础属性
    health INT NOT NULL,
    speed DECIMAL(4,2) NOT NULL,
    armor INT DEFAULT 0,
    magic_resist INT DEFAULT 0,
    
    -- 奖励配置
    coin_reward INT NOT NULL,
    score_reward INT NOT NULL,
    
    -- 特殊属性
    abilities JSONB,
    size VARCHAR(20) DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large', 'boss')),
    immunities JSONB,
    
    icon_url VARCHAR(255)
);

-- 用户关卡进度表
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

-- 游戏记录表（每次游戏的详细记录）
CREATE TABLE IF NOT EXISTS game_sessions (
    session_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES game_levels(level_id) ON DELETE CASCADE,
    
    -- 游戏结果
    score INT NOT NULL,
    stars_earned INT DEFAULT 0,
    is_victory BOOLEAN DEFAULT FALSE,
    completion_time INT,
    
    -- 详细统计
    waves_completed INT DEFAULT 0,
    enemies_killed INT DEFAULT 0,
    towers_built INT DEFAULT 0,
    coins_spent INT DEFAULT 0,
    coins_earned INT DEFAULT 0,
    damage_dealt BIGINT DEFAULT 0,
    damage_taken BIGINT DEFAULT 0,
    max_combo INT DEFAULT 0,
    
    -- 塔防使用情况（JSON格式存储）
    towers_used JSONB,
    tower_upgrades JSONB,
    
    -- 系统信息
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    device_type VARCHAR(20) DEFAULT 'desktop' CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    game_version VARCHAR(20) DEFAULT '1.0.0'
);

-- 排行榜表（专门为塔防游戏优化）
CREATE TABLE IF NOT EXISTS leaderboards (
    leaderboard_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level_id UUID NOT NULL REFERENCES game_levels(level_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    score INT NOT NULL,
    completion_time INT,
    waves_completed INT DEFAULT 0,
    stars_earned INT DEFAULT 0,
    
    -- 排行统计
    rank_position INT DEFAULT 0,
    session_id UUID NOT NULL REFERENCES game_sessions(session_id) ON DELETE CASCADE,
    
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (level_id, user_id, session_id)
);

-- 成就系统表（塔防游戏专用成就）
CREATE TABLE IF NOT EXISTS achievements (
    achievement_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    
    -- 成就类型
    achievement_type VARCHAR(20) DEFAULT 'progress' CHECK (achievement_type IN ('progress', 'skill', 'collection', 'special')),
    category VARCHAR(20) DEFAULT 'general' CHECK (category IN ('general', 'tower', 'enemy', 'level', 'combo')),
    
    -- 达成条件
    condition_type VARCHAR(20) NOT NULL CHECK (condition_type IN ('score', 'kill_count', 'build_count', 'completion', 'combo', 'time')),
    condition_value INT NOT NULL,
    condition_target VARCHAR(50),
    
    -- 奖励
    reward_coins INT DEFAULT 0,
    reward_gems INT DEFAULT 0,
    reward_exp INT DEFAULT 0,
    
    is_hidden BOOLEAN DEFAULT FALSE,
    is_repeatable BOOLEAN DEFAULT FALSE
);

-- 用户成就表
-- 注意：确保外键引用正确
-- user_id 应该引用 users(user_id)，而不是 achievements 表
-- achievement_id 应该引用 achievements(achievement_id)
CREATE TABLE IF NOT EXISTS user_achievements (
    user_achievement_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,  -- 用户ID，引用users表的user_id
    achievement_id UUID NOT NULL REFERENCES achievements(achievement_id) ON DELETE CASCADE,  -- 成就ID，引用achievements表的achievement_id
    
    progress_current INT DEFAULT 0,        -- 当前进度
    progress_target INT NOT NULL,          -- 目标进度
    is_unlocked BOOLEAN DEFAULT FALSE,     -- 是否已解锁
    unlock_date TIMESTAMP WITH TIME ZONE,  -- 解锁时间
    unlock_count INT DEFAULT 0,           -- 解锁次数（用于可重复成就）
    
    UNIQUE (user_id, achievement_id)        -- 确保每个用户的每个成就只有一条记录
);

-- 商店物品表（塔防游戏专用物品）
CREATE TABLE IF NOT EXISTS shop_items (
    item_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- 物品类型
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('tower', 'powerup', 'cosmetic', 'boost')),
    tower_type_id UUID REFERENCES tower_types(tower_id) ON DELETE SET NULL,
    
    -- 价格
    price_coins INT DEFAULT 0,
    price_gems INT DEFAULT 0,
    
    -- 效果配置
    effect_duration INT DEFAULT 0,
    effect_value JSONB,
    
    is_available BOOLEAN DEFAULT TRUE,
    purchase_limit INT
);

-- 用户库存表
CREATE TABLE IF NOT EXISTS user_inventory (
    inventory_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES shop_items(item_id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expiration_date TIMESTAMP WITH TIME ZONE,
    is_equipped BOOLEAN DEFAULT FALSE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_player_level ON users(player_level);
CREATE INDEX IF NOT EXISTS idx_users_total_score ON users(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login DESC);

CREATE INDEX IF NOT EXISTS idx_game_levels_level_number ON game_levels(level_number);
CREATE INDEX IF NOT EXISTS idx_game_levels_difficulty ON game_levels(difficulty);
CREATE INDEX IF NOT EXISTS idx_game_levels_required_stars ON game_levels(required_stars);

CREATE INDEX IF NOT EXISTS idx_tower_types_tower_code ON tower_types(tower_code);
CREATE INDEX IF NOT EXISTS idx_tower_types_element_type ON tower_types(element_type);
CREATE INDEX IF NOT EXISTS idx_tower_types_cost ON tower_types(cost);

CREATE INDEX IF NOT EXISTS idx_enemy_types_enemy_code ON enemy_types(enemy_code);
CREATE INDEX IF NOT EXISTS idx_enemy_types_size ON enemy_types(size);

CREATE INDEX IF NOT EXISTS idx_user_level_progress_user_id ON user_level_progress(user_id, best_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_level_progress_level_id ON user_level_progress(level_id, best_score DESC);

CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_level_id ON game_sessions(level_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_start_time ON game_sessions(start_time DESC);

CREATE INDEX IF NOT EXISTS idx_leaderboards_level_score ON leaderboards(level_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_level_time ON leaderboards(level_id, completion_time ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_user_rank ON leaderboards(user_id, rank_position);

CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id, is_unlocked);

CREATE INDEX IF NOT EXISTS idx_shop_items_type ON shop_items(item_type);
CREATE INDEX IF NOT EXISTS idx_shop_items_available ON shop_items(is_available);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_item ON user_inventory(user_id, item_id);

-- 创建更新时间触发器函数
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
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_level_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

-- 用户表安全策略
CREATE POLICY "Allow public insert for registration" ON users
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to view own profile" ON users
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Allow users to update own profile" ON users
FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 游戏记录表安全策略
CREATE POLICY "Allow users to manage own game sessions" ON game_sessions
FOR ALL USING (auth.uid()::text = user_id::text);

-- 用户进度表安全策略
CREATE POLICY "Allow users to manage own progress" ON user_level_progress
FOR ALL USING (auth.uid()::text = user_id::text);

-- 排行榜表安全策略（公开读取，用户只能写入自己的记录）
CREATE POLICY "Allow public read for leaderboard" ON leaderboards
FOR SELECT USING (true);

CREATE POLICY "Allow users to insert own leaderboard entries" ON leaderboards
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Allow users to update own leaderboard entries" ON leaderboards
FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 成就表安全策略
CREATE POLICY "Allow users to manage own achievements" ON user_achievements
FOR ALL USING (auth.uid()::text = user_id::text);

-- 库存表安全策略
CREATE POLICY "Allow users to manage own inventory" ON user_inventory
FOR ALL USING (auth.uid()::text = user_id::text);