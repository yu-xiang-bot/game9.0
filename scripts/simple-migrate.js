import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vcmrpbysnxzqhxjfvshf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbXJwYnlzbnh6cWh4amZ2c2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Njc3MDYsImV4cCI6MjA3OTU0MzcwNn0.QrC98Co6699N8-3KDbRvRHtAxayCP93NxSclRB8P1Dg'
);

async function main() {
  console.log('🎮 塔防联盟数据库迁移指南\n');

  console.log('📋 手动迁移步骤:');
  console.log('\n1️⃣ 创建新表结构');
  console.log('   - 访问: https://app.supabase.com');
  console.log('   - 选择项目: vcmrpbysnxzqhxjfvshf');
  console.log('   - 打开 SQL 编辑器');
  console.log('   - 运行文件: scripts/database/tower-defense-database.sql');

  console.log('\n2️⃣ 插入初始数据');
  console.log('   - 运行文件: scripts/database/insert-initial-data.sql');

  console.log('\n3️⃣ 验证创建');
  const tables = ['users', 'game_levels', 'tower_types', 'enemy_types', 'game_sessions', 'leaderboards', 'achievements'];
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error && error.code === 'PGRST116') {
        console.log(`   ❌ 表 ${table} 未创建`);
      } else if (error) {
        console.log(`   ⚠️  表 ${table} 连接错误: ${error.message}`);
      } else {
        console.log(`   ✅ 表 ${table} 已存在`);
      }
    } catch (err) {
      console.log(`   ❌ 表 ${table} 检查失败`);
    }
  }

  console.log('\n4️⃣ 检查初始数据');
  try {
    const { data: towers } = await supabase.from('tower_types').select('count');
    const { data: enemies } = await supabase.from('enemy_types').select('count');
    const { data: levels } = await supabase.from('game_levels').select('count');
    const { data: achievements } = await supabase.from('achievements').select('count');

    console.log(`   🏰 防御塔: ${towers?.[0]?.count || 0} 个`);
    console.log(`   🧟 敌人: ${enemies?.[0]?.count || 0} 个`);
    console.log(`   🗺️ 关卡: ${levels?.[0]?.count || 0} 个`);
    console.log(`   🏆 成就: ${achievements?.[0]?.count || 0} 个`);
  } catch (err) {
    console.log('   ❌ 检查初始数据失败');
  }

  console.log('\n✅ 迁移指南完成！');
  console.log('💡 请按照上述步骤在 Supabase 控制台中完成迁移');
}

main();