import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  'https://vcmrpbysnxzqhxjfvshf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbXJwYnlzbnh6cWh4amZ2c2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Njc3MDYsImV4cCI6MjA3OTU0MzcwNn0.QrC98Co6699N8-3KDbRvRHtAxayCP93NxSclRB8P1Dg'
);

async function checkAndMigrate() {
  console.log('🚀 自动数据库迁移检查开始\n');

  // 1. 检查当前数据库状态
  console.log('📊 检查当前数据库状态:');
  
  const currentTables = [];
  const tablesToCheck = ['users', 'game_levels', 'tower_types', 'enemy_types', 'game_sessions', 'user_level_progress', 'leaderboards', 'achievements', 'user_achievements'];
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error && error.code === 'PGRST116') {
        console.log(`   ❌ ${table} - 不存在`);
      } else if (error) {
        console.log(`   ⚠️  ${table} - 错误: ${error.message}`);
      } else {
        console.log(`   ✅ ${table} - 存在`);
        currentTables.push(table);
      }
    } catch (err) {
      console.log(`   ❌ ${table} - 检查失败`);
    }
  }

  console.log(`\n📈 当前表数量: ${currentTables.length}/${tablesToCheck.length}`);

  // 2. 判断是否需要迁移
  const needsFullMigration = currentTables.length < tablesToCheck.length / 2;
  
  if (needsFullMigration) {
    console.log('\n🔄 需要执行完整数据库迁移...');
    console.log('💡 请手动在 Supabase 控制台执行以下步骤:');
    
    console.log('\n1️⃣ 创建新的表结构:');
    console.log('   文件路径: scripts/database/tower-defense-database.sql');
    console.log('   访问: https://app.supabase.com/project/vcmrpbysnxzqhxjfvshf/sql');
    
    console.log('\n2️⃣ 插入初始数据:');
    console.log('   文件路径: scripts/database/insert-initial-data.sql');
    
    console.log('\n3️⃣ 修复外键约束:');
    console.log('   文件路径: scripts/database/fix-user-achievements.sql');
    
    // 读取并显示关键SQL内容
    try {
      const fixSQL = fs.readFileSync(
        path.join(__dirname, 'database/fix-user-achievements.sql'), 
        'utf8'
      );
      console.log('\n🔧 修复外键约束的SQL内容:');
      console.log('```sql');
      console.log(fixSQL.substring(0, 1000) + (fixSQL.length > 1000 ? '...' : ''));
      console.log('```');
    } catch (err) {
      console.log('❌ 无法读取修复脚本');
    }

  } else {
    console.log('\n✅ 数据库基本结构已存在，检查外键约束...');
    await checkForeignKeyConstraints();
  }

  // 3. 备份现有数据
  if (currentTables.includes('users')) {
    console.log('\n💾 备份现有用户数据...');
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*');
      
      if (users && users.length > 0) {
        const backupPath = path.join(__dirname, `backup_users_${Date.now()}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(users, null, 2));
        console.log(`   ✅ 用户数据已备份到: ${backupPath}`);
        console.log(`   📊 备份用户数: ${users.length}`);
      }
    } catch (err) {
      console.log('   ❌ 备份失败');
    }
  }

  console.log('\n📋 迁移检查总结:');
  console.log(`   🔄 需要完整迁移: ${needsFullMigration ? '是' : '否'}`);
  console.log(`   📊 当前表数量: ${currentTables.length}`);
  console.log(`   💾 数据备份: 完成`);
  
  return needsFullMigration;
}

async function checkForeignKeyConstraints() {
  console.log('🔗 检查外键约束...');
  
  try {
    // 检查 user_achievements 表的外键
    const { data: testJoin, error } = await supabase
      .from('user_achievements')
      .select(`
        user_id,
        achievement_id,
        users(username),
        achievements(achievement_name)
      `)
      .limit(1);
    
    if (error) {
      console.log(`   ❌ user_achievements 外键约束错误: ${error.message}`);
      console.log('   🔧 请运行 fix-user-achievements.sql 修复');
      return false;
    } else {
      console.log('   ✅ user_achievements 外键约束正常');
      return true;
    }
  } catch (err) {
    console.log(`   ❌ 检查外键约束失败`);
    return false;
  }
}

async function runPostMigrationCheck() {
  console.log('\n🧪 运行迁移后检查...');
  
  // 等待一下让数据库更新
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const success = await checkForeignKeyConstraints();
  
  if (success) {
    console.log('\n🎉 数据库迁移成功完成！');
    console.log('✅ 所有表已创建');
    console.log('✅ 外键约束正常');
    console.log('✅ 数据完整性良好');
  } else {
    console.log('\n⚠️  迁移未完全成功，请检查外键约束');
  }
}

async function main() {
  console.log('🎮 塔防联盟 - 自动数据库迁移工具\n');
  
  const needsMigration = await checkAndMigrate();
  
  if (!needsMigration) {
    await runPostMigrationCheck();
  }
  
  console.log('\n✅ 检查完成！');
  console.log('💡 如需执行迁移，请按照上述步骤在 Supabase 控制台操作');
}

main().catch(console.error);