// 测试 Supabase 连接
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vcmrpbysnxzqhxjfvshf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbXJwYnlzbnh6cWh4amZ2c2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Njc3MDYsImV4cCI6MjA3OTU0MzcwNn0.QrC98Co6699N8-3KDbRvRHtAxayCP93NxSclRB8P1Dg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔍 测试 Supabase 连接...')
    
    // 测试基本连接
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      console.error('❌ 连接失败:', error.message)
      return
    }
    
    console.log('✅ 连接成功!')
    
    // 检查表是否存在
    const tables = ['users', 'game_levels', 'game_sessions', 'tower_types', 'enemy_types']
    
    for (const table of tables) {
      try {
        const { count, error: tableError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (tableError) {
          console.log(`⚠️  表 ${table} 可能不存在:`, tableError.message)
        } else {
          console.log(`✓ 表 ${table}: ${count} 条记录`)
        }
      } catch (err) {
        console.log(`❌ 表 ${table} 访问错误:`, err.message)
      }
    }
    
  } catch (error) {
    console.error('🚨 测试失败:', error.message)
  }
}

testConnection()