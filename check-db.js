import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 客户端
const supabase = createClient(
  'https://vcmrpbysnxzqhxjfvshf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbXJwYnlzbnh6cWh4amZ2c2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Njc3MDYsImV4cCI6MjA3OTU0MzcwNn0.QrC98Co6699N8-3KDbRvRHtAxayCP93NxSclRB8P1Dg'
);

async function checkTables() {
  console.log('🔍 检查数据库表状态...');
  
  try {
    // 尝试查询用户表
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (usersError && usersError.code === 'PGRST116') {
      console.log('❌ users 表不存在');
      console.log('\n⚠️  需要手动创建数据库表');
      console.log('请按照 MANUAL_DATABASE_SETUP.md 文件中的说明操作');
    } else if (usersError) {
      console.error('❌ 检查用户表时出错:', usersError.message);
    } else {
      console.log('✅ users 表已存在');
      
      // 获取用户数量
      const { data: userData } = await supabase
        .from('users')
        .select('id, username');
      
      console.log(`📊 当前有 ${userData?.length || 0} 个用户`);
      
      // 检查游戏分数表
      const { data: scoresData, error: scoresError } = await supabase
        .from('game_scores')
        .select('count')
        .limit(1);
      
      if (scoresError && scoresError.code === 'PGRST116') {
        console.log('❌ game_scores 表不存在');
      } else if (scoresError) {
        console.error('❌ 检查分数表时出错:', scoresError.message);
      } else {
        console.log('✅ game_scores 表已存在');
        
        // 获取分数记录数量
        const { data: scoreData } = await supabase
          .from('game_scores')
          .select('id');
        
        console.log(`📊 当前有 ${scoreData?.length || 0} 条分数记录`);
        
        // 获取排行榜数据
        const { data: rankData } = await supabase
          .from('game_scores')
          .select(`
            id,
            user_id,
            level,
            score,
            users(username)
          `)
          .order('score', { ascending: false })
          .limit(5);
        
        if (rankData && rankData.length > 0) {
          console.log('\n🏆 排行榜前5名:');
          rankData.forEach((item, index) => {
            const username = item.users?.username || '未知用户';
            console.log(`${index + 1}. ${username} - 关卡 ${item.level}, 分数 ${item.score}`);
          });
        }
      }
    }
  } catch (err) {
    console.error('❌ 数据库检查失败:', err.message);
  }
}

checkTables();