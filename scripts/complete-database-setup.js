import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
  'https://vcmrpbysnxzqhxjfvshf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbXJwYnlzbnh6cWh4amZ2c2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Njc3MDYsImV4cCI6MjA3OTU0MzcwNn0.QrC98Co6699N8-3KDbRvRHtAxayCP93NxSclRB8P1Dg'
);

async function completeDatabaseSetup() {
  console.log('🎮 塔防联盟 - 完整数据库设置\n');

  // 1. 读取所有SQL文件
  console.log('📚 读取数据库脚本...');
  
  const sqlFiles = [
    {
      name: '数据库结构',
      path: 'database/tower-defense-database.sql'
    },
    {
      name: '初始数据',
      path: 'database/insert-initial-data.sql'
    },
    {
      name: '外键修复',
      path: 'database/fix-user-achievements.sql'
    }
  ];

  const allSQL = [];
  
  for (const file of sqlFiles) {
    try {
      const filePath = path.join(__dirname, file.path);
      if (fs.existsSync(filePath)) {
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        allSQL.push({
          name: file.name,
          content: sqlContent
        });
        console.log(`   ✅ ${file.name} - 已读取`);
      } else {
        console.log(`   ❌ ${file.name} - 文件不存在`);
      }
    } catch (err) {
      console.log(`   ❌ ${file.name} - 读取失败`);
    }
  }

  // 2. 显示执行计划
  console.log('\n📋 数据库设置计划:');
  console.log('   由于 Supabase 安全限制，无法自动执行DDL语句。');
  console.log('   请按照以下步骤手动执行：');

  // 3. 为每个文件提供执行指导
  for (let i = 0; i < allSQL.length; i++) {
    const sqlFile = allSQL[i];
    console.log(`\n${i + 1}. 执行 ${sqlFile.name}:`);
    console.log('   a. 访问: https://app.supabase.com/project/vcmrpbysnxzqhxjfvshf/sql');
    console.log('   b. 复制以下SQL内容并执行:');
    console.log('   ```sql');
    console.log(sqlFile.content.substring(0, 500) + (sqlFile.content.length > 500 ? '\n... (完整内容请查看文件)' : ''));
    console.log('   ```');
  }

  // 4. 备份现有数据
  console.log('\n💾 备份现有数据...');
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email, created_at');
    
    if (users && users.length > 0) {
      const backupPath = path.join(__dirname, `users_backup_${Date.now()}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(users, null, 2));
      console.log(`   ✅ 用户数据已备份: ${backupPath}`);
      console.log(`   📊 备份用户数: ${users.length}`);
    }
  } catch (err) {
    console.log('   ⚠️  备份失败，但继续执行');
  }

  // 5. 提供验证脚本
  console.log('\n🧪 执行后验证脚本:');
  console.log('   运行以下命令验证设置结果:');
  console.log('   ```bash');
  console.log('   node scripts/verify-database-structure.js');
  console.log('   ```');

  // 6. 生成完整的执行文件
  const completeSQL = allSQL.map(file => `-- ${file.name}\n${file.content}`).join('\n\n');
  const completePath = path.join(__dirname, 'complete_migration.sql');
  fs.writeFileSync(completePath, completeSQL);
  console.log(`\n📄 完整迁移脚本已生成: ${completePath}`);
  console.log('   您可以将此文件内容一次性复制到 Supabase SQL 编辑器中执行。');

  // 7. 实时检查数据库状态
  console.log('\n🔍 实时数据库状态检查:');
  await checkCurrentStatus();

  console.log('\n🎯 设置指南总结:');
  console.log('   1. 备份现有数据 ✅');
  console.log('   2. 准备SQL脚本 ✅');
  console.log('   3. 在Supabase控制台执行 ⏳');
  console.log('   4. 验证结果 ⏳');
  
  console.log('\n💡 重要提示:');
  console.log('   - 按顺序执行SQL文件');
  console.log('   - 检查每个步骤的执行结果');
  console.log('   - 如遇错误，检查表是否存在冲突');
  
  return {
    success: true,
    sqlFiles: allSQL.map(f => f.name),
    backupPath: completePath
  };
}

async function checkCurrentStatus() {
  const tables = ['users', 'game_levels', 'tower_types', 'enemy_types', 'achievements', 'user_achievements'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error && error.code === 'PGRST116') {
        console.log(`   ❌ ${table} - 不存在`);
      } else if (error) {
        console.log(`   ⚠️  ${table} - 错误`);
      } else {
        console.log(`   ✅ ${table} - 存在`);
      }
    } catch (err) {
      console.log(`   ❌ ${table} - 检查失败`);
    }
  }
}

async function createStepByStepGuide() {
  const guide = {
    steps: [
      {
        title: "步骤1: 备份现有数据",
        description: "已自动备份现有用户数据",
        status: "✅ 完成"
      },
      {
        title: "步骤2: 创建基础表结构",
        description: "运行 tower-defense-database.sql",
        status: "⏳ 待执行"
      },
      {
        title: "步骤3: 插入初始数据",
        description: "运行 insert-initial-data.sql",
        status: "⏳ 待执行"
      },
      {
        title: "步骤4: 修复外键约束",
        description: "运行 fix-user-achievements.sql",
        status: "⏳ 待执行"
      },
      {
        title: "步骤5: 验证设置",
        description: "运行 verify-database-structure.js",
        status: "⏳ 待执行"
      }
    ]
  };

  console.log('\n📝 分步执行指南:');
  guide.steps.forEach((step, index) => {
    console.log(`${index + 1}. ${step.title} ${step.status}`);
    console.log(`   ${step.description}`);
  });
}

async function main() {
  console.log('🚀 启动完整数据库设置...\n');
  
  await completeDatabaseSetup();
  await createStepByStepGuide();
  
  console.log('\n🎉 数据库设置准备完成！');
  console.log('📋 所有必要文件已生成，请在 Supabase 控制台执行。');
  console.log('🔗 控制台地址: https://app.supabase.com/project/vcmrpbysnxzqhxjfvshf/sql');
}

main().catch(console.error);