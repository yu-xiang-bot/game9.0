import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase 配置
const supabaseUrl = 'https://vcmrpbysnxzqhxjfvshf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbXJwYnlzbnh6cWh4amZ2c2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Njc3MDYsImV4cCI6MjA3OTU0MzcwNn0.QrC98Co6699N8-3KDbRvRHtAxayCP93NxSclRB8P1Dg';

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrateDatabase() {
  console.log('🚀 开始数据库迁移到塔防专用结构...\n');

  try {
    // 1. 检查现有数据
    console.log('📊 检查现有数据...');
    const { data: existingUsers, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError && !usersError.message?.includes('does not exist')) {
      console.error('❌ 检查用户数据失败:', usersError.message);
      return;
    }

    const { data: existingScores, error: scoresError } = await supabase
      .from('game_scores')
      .select('*');
    
    if (scoresError && !scoresError.message?.includes('does not exist')) {
      console.error('❌ 检查游戏分数失败:', scoresError.message);
      return;
    }

    console.log(`✅ 找到 ${existingUsers?.length || 0} 个用户`);
    console.log(`✅ 找到 ${existingScores?.length || 0} 条游戏记录`);

    // 2. 备份现有数据
    console.log('\n💾 备份现有数据...');
    if (existingUsers?.length > 0) {
      fs.writeFileSync(
        path.join(__dirname, 'backup_users.json'),
        JSON.stringify(existingUsers, null, 2)
      );
    }
    if (existingScores?.length > 0) {
      fs.writeFileSync(
        path.join(__dirname, 'backup_game_scores.json'),
        JSON.stringify(existingScores, null, 2)
      );
    }
    console.log('✅ 数据备份完成');

    // 3. 显示迁移计划
    console.log('\n📋 迁移计划:');
    console.log('1. 创建新的塔防专用表结构');
    console.log('2. 迁移用户数据到新结构');
    console.log('3. 迁移游戏分数到新结构');
    console.log('4. 插入初始游戏数据（防御塔、敌人等）');
    console.log('5. 更新应用配置');

    // 4. 读取SQL文件
    console.log('\n📝 读取数据库结构文件...');
    const sqlPath = path.join(__dirname, 'database/tower-defense-database.sql');
    const insertDataPath = path.join(__dirname, 'database/insert-initial-data.sql');
    
    if (!fs.existsSync(sqlPath)) {
      console.error('❌ 数据库结构文件不存在:', sqlPath);
      return;
    }
    
    const createTablesSQL = fs.readFileSync(sqlPath, 'utf8');
    const insertDataSQL = fs.readFileSync(insertDataPath, 'utf8');
    
    console.log('✅ SQL文件读取完成');

    // 5. 执行迁移
    console.log('\n⚠️  重要提示:');
    console.log('由于安全限制，无法自动执行数据库结构变更。');
    console.log('请按照以下步骤手动完成迁移:');
    console.log('\n📌 步骤 1: 创建新表结构');
    console.log('1. 访问 Supabase 控制台: https://app.supabase.com');
    console.log('2. 进入项目: vcmrpbysnxzqhxjfvshf');
    console.log('3. 打开 SQL 编辑器');
    console.log(`4. 复制并运行文件内容: ${sqlPath}`);
    console.log('5. 确认所有表创建成功');

    console.log('\n📌 步骤 2: 插入初始数据');
    console.log(`1. 复制并运行文件内容: ${insertDataPath}`);
    console.log('2. 确认初始数据插入成功');

    console.log('\n📌 步骤 3: 数据迁移脚本');
    console.log('完成后，运行以下 Node.js 脚本来迁移现有数据:');
    
    const migrationScript = `
// 数据迁移脚本（在 Supabase SQL 编辑器中运行）
-- 迁移用户数据到新表结构
INSERT INTO users (
  user_id, username, email, password_hash, display_name, avatar_url, phone,
  total_score, games_played, games_won, registration_date, created_at, updated_at
)
SELECT 
  id,
  username,
  COALESCE(email, username || '@example.com'),
  password,
  username,
  COALESCE(avatar, '/images/default_avatar.png'),
  phone,
  0, -- total_score
  0, -- games_played  
  0, -- games_won
  created_at,
  created_at,
  updated_at
FROM old_users
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE users.username = old_users.username
);

-- 迁移游戏分数到新表结构
INSERT INTO game_sessions (
  user_id, level_id, score, is_victory, start_time, end_time, waves_completed, enemies_killed
)
SELECT 
  user_id,
  (SELECT level_id FROM game_levels WHERE level_number = gs.level LIMIT 1),
  gs.score,
  true, -- is_victory (假设都是胜利)
  gs.created_at,
  gs.created_at,
  gs.level, -- waves_completed (使用level作为waves_completed的近似值)
  FLOOR(gs.score / 10) -- enemies_killed (估算值)
FROM game_scores gs
WHERE EXISTS (
  SELECT 1 FROM users WHERE users.user_id = gs.user_id
);

-- 更新用户游戏统计
UPDATE users 
SET 
  total_score = (
    SELECT COALESCE(SUM(score), 0) 
    FROM game_sessions 
    WHERE game_sessions.user_id = users.user_id
  ),
  games_played = (
    SELECT COUNT(*) 
    FROM game_sessions 
    WHERE game_sessions.user_id = users.user_id
  ),
  games_won = (
    SELECT COUNT(*) 
    FROM game_sessions 
    WHERE game_sessions.user_id = users.user_id AND is_victory = true
  );
`;

    console.log('\n```sql');
    console.log(migrationScript);
    console.log('```');

    console.log('\n📌 步骤 4: 验证迁移');
    console.log('运行以下命令验证迁移是否成功:');
    console.log('SELECT COUNT(*) as user_count FROM users;');
    console.log('SELECT COUNT(*) as level_count FROM game_levels;');
    console.log('SELECT COUNT(*) as tower_count FROM tower_types;');
    console.log('SELECT COUNT(*) as session_count FROM game_sessions;');

    console.log('\n✅ 迁移指南生成完成！');
    console.log('📁 备份文件保存在:', path.join(__dirname, 'backup_*.json'));
    
  } catch (error) {
    console.error('❌ 迁移过程中出现错误:', error);
  }
}

async function testNewStructure() {
  console.log('\n🔍 测试新的数据库结构连接...');
  
  try {
    // 测试新表是否存在
    const tables = ['users', 'game_levels', 'tower_types', 'enemy_types', 'game_sessions'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        console.log(`⚠️  表 ${table} 尚未创建`);
      } else if (error) {
        console.log(`❌ 表 ${table} 连接失败:`, error.message);
      } else {
        console.log(`✅ 表 ${table} 连接正常`);
      }
    }
    
  } catch (error: any) {
    console.log('❌ 测试连接失败:', error.message);
  }
}

// 主函数
async function main() {
  console.log('🎮 塔防联盟数据库迁移工具\n');
  
  await testNewStructure();
  await migrateDatabase();
  
  console.log('\n🎉 脚本执行完成！');
  console.log('💡 记得在 Supabase 控制台完成手动迁移步骤');
}

main();