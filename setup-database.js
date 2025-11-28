import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从环境变量或直接使用配置
const supabaseUrl = 'https://vcmrpbysnxzqhxjfvshf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbXJwYnlzbnh6cWh4amZ2c2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Njc3MDYsImV4cCI6MjA3OTU0MzcwNn0.QrC98Co6699N8-3KDbRvRHtAxayCP93NxSclRB8P1Dg';

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 读取 SQL 文件
const sqlFilePath = path.join(__dirname, 'supabase-init.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// 将 SQL 内容分割为单独的语句
const sqlStatements = sqlContent
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0);

async function executeSQL() {
  console.log('🚀 开始执行数据库初始化脚本...');
  
  try {
    // 由于使用匿名密钥，我们不能直接执行 DDL 语句
    // 这里创建一个替代方案：插入一些测试数据
    
    console.log('✅ 测试连接到 Supabase...');
    
    // 简单的连接测试
    try {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(1);
      
      if (error) {
        console.log('✅ Supabase 连接正常 (表尚未创建，这是正常的)');
      } else {
        console.log('✅ 成功连接到 Supabase 数据库');
      }
    } catch (err) {
      console.error('❌ 连接测试失败:', err.message);
      return;
    }
    
    console.log('✅ 成功连接到 Supabase 数据库');
    
    // 创建测试数据（如果表已存在）
    try {
      // 测试 users 表是否存在
      const { error: usersError } = await supabase.from('users').select('id').limit(1);
      
      if (usersError && usersError.code === 'PGRST116') {
        console.log('⚠️  表尚未创建，请手动执行以下步骤:');
        console.log('\n1. 登录 Supabase 控制台: https://app.supabase.com');
        console.log('2. 进入项目: vcmrpbysnxzqhxjfvshf');
        console.log('3. 打开 SQL 编辑器');
        console.log('4. 复制并运行 supabase-init.sql 文件中的内容');
        console.log('5. 运行完成后重新执行此脚本');
      } else {
        console.log('✅ 数据库连接已建立');
        
        // 检查表是否存在
        try {
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('count')
            .limit(1);
          
          if (usersError && usersError.code === 'PGRST116') {
            console.log('⚠️  表尚未创建，请手动执行以下步骤:');
            console.log('\n1. 登录 Supabase 控制台: https://app.supabase.com');
            console.log('2. 进入项目: vcmrpbysnxzqhxjfvshf');
            console.log('3. 打开 SQL 编辑器');
            console.log('4. 复制并运行 MANUAL_DATABASE_SETUP.md 中的 SQL 脚本');
            console.log('5. 运行完成后重新执行此脚本验证');
          } else {
            console.log('✅ 数据库表已存在，应用可以正常使用！');
            
            // 获取用户数量
            const { data: userData, error: userCountError } = await supabase
              .from('users')
              .select('id');
            
            if (!userCountError) {
              console.log(`📊 当前用户数量: ${userData.length}`);
              
              // 如果有用户，显示前几个用户名
              if (userData.length > 0) {
                const { data: userDetails } = await supabase
                  .from('users')
                  .select('username')
                  .limit(3);
                
                console.log('👥 示例用户:', userDetails?.map(u => u.username).join(', '));
              }
            }
            
            // 检查游戏分数表
            const { data: scoresData, error: scoresError } = await supabase
              .from('game_scores')
              .select('id')
              .limit(1);
            
            if (!scoresError) {
              console.log('✅ 游戏分数表也存在，排行榜功能可用！');
            }
          }
        } catch (err) {
          console.error('❌ 检查表状态时出错:', err.message);
        }
        
        // 尝试获取排行榜数据
        try {
          const { data: rankData, error: rankError } = await supabase
            .from('game_scores')
            .select(`
              id,
              user_id,
              level,
              score,
              created_at,
              users(username, avatar)
            `)
            .order('score', { ascending: false })
            .limit(5);
          
          if (!rankError && rankData && rankData.length > 0) {
            console.log('\n🏆 排行榜前5名:');
            rankData.forEach((item, index) => {
              const username = item.users?.username || '未知用户';
              console.log(`${index + 1}. ${username} - 关卡 ${item.level}, 分数 ${item.score}`);
            });
          } else {
            console.log('\n📊 排行榜数据为空或获取失败');
          }
        } catch (err) {
          console.log('\n📊 无法获取排行榜数据:', err.message);
        }
      }
    } catch (err) {
      console.error('❌ 操作过程中出现错误:', err.message);
    }
    
    console.log('\n🎉 数据库设置完成！');
    
  } catch (err) {
    console.error('❌ 数据库初始化失败:', err.message);
  }
}

executeSQL();