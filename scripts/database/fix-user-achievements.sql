-- 修复 user_achievements 表的外键约束错误
-- 先删除可能存在的错误表，然后重新创建正确的表

-- 如果表存在，先删除
DROP TABLE IF EXISTS user_achievements CASCADE;

-- 重新创建 user_achievements 表（正确的外键引用）
CREATE TABLE user_achievements (
    user_achievement_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,  -- ✅ 正确引用 users.user_id
    achievement_id UUID NOT NULL REFERENCES achievements(achievement_id) ON DELETE CASCADE,
    
    progress_current INT DEFAULT 0,
    progress_target INT NOT NULL,
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlock_date TIMESTAMP WITH TIME ZONE,
    unlock_count INT DEFAULT 0,
    
    UNIQUE (user_id, achievement_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id, is_unlocked);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- 启用行级安全策略
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- 创建安全策略
CREATE POLICY "Allow users to manage own achievements" ON user_achievements
FOR ALL USING (auth.uid()::text = user_id::text);

-- 插入一些测试数据（如果用户表存在）
DO $$
BEGIN
    -- 检查是否有用户数据
    IF EXISTS (SELECT 1 FROM users LIMIT 1) THEN
        -- 为每个用户插入一些成就进度
        INSERT INTO user_achievements (user_id, achievement_id, progress_current, progress_target, is_unlocked)
        SELECT 
            u.user_id,
            a.achievement_id,
            0,
            a.condition_value,
            false
        FROM users u
        CROSS JOIN achievements a
        WHERE a.achievement_type = 'progress'
        LIMIT 50
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
        
        RAISE NOTICE '✅ 已为用户插入成就进度数据';
    END IF;
END $$;

-- 验证表结构
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_achievements' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 显示外键约束信息
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'user_achievements' 
    AND tc.constraint_type = 'FOREIGN KEY';