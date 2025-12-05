-- 塔防联盟专用数据库设计 (PostgreSQL版本) - 修复版
-- 针对 Vue3 + TypeScript 塔防游戏优化

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 删除已存在的表（如果存在）- 按依赖顺序反向删除
DROP TABLE IF EXISTS user_inventory CASCADE;
DROP TABLE IF EXISTS shop_items CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS leaderboards CASCADE;
DROP TABLE IF EXISTS game_sessions CASCADE;
DROP TABLE IF EXISTS user_level_progress CASCADE;
DROP TABLE IF EXISTS enemy_types CASCADE;
DROP TABLE IF EXISTS tower_types CASCADE;
DROP TABLE IF EXISTS game_levels CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 用户表：存储玩家基本信息（适配塔防游戏特性）
CREATE TABLE users (
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
CREATE TABLE game_levels (
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
    unlock_level UUID, -- 移除外键约束，避免循环依赖
    
    -- 奖励配置
    star_rewards JSONB,
    completion_bonus_coins INT DEFAULT 100,
    completion_bonus_gems INT DEFAULT 5,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 防御塔类型表
CREATE TABLE tower_types (
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
CREATE TABLE enemy_types (
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

-- 成就系统表（塔防游戏专用成就）
CREATE TABLE achievements (
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

-- 用户成就表（修复外键引用）
CREATE TABLE user_achievements (
    user_achievement_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,  -- ✅ 正确引用 users.user_id
    achievement_id UUID NOT NULL REFERENCES achievements(achievement_id) ON DELETE CASCADE,  -- ✅ 正确引用 achievements.achievement_id
    
    progress_current INT DEFAULT 0,
    progress_target INT NOT NULL,
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlock_date TIMESTAMP WITH TIME ZONE,
    unlock_count INT DEFAULT 0,
    
    UNIQUE (user_id, achievement_id)
);

-- 游戏记录表（每次游戏的详细记录）
CREATE TABLE game_sessions (
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
CREATE TABLE leaderboards (
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

-- 用户关卡进度表
CREATE TABLE user_level_progress (
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

-- 商店物品表（塔防游戏专用物品）
CREATE TABLE shop_items (
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
CREATE TABLE user_inventory (
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
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

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
$$ LANGUAGE plpgsql;

-- 为users表添加更新时间触发器
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入初始数据：防御塔类型
INSERT INTO tower_types (tower_name, tower_code, description, damage, attack_range, attack_speed, cost, upgrade_levels, max_level, element_type) VALUES
('冰之星辉', 'aixi', '减速敌人，控制型防御塔', 25, 3.5, 1.2, 150, '[{"level":1,"damage":25,"cost":150,"range":3.5},{"level":2,"damage":35,"cost":250,"range":3.8},{"level":3,"damage":50,"cost":350,"range":4.2}]', 3, 'ice'),
('破阵枪骑', 'delaiwen', '多目标攻击，范围伤害', 40, 2.8, 0.8, 200, '[{"level":1,"damage":40,"cost":200,"targets":2},{"level":2,"damage":60,"cost":350,"targets":3},{"level":3,"damage":90,"cost":500,"targets":4}]', 3, 'physical'),
('炼狱之爪', 'ez', '快速连发，单体高伤害', 15, 2.0, 2.5, 100, '[{"level":1,"damage":15,"speed":2.5,"cost":100},{"level":2,"damage":25,"speed":3.0,"cost":180},{"level":3,"damage":40,"speed":3.5,"cost":280}]', 3, 'fire'),
('幽影射手', 'huonan', '远程高伤害，大攻击范围', 80, 5.0, 0.5, 300, '[{"level":1,"damage":80,"range":5.0,"cost":300},{"level":2,"damage":120,"range":5.5,"cost":450},{"level":3,"damage":180,"range":6.0,"cost":650}]', 3, 'physical'),
('奥术弹幕', 'jin', '穿透攻击，可攻击多个敌人', 30, 3.0, 1.0, 250, '[{"level":1,"damage":30,"penetrates":2,"cost":250},{"level":2,"damage":45,"penetrates":3,"cost":380},{"level":3,"damage":65,"penetrates":4,"cost":550}]', 3, 'lightning'),
('烈焰熔炉', 'lanbo', '群体伤害，范围攻击', 50, 2.5, 0.7, 350, '[{"level":1,"damage":50,"splash":2.0,"cost":350},{"level":2,"damage":75,"splash":2.5,"cost":500},{"level":3,"damage":110,"splash":3.0,"cost":700}]', 3, 'fire'),
('寒冰射手', 'twitch', '减速与多重箭矢', 20, 3.2, 1.5, 180, '[{"level":1,"damage":20,"slow":0.3,"arrows":1,"cost":180},{"level":2,"damage":30,"slow":0.4,"arrows":2,"cost":280},{"level":3,"damage":45,"slow":0.5,"arrows":3,"cost":400}]', 3, 'ice'),
('回旋战斧', 'ejiate', '旋转飞斧，可攻击多个目标', 35, 2.8, 1.1, 220, '[{"level":1,"damage":35,"targets":2,"cost":220},{"level":2,"damage":50,"targets":3,"cost":340},{"level":3,"damage":70,"targets":4,"cost":500}]', 3, 'physical'),
('烈焰法师', 'fashi', '持续火焰伤害', 10, 3.0, 0.9, 280, '[{"level":1,"damage":10,"dot":5,"duration":3,"cost":280},{"level":2,"damage":15,"dot":8,"duration":4,"cost":400},{"level":3,"damage":25,"dot":12,"duration":5,"cost":580}]', 3, 'fire'),
('暗影毒师', 'dushi', '中毒效果，持续伤害', 8, 2.7, 1.3, 190, '[{"level":1,"damage":8,"poison":3,"duration":5,"cost":190},{"level":2,"damage":12,"poison":5,"duration":6,"cost":300},{"level":3,"damage":18,"poison":8,"duration":7,"cost":450}]', 3, 'poison');

-- 插入初始数据：敌人类型
INSERT INTO enemy_types (enemy_name, enemy_code, health, speed, armor, magic_resist, coin_reward, score_reward, size) VALUES
('普通僵尸', 'zombie_normal', 100, 1.0, 0, 0, 10, 5, 'small'),
('铁门僵尸', 'zombie_armored', 300, 0.6, 10, 0, 25, 15, 'medium'),
('橄榄球僵尸', 'zombie_fast', 80, 2.0, 5, 0, 15, 8, 'small'),
('报纸僵尸', 'zombie_weak', 50, 0.8, 0, 0, 20, 10, 'small'),
('舞蹈僵尸', 'zombie_dancer', 150, 1.2, 2, 5, 30, 20, 'medium'),
('巨人僵尸', 'zombie_giant', 1000, 0.4, 20, 10, 100, 50, 'large'),
('飞行僵尸', 'zombie_flying', 60, 1.5, 0, 15, 18, 12, 'small'),
('法师僵尸', 'zombie_mage', 120, 0.9, 0, 25, 35, 25, 'medium'),
('Boss僵尸', 'zombie_boss', 5000, 0.3, 30, 20, 500, 200, 'boss');

-- 插入初始数据：游戏关卡
INSERT INTO game_levels (level_name, level_number, difficulty, map_data, initial_coins, max_waves, required_stars, completion_bonus_coins, completion_bonus_gems) VALUES
('新手教学', 1, 'easy', '{"map": "beginner", "path": [[0,0],[10,0]]}', 800, 3, 0, 100, 5),
('初级挑战', 2, 'easy', '{"map": "basic", "path": [[0,0],[0,5],[10,5]]}', 600, 5, 1, 120, 6),
('中级考验', 3, 'medium', '{"map": "intermediate", "path": [[0,0],[5,0],[5,5],[10,5]]}', 500, 7, 2, 150, 8),
('高级对决', 4, 'medium', '{"map": "advanced", "path": [[0,0],[0,10],[10,10]]}', 400, 10, 4, 200, 10),
('专家模式', 5, 'hard', '{"map": "expert", "path": [[0,0],[3,3],[7,3],[10,0]]}', 300, 15, 6, 300, 15),
('终极挑战', 6, 'expert', '{"map": "ultimate", "path": [[0,0],[2,2],[4,0],[6,2],[8,0],[10,2]]}', 200, 20, 10, 500, 25);

-- 插入初始数据：成就
INSERT INTO achievements (achievement_name, description, achievement_type, category, condition_type, condition_value, reward_coins, reward_gems) VALUES
('初出茅庐', '完成第一关', 'progress', 'level', 'completion', 1, 100, 5),
('塔防大师', '建造100座防御塔', 'progress', 'tower', 'build_count', 100, 200, 10),
('僵尸杀手', '击杀1000个敌人', 'progress', 'enemy', 'kill_count', 1000, 300, 15),
('完美通关', '获得3星评价通关', 'skill', 'level', 'completion', 1, 150, 8),
('连击高手', '达成50连击', 'skill', 'combo', 'combo', 50, 100, 5),
('快速通关', '在3分钟内通关', 'skill', 'level', 'time', 180, 200, 10),
('财富积累', '累计获得10000金币', 'progress', 'general', 'score', 10000, 500, 20),
('等级达人', '达到玩家等级10级', 'progress', 'general', 'completion', 10, 300, 12),
('游戏专家', '累计游戏100局', 'progress', 'general', 'completion', 100, 400, 18),
('无伤通关', '不受到伤害完成关卡', 'skill', 'level', 'completion', 1, 250, 15);

-- 插入初始数据：商店物品
INSERT INTO shop_items (item_name, description, item_type, price_coins, price_gems, effect_duration, effect_value) VALUES
('金币加倍', '下一局游戏金币收益翻倍', 'powerup', 50, 5, 1, '{"coin_multiplier": 2}'),
('经验加成', '下一局游戏经验值增加50%', 'powerup', 80, 8, 1, '{"exp_multiplier": 1.5}'),
('即时修复', '立即修复所有防御塔', 'powerup', 30, 3, 0, '{"repair_all": true}'),
('强化弹药', '所有防御塔伤害增加25%', 'powerup', 100, 10, 300, '{"damage_boost": 1.25}'),
('时间减缓', '敌人移动速度降低50%', 'powerup', 120, 12, 180, '{"enemy_slow": 0.5}'),
('护盾发生器', '基地获得额外护盾', 'powerup', 150, 15, 0, '{"base_shield": 100}'),
('神秘宝箱', '随机获得奖励', 'cosmetic', 200, 20, 0, '{"random_reward": true}'),
('玩家头像框', '炫酷的专属头像框', 'cosmetic', 0, 50, 0, '{"avatar_frame": "golden"}'),
('防御塔皮肤', '自定义防御塔外观', 'cosmetic', 0, 30, 0, '{"tower_skin": "crystal"}'),
('能量补充', '立即获得1000金币', 'boost', 0, 20, 0, '{"instant_coins": 1000}');

-- 验证表创建成功的查询
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'game_levels', 'tower_types', 'enemy_types', 
                     'game_sessions', 'user_level_progress', 'leaderboards', 
                     'achievements', 'user_achievements', 'shop_items', 'user_inventory')
ORDER BY tablename;

-- 显示表记录数
SELECT 
    'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 
    'game_levels' as table_name, COUNT(*) as record_count FROM game_levels
UNION ALL
SELECT 
    'tower_types' as table_name, COUNT(*) as record_count FROM tower_types
UNION ALL
SELECT 
    'enemy_types' as table_name, COUNT(*) as record_count FROM enemy_types
UNION ALL
SELECT 
    'achievements' as table_name, COUNT(*) as record_count FROM achievements
UNION ALL
SELECT 
    'shop_items' as table_name, COUNT(*) as record_count FROM shop_items
UNION ALL
SELECT 
    'user_achievements' as table_name, COUNT(*) as record_count FROM user_achievements;

-- 显示外键约束信息（验证修复结果）
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'user_achievements'
ORDER BY tc.table_name, kcu.column_name;