import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建 Supabase 客户端
const supabase = createClient(
  'https://vcmrpbysnxzqhxjfvshf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbXJwYnlzbnh6cWh4amZ2c2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Njc3MDYsImV4cCI6MjA3OTU0MzcwNn0.QrC98Co6699N8-3KDbRvRHtAxayCP93NxSclRB8P1Dg'
);

async function addTestData() {
  console.log('🚀 开始添加测试数据...');
  
  try {
    // 检查是否已有用户
    const { data: existingUsers, error: usersError } = await supabase
      .from('users')
      .select('id, username')
      .limit(5);
    
    if (usersError) {
      console.error('❌ 获取用户失败:', usersError.message);
      return;
    }
    
    if (existingUsers && existingUsers.length > 0) {
      console.log(`✅ 找到 ${existingUsers.length} 个现有用户:`, existingUsers.map(u => u.username).join(', '));
      
      // 为现有用户添加游戏分数
      for (const user of existingUsers) {
        const levels = [1, 2, 3, 4, 5];
        const baseScore = Math.floor(Math.random() * 500) + 100; // 100-600之间的基础分数
        
        for (const level of levels) {
          const score = baseScore * level + Math.floor(Math.random() * 50); // 关卡越高分数越高
          
          const { data, error } = await supabase
            .from('game_scores')
            .upsert({
              user_id: user.id,
              level,
              score
            }, {
              onConflict: 'user_id,level'
            })
            .select();
          
          if (error) {
            console.error(`❌ 用户 ${user.username} 关卡 ${level} 分数添加失败:`, error.message);
          } else {
            console.log(`✅ 用户 ${user.username} 关卡 ${level} 分数 ${score} 添加成功`);
          }
        }
      }
    } else {
      // 如果没有用户，创建测试用户
      console.log('⚠️  没有找到现有用户，创建测试用户...');
      
      const testUsers = [
        { username: 'testuser1', password: 'password123', phone: '13800138001' },
        { username: 'testuser2', password: 'password456', phone: '13800138002' },
        { username: 'testuser3', password: 'password789', phone: '13800138003' }
      ];
      
      for (const user of testUsers) {
        // 创建用户
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert(user)
          .select()
          .single();
        
        if (userError) {
          console.error(`❌ 创建用户 ${user.username} 失败:`, userError.message);
          continue;
        }
        
        console.log(`✅ 创建用户 ${user.username} 成功，ID: ${newUser.id}`);
        
        // 为新用户添加游戏分数
        const levels = [1, 2, 3];
        const baseScore = Math.floor(Math.random() * 300) + 100; // 100-400之间的基础分数
        
        for (const level of levels) {
          const score = baseScore * level + Math.floor(Math.random() * 50);
          
          const { data, error } = await supabase
            .from('game_scores')
            .insert({
              user_id: newUser.id,
              level,
              score
            })
            .select();
          
          if (error) {
            console.error(`❌ 用户 ${user.username} 关卡 ${level} 分数添加失败:`, error.message);
          } else {
            console.log(`✅ 用户 ${user.username} 关卡 ${level} 分数 ${score} 添加成功`);
          }
        }
      }
    }
    
    // 显示排行榜数据
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
      .limit(10);
    
    if (!rankError && rankData && rankData.length > 0) {
      console.log('\n🏆 排行榜前10名:');
      rankData.forEach((item, index) => {
        const username = item.users?.username || '未知用户';
        console.log(`${index + 1}. ${username} - 关卡 ${item.level}, 分数 ${item.score}`);
      });
    } else {
      console.log('\n📊 无法获取排行榜数据');
    }
    
    console.log('\n🎉 测试数据添加完成！');
    
  } catch (err) {
    console.error('❌ 添加测试数据失败:', err.message);
  }
}

addTestData();