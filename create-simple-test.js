import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 客户端
const supabase = createClient(
  'https://vcmrpbysnxzqhxjfvshf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbXJwYnlzbnh6cWh4amZ2c2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Njc3MDYsImV4cCI6MjA3OTU0MzcwNn0.QrC98Co6699N8-3KDbRvRHtAxayCP93NxSclRB8P1Dg'
);

async function testDatabaseStatus() {
  console.log('🔍 检查数据库状态...');
  
  try {
    // 尝试访问公共模式
    const { data: schemas, error: schemaError } = await supabase
      .rpc('get_schema_info')
      .catch(() => ({ data: null, error: { message: 'RPC not available' } }));
    
    if (schemaError) {
      console.log('ℹ️  使用替代方法检查表...');
      
      // 尝试直接查询用户表
      try {
        const { data, error } = await supabase
          .from('users')
          .select('count')
          .limit(1);
        
        if (error && error.code === 'PGRST116') {
          console.log('❌ users 表不存在');
          console.log('\n🔧 请手动执行以下步骤创建表:');
          console.log('1. 访问 https://app.supabase.com');
          console.log('2. 登录并选择项目: vcmrpbysnxzqhxjfvshf');
          console.log('3. 打开 SQL Editor');
          console.log('4. 复制并运行 supabase-init.sql 文件中的内容');
          console.log('5. 完成后重新运行此脚本');
        } else if (error) {
          console.error('❌ 检查表时出错:', error.message);
        } else {
          console.log('✅ users 表已存在');
        }
      } catch (err) {
        console.error('❌ 数据库检查失败:', err.message);
      }
    }
    
  } catch (err) {
    console.error('❌ 连接失败:', err.message);
  }
}

testDatabaseStatus();