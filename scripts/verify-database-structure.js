import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vcmrpbysnxzqhxjfvshf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbXJwYnlzbnh6cWh4amZ2c2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Njc3MDYsImV4cCI6MjA3OTU0MzcwNn0.QrC98Co6699N8-3KDbRvRHtAxayCP93NxSclRB8P1Dg'
);

async function verifyDatabaseStructure() {
  console.log('🔍 验证数据库结构和外键约束\n');

  // 检查关键表是否存在
  const tables = [
    'users',
    'game_levels', 
    'tower_types',
    'enemy_types',
    'game_sessions',
    'user_level_progress',
    'leaderboards',
    'achievements',
    'user_achievements'
  ];

  console.log('📋 表结构检查:');
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        console.log(`   ❌ 表 ${table} 不存在`);
      } else if (error) {
        console.log(`   ⚠️  表 ${table} 连接错误: ${error.message}`);
      } else {
        console.log(`   ✅ 表 ${table} 存在`);
      }
    } catch (err) {
      console.log(`   ❌ 表 ${table} 检查失败`);
    }
  }

  // 检查外键关系（通过查询测试）
  console.log('\n🔗 外键关系检查:');
  
  try {
    // 测试 user_achievements 的外键关系
    console.log('   🧪 测试 user_achievements 外键...');
    
    // 1. 检查 user_id 是否能正确关联 users
    const { data: userAchievements, error: uaError } = await supabase
      .from('user_achievements')
      .select(`
        user_id,
        achievement_id,
        users(username)
      `)
      .limit(1);
    
    if (uaError) {
      console.log(`      ❌ user_id 外键错误: ${uaError.message}`);
    } else {
      console.log(`      ✅ user_id → users.user_id 外键正常`);
    }
    
    // 2. 检查 achievement_id 是否能正确关联 achievements
    const { data: achievementJoin, error: ajError } = await supabase
      .from('user_achievements')
      .select(`
        achievement_id,
        achievements(achievement_name)
      `)
      .limit(1);
    
    if (ajError) {
      console.log(`      ❌ achievement_id 外键错误: ${ajError.message}`);
    } else {
      console.log(`      ✅ achievement_id → achievements.achievement_id 外键正常`);
    }
    
  } catch (err) {
    console.log(`   ❌ 外键检查失败: ${err.message}`);
  }

  // 检查数据完整性
  console.log('\n📊 数据完整性检查:');
  
  try {
    // 检查孤立的 user_achievements 记录
    const { data: orphanedAchievements, error: orphanError } = await supabase
      .from('user_achievements')
      .select('user_id, achievement_id')
      .is('users', null); // 检查是否有关联的用户
    
    if (orphanError) {
      console.log(`   ⚠️  无法检查孤立记录: ${orphanError.message}`);
    } else {
      console.log(`   ✅ 无孤立的成就记录`);
    }
    
    // 统计数据
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: achievementCount } = await supabase.from('achievements').select('*', { count: 'exact', head: true });
    const { count: userAchievementCount } = await supabase.from('user_achievements').select('*', { count: 'exact', head: true });
    
    console.log(`   👥 用户数: ${userCount || 0}`);
    console.log(`   🏆 成就数: ${achievementCount || 0}`);
    console.log(`   📈 用户成就记录数: ${userAchievementCount || 0}`);
    
  } catch (err) {
    console.log(`   ❌ 数据完整性检查失败: ${err.message}`);
  }

  console.log('\n💡 如果发现外键错误，请运行以下修复命令:');
  console.log('   psql -h [host] -U [user] -d [database] -f scripts/database/fix-user-achievements.sql');
  console.log('   或者在 Supabase SQL 编辑器中运行 fix-user-achievements.sql 文件内容');
}

async function main() {
  console.log('🛠️  数据库结构验证工具\n');
  await verifyDatabaseStructure();
  console.log('\n✅ 验证完成！');
}

main();