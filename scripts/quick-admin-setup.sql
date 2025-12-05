-- 快速后台管理系统设置（最终修复版）
-- 基于现有表结构的优化脚本

-- 1. 创建必要的统计函数
CREATE OR REPLACE FUNCTION get_admin_overview()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN json_build_object(
    'totalUsers', (SELECT COUNT(*) FROM users),
    'onlineUsers', (SELECT COUNT(*) FROM users WHERE last_login >= NOW() - INTERVAL '5 minutes'),
    'todayGames', (SELECT COUNT(*) FROM game_sessions WHERE DATE(start_time) = CURRENT_DATE),
    'totalLevels', (SELECT COUNT(*) FROM game_levels)
  );
END;
$$;

-- 2. 创建用户统计视图
CREATE OR REPLACE VIEW v_admin_users AS
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
  COALESCE(stats.total_score, 0) as total_score
FROM users u
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as games_played,
    SUM(score) as total_score
  FROM game_sessions
  GROUP BY user_id
) stats ON u.user_id = stats.user_id;

-- 3. 创建关卡统计视图
CREATE OR REPLACE VIEW v_admin_levels AS
SELECT 
  gl.*,
  COALESCE(session_data.plays, 0) as total_plays,
  COALESCE(session_data.avg_score, 0) as avg_score
FROM game_levels gl
LEFT JOIN (
  SELECT 
    level_id,
    COUNT(*) as plays,
    ROUND(AVG(score)) as avg_score
  FROM game_sessions
  GROUP BY level_id
) session_data ON gl.level_id = session_data.level_id;

-- 4. 创建游戏记录统计视图
CREATE OR REPLACE VIEW v_admin_sessions AS
SELECT 
  gs.session_id,
  gs.score,
  gs.stars_earned,
  gs.is_victory,
  gs.start_time AS created_at,
  u.username,
  gl.level_name
FROM game_sessions gs
LEFT JOIN users u ON gs.user_id = u.user_id
LEFT JOIN game_levels gl ON gs.level_id = gl.level_id;

-- 5. 创建在线用户视图
CREATE OR REPLACE VIEW v_online_users AS
SELECT 
  user_id,
  username,
  last_login,
  CASE 
    WHEN last_login >= NOW() - INTERVAL '5 minutes' THEN 'online'
    WHEN last_login >= NOW() - INTERVAL '30 minutes' THEN 'idle'
    ELSE 'offline'
  END as status
FROM users
WHERE last_login IS NOT NULL;

-- 6. 插入测试关卡数据（使用更安全的插入方式）
INSERT INTO game_levels (level_name, level_number, difficulty, initial_coins, max_waves, map_data)
SELECT 
  '新手教程', 1, 'easy', 300, 5, '{"width": 10, "height": 8, "path": [[0,4],[9,4]], "tower_spots": [[2,2],[2,5]]}'
WHERE NOT EXISTS (SELECT 1 FROM game_levels WHERE level_number = 1);

INSERT INTO game_levels (level_name, level_number, difficulty, initial_coins, max_waves, map_data)
SELECT 
  '森林小径', 2, 'easy', 500, 8, '{"width": 12, "height": 10, "path": [[0,5],[4,5],[4,2],[8,2],[8,7],[11,7]], "tower_spots": [[2,2],[2,6],[4,4],[6,2]]}'
WHERE NOT EXISTS (SELECT 1 FROM game_levels WHERE level_number = 2);

INSERT INTO game_levels (level_name, level_number, difficulty, initial_coins, max_waves, map_data)
SELECT 
  '沙漠要塞', 3, 'medium', 600, 12, '{"width": 15, "height": 12, "path": [[0,6],[5,6],[5,3],[10,3],[10,8],[14,8]], "tower_spots": [[2,4],[2,8],[4,6],[7,2],[7,4]]}'
WHERE NOT EXISTS (SELECT 1 FROM game_levels WHERE level_number = 3);

-- 7. 创建测试用户（使用更安全的插入方式）
INSERT INTO users (username, email, password_hash, coins, gems, status, registration_date)
SELECT 
  'admin', 'admin@example.com', 'test_hash', 10000, 500, 'active', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin' OR email = 'admin@example.com');

INSERT INTO users (username, email, password_hash, coins, gems, status, registration_date)
SELECT 
  'testuser', 'test@example.com', 'test_hash', 1000, 50, 'active', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'testuser' OR email = 'test@example.com');

-- 8. 创建测试游戏记录（使用更安全的插入方式）
INSERT INTO game_sessions (user_id, level_id, score, stars_earned, is_victory, start_time)
SELECT 
  u.user_id,
  gl.level_id,
  floor(random() * 5000 + 500)::integer as score,
  floor(random() * 4 + 1)::integer as stars_earned,
  random() > 0.5 as is_victory,
  NOW() - (floor(random() * 7) || ' days')::INTERVAL
FROM users u, game_levels gl
WHERE u.username IN ('admin', 'testuser')
  AND NOT EXISTS (
    SELECT 1 FROM game_sessions gs 
    WHERE gs.user_id = u.user_id AND gs.level_id = gl.level_id
  )
LIMIT 10;

-- 9. 验证设置
DO $$
BEGIN
  RAISE NOTICE '🚀 后台管理系统设置完成！';
  RAISE NOTICE '📊 可用的视图：';
  RAISE NOTICE '  • v_admin_users - 用户管理数据';
  RAISE NOTICE '  • v_admin_levels - 关卡管理数据';
  RAISE NOTICE '  • v_admin_sessions - 游戏记录数据';
  RAISE NOTICE '  • v_online_users - 在线用户数据';
  RAISE NOTICE '🔧 可用的函数：';
  RAISE NOTICE '  • get_admin_overview() - 管理概览统计';
  
  -- 测试函数
  PERFORM get_admin_overview();
  RAISE NOTICE '✅ 函数测试成功！';
  
EXCEPTION
  WHEN others THEN
    RAISE NOTICE '❌ 设置过程中出现错误: %', SQLERRM;
END $$;

-- 10. 显示结果
SELECT '📈 当前数据库状态：' as status;
SELECT '用户总数: ' || COUNT(*) FROM users;
SELECT '关卡总数: ' || COUNT(*) FROM game_levels;
SELECT '游戏记录总数: ' || COUNT(*) FROM game_sessions;
SELECT '概览数据: ' || get_admin_overview()::json;