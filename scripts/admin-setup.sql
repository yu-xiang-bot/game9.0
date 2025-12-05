-- 后台管理系统必要的 Supabase 函数和配置
-- 在 Supabase SQL Editor 中执行

-- 1. 创建统计用户在线的函数
CREATE OR REPLACE FUNCTION get_online_users_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM users
    WHERE last_login >= NOW() - INTERVAL '5 minutes'
  );
END;
$$;

-- 2. 创建今日游戏统计函数
CREATE OR REPLACE FUNCTION get_today_game_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_games', COUNT(*),
    'total_users', COUNT(DISTINCT user_id),
    'total_score', COALESCE(SUM(score), 0),
    'wins', COUNT(CASE WHEN is_victory = true THEN 1 END)
  ) INTO result
  FROM game_sessions
  WHERE DATE(created_at) = CURRENT_DATE;
  
  RETURN result;
END;
$$;

-- 3. 创建用户游戏统计视图
CREATE OR REPLACE VIEW v_user_game_stats AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    u.coins,
    u.gems,
    u.status,
    u.registration_date,
    u.last_login,
    COALESCE(stats.games_played, 0) as games_played,
    COALESCE(stats.total_score, 0) as total_score,
    COALESCE(stats.wins, 0) as wins
FROM users u
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as games_played,
        SUM(score) as total_score,
        COUNT(CASE WHEN is_victory = true THEN 1 END) as wins
    FROM game_sessions
    GROUP BY user_id
) stats ON u.user_id = stats.user_id;

-- 4. 创建关卡统计视图
CREATE OR REPLACE VIEW v_level_stats AS
SELECT 
    gl.*,
    COALESCE(session_stats.total_plays, 0) as total_plays,
    COALESCE(session_stats.avg_score, 0) as avg_score,
    COALESCE(session_stats.completion_rate, 0) as completion_rate
FROM game_levels gl
LEFT JOIN (
    SELECT 
        level_id,
        COUNT(*) as total_plays,
        ROUND(AVG(score)) as avg_score,
        ROUND(COUNT(CASE WHEN is_victory = true THEN 1 END) * 100.0 / COUNT(*)) as completion_rate
    FROM game_sessions
    GROUP BY level_id
) session_stats ON gl.level_id = session_stats.level_id;

-- 5. 创建简单的操作日志函数
CREATE OR REPLACE FUNCTION log_admin_action(
    action_description TEXT,
    target_table TEXT DEFAULT NULL,
    target_id TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 简单记录到系统表（如果没有 operation_logs 表，可以使用一个简单的记录表）
    -- 这里只是示例，实际项目中可能需要更详细的日志系统
    RAISE NOTICE 'Admin Action: % on table % with id %', 
        action_description, 
        COALESCE(target_table, 'N/A'), 
        COALESCE(target_id, 'N/A');
END;
$$;

-- 6. 创建数据完整性检查函数
CREATE OR REPLACE FUNCTION check_data_integrity()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'users_without_sessions', 
            (SELECT COUNT(*) FROM users u WHERE NOT EXISTS (SELECT 1 FROM game_sessions s WHERE s.user_id = u.user_id)),
        'levels_without_sessions',
            (SELECT COUNT(*) FROM game_levels gl WHERE NOT EXISTS (SELECT 1 FROM game_sessions s WHERE s.level_id = gl.level_id)),
        'orphaned_sessions',
            (SELECT COUNT(*) FROM game_sessions s WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = s.user_id)),
        'total_users', (SELECT COUNT(*) FROM users),
        'total_levels', (SELECT COUNT(*) FROM game_levels),
        'total_sessions', (SELECT COUNT(*) FROM game_sessions)
    ) INTO result;
    
    RETURN result;
END;
$$;

-- 7. 创建常用的管理查询函数
CREATE OR REPLACE FUNCTION get_admin_dashboard_data()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'stats', json_build_object(
            'totalUsers', (SELECT COUNT(*) FROM users),
            'onlineUsers', get_online_users_count(),
            'todayGames', COALESCE((SELECT COUNT(*) FROM game_sessions WHERE DATE(created_at) = CURRENT_DATE), 0),
            'totalLevels', (SELECT COUNT(*) FROM game_levels)
        ),
        'recentUsers', (
            SELECT json_agg(
                json_build_object(
                    'user_id', user_id,
                    'username', username,
                    'email', email,
                    'registration_date', registration_date
                )
            )
            FROM users 
            ORDER BY registration_date DESC 
            LIMIT 5
        ),
        'topLevels', (
            SELECT json_agg(
                json_build_object(
                    'level_id', level_id,
                    'level_name', level_name,
                    'level_number', level_number,
                    'total_plays', total_plays,
                    'completion_rate', completion_rate
                )
            )
            FROM v_level_stats 
            WHERE total_plays > 0
            ORDER BY total_plays DESC 
            LIMIT 5
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- 创建一些基础数据（如果表为空）
INSERT INTO game_levels (level_name, level_number, difficulty, initial_coins, max_waves, map_data)
VALUES 
    ('新手教程', 1, 'easy', 300, 5, '{"width": 10, "height": 8, "path": [[0,4],[9,4]], "tower_spots": [[2,2],[2,5]]}'),
    ('森林小径', 2, 'easy', 500, 8, '{"width": 12, "height": 10, "path": [[0,5],[4,5],[4,2],[8,2],[8,7],[11,7]], "tower_spots": [[2,2],[2,6],[4,4],[6,2]]}'),
    ('沙漠要塞', 3, 'medium', 600, 12, '{"width": 15, "height": 12, "path": [[0,6],[5,6],[5,3],[10,3],[10,8],[14,8]], "tower_spots": [[2,4],[2,8],[4,6],[7,2],[7,4]]}')
ON CONFLICT (level_number) DO NOTHING;

-- 创建一些测试用户（如果没有）
INSERT INTO users (username, email, password_hash, coins, gems, status)
VALUES 
    ('admin', 'admin@example.com', 'dummy_hash', 5000, 100, 'active'),
    ('testuser', 'test@example.com', 'dummy_hash', 1000, 50, 'active')
ON CONFLICT (email) DO NOTHING;

-- 执行结果验证
SELECT '✅ 后台管理系统设置完成！' as status;
SELECT '📊 可用的管理函数：' as info;
SELECT '  • get_online_users_count() - 获取在线用户数' as func1;
SELECT '  • get_today_game_stats() - 今日游戏统计' as func2;
SELECT '  • get_admin_dashboard_data() - 仪表板数据' as func3;
SELECT '  • check_data_integrity() - 数据完整性检查' as func4;
SELECT '  • log_admin_action(action, table, id) - 记录管理操作' as func5;

-- 测试函数
SELECT '🔍 测试数据统计：' as test;
SELECT get_admin_dashboard_data() as dashboard_data;
SELECT '📈 数据完整性检查：' as check;
SELECT check_data_integrity() as integrity_report;