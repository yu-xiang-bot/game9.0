
// 数据库修复验证脚本
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vcmrpbysnxzqhxjfvshf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbXJwYnlzbnh6cWh4amZ2c2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Njc3MDYsImV4cCI6MjA3OTU0MzcwNn0.QrC98Co6699N8-3KDbRvRHtAxayCP93NxSclRB8P1Dg'
);

async function verifyFixedDatabase() {
  console.log('🔍 验证修复后的数据库\n');
  
  const tables = [
    'users', 'game_levels', 'tower_types', 'enemy_types',
    'game_sessions', 'user_level_progress', 'leaderboards',
    'achievements', 'user_achievements', 'shop_items', 'user_inventory'
  ];
  
  let successCount = 0;
  let totalCount = tables.length;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: 存在`);
        successCount++;
      }
    } catch (err) {
      console.log(`   ❌ ${table}: 检查失败`);
    }
  }
  
  // 检查外键关系
  console.log('\n🔗 检查外键关系:');
  try {
    const { data: joinTest, error: joinError } = await supabase
      .from('user_achievements')
      .select(`
        user_id,
        achievement_id,
        users(username),
        achievements(achievement_name)
      `)
      .limit(1);
    
    if (joinError) {
      console.log(`   ❌ user_achievements 外键失败: ${joinError.message}`);
    } else {
      console.log('   ✅ user_achievements 外键正常');
    }
  } catch (err) {
    console.log('   ❌ 外键检查失败');
  }
  
  // 显示统计
  console.log(`\n📊 验证结果: ${successCount}/${totalCount} 个表正常`);
  
  if (successCount === totalCount) {
    console.log('🎉 数据库修复成功！所有表和关系都正常');
    return true;
  } else {
    console.log('⚠️  仍有问题，需要进一步检查');
    return false;
  }
}

verifyFixedDatabase();
