import { supabase } from '@/config/supabase'

// 管理员服务
export const adminService = {
  // 获取所有用户
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('获取用户列表错误详情:', error)
        throw error
      }
      return { success: true, data: data || [] }
    } catch (error: any) {
      console.error('获取用户列表失败:', error)
      return { success: false, error: error.message }
    }
  },

  // 获取所有游戏分数
  async getAllScores() {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select(`
          *,
          users(username)
        `)
        .order('score', { ascending: false })
      
      if (error) {
        console.error('获取分数列表错误详情:', error)
        throw error
      }
      return { success: true, data: data || [] }
    } catch (error: any) {
      console.error('获取分数列表失败:', error)
      return { success: false, error: error.message }
    }
  },

  // 获取统计数据
  async getStats() {
    try {
      // 获取总用户数
      const { count: totalUsers, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
      
      // 获取总分数数
      const { count: totalScores, error: scoresError } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
      
      // 获取最高分
      const { data: maxScoreData, error: maxScoreError } = await supabase
        .from('game_sessions')
        .select('score')
        .order('score', { ascending: false })
        .limit(1)
        .single()
      
      // 获取最近一周的活动分数
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      const { count: activeScores, error: activeError } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())
      
      if (usersError || scoresError || maxScoreError || activeError) {
        console.error('统计数据错误详情:', { usersError, scoresError, maxScoreError, activeError })
        throw new Error('获取统计数据失败')
      }
      
      // 计算活跃用户数（最近一周有游戏记录的用户）
      const { count: activeUsers, error: activeUsersError } = await supabase
        .from('game_sessions')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())
      
      return { 
        success: true, 
        data: {
          totalUsers: totalUsers || 0,
          totalScores: totalScores || 0,
          highestScore: maxScoreData?.score || 0,
          activeScores: activeScores || 0,
          activeUsers: activeUsers || 0
        }
      }
    } catch (error: any) {
      console.error('获取统计数据失败:', error)
      return { success: false, error: error.message }
    }
  },

  // 删除用户
  async deleteUser(userId: string) {
    try {
      // 删除用户相关的所有数据
      const { error: sessionError } = await supabase
        .from('game_sessions')
        .delete()
        .eq('user_id', userId)
      
      const { error: progressError } = await supabase
        .from('user_level_progress')
        .delete()
        .eq('user_id', userId)
      
      const { error: leaderboardError } = await supabase
        .from('leaderboards')
        .delete()
        .eq('user_id', userId)
      
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('user_id', userId)
      
      if (sessionError || progressError || leaderboardError || userError) {
        console.error('删除用户错误详情:', { sessionError, progressError, leaderboardError, userError })
        throw new Error('删除用户失败')
      }
      
      return { success: true }
    } catch (error: any) {
      console.error('删除用户失败:', error)
      return { success: false, error: error.message }
    }
  },

  // 更新用户状态
  async updateUserStatus(userId: string, status: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status })
        .eq('user_id', userId)
      
      if (error) {
        console.error('更新用户状态错误详情:', error)
        throw error
      }
      
      return { success: true }
    } catch (error: any) {
      console.error('更新用户状态失败:', error)
      return { success: false, error: error.message }
    }
  },

  // 获取用户详情及游戏记录
  async getUserDetails(userId: string) {
    try {
      // 获取用户基本信息
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      // 获取用户游戏记录
      const { data: scoresData, error: scoresError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (userError || scoresError) {
        console.error('获取用户详情错误详情:', { userError, scoresError })
        throw new Error('获取用户详情失败')
      }
      
      return {
        success: true,
        data: {
          user: userData,
          scores: scoresData || []
        }
      }
    } catch (error: any) {
      console.error('获取用户详情失败:', error)
      return { success: false, error: error.message }
    }
  },

  // 删除游戏记录
  async deleteScore(scoreId: string) {
    try {
      const { error } = await supabase
        .from('game_sessions')
        .delete()
        .eq('session_id', scoreId)
      
      if (error) {
        console.error('删除游戏记录错误详情:', error)
        throw error
      }
      
      return { success: true }
    } catch (error: any) {
      console.error('删除游戏记录失败:', error)
      return { success: false, error: error.message }
    }
  },

  // 导出用户数据
  async exportUserData() {
    try {
      // 获取所有用户及其游戏统计数据
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (usersError) throw usersError
      
      // 为每个用户添加游戏统计
      const enrichedUsers = await Promise.all(
        users.map(async (user) => {
          // 获取用户游戏记录
          const { data: sessions } = await supabase
            .from('game_sessions')
            .select('score, level, level_id')
            .eq('user_id', user.user_id)
          
          // 获取用户关卡进度
          const { data: progress } = await supabase
            .from('user_level_progress')
            .select('level_id, stars_earned')
            .eq('user_id', user.user_id)
          
          return {
            ...user,
            total_score: sessions?.reduce((sum, s) => sum + (s.score || 0), 0) || 0,
            max_level: Math.max(...sessions?.map(s => s.level || s.level_id || 0), 0) || 0,
            games_played: sessions?.length || 0,
            levels_completed: progress?.length || 0,
            total_stars: progress?.reduce((sum, p) => sum + (p.stars_earned || 0), 0) || 0
          }
        })
      )
      
      return { success: true, data: enrichedUsers }
    } catch (error: any) {
      console.error('导出用户数据失败:', error)
      return { success: false, error: error.message }
    }
  },

  // 实时数据订阅
  subscribeToDataUpdates(callback: (event: string, data: any) => void) {
    console.log('正在设置实时数据订阅...')
    
    // 订阅用户表变化
    const userSubscription = supabase
      .channel('admin-users')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('用户表变化:', payload)
          callback('users', payload)
        }
      )
      .subscribe((status) => {
        console.log('用户表订阅状态:', status)
        if (status === 'SUBSCRIBED') {
          console.log('用户表订阅成功')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('用户表订阅失败，将尝试重新连接')
          setTimeout(() => {
            // 可以在这里添加重新连接逻辑
          }, 5000)
        }
      })
    
    // 订阅游戏会话表变化
    const sessionSubscription = supabase
      .channel('admin-sessions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'game_sessions' },
        (payload) => {
          console.log('游戏会话表变化:', payload)
          callback('game_sessions', payload)
        }
      )
      .subscribe((status) => {
        console.log('游戏会话表订阅状态:', status)
        if (status === 'SUBSCRIBED') {
          console.log('游戏会话表订阅成功')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('游戏会话表订阅失败，将尝试重新连接')
          setTimeout(() => {
            // 可以在这里添加重新连接逻辑
          }, 5000)
        }
      })
    
    // 订阅排行榜表变化
    const leaderboardSubscription = supabase
      .channel('admin-leaderboards')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leaderboards' },
        (payload) => {
          console.log('排行榜表变化:', payload)
          callback('leaderboards', payload)
        }
      )
      .subscribe((status) => {
        console.log('排行榜表订阅状态:', status)
        if (status === 'SUBSCRIBED') {
          console.log('排行榜表订阅成功')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('排行榜表订阅失败，将尝试重新连接')
          setTimeout(() => {
            // 可以在这里添加重新连接逻辑
          }, 5000)
        }
      })
    
    return {
      unsubscribe: () => {
        console.log('正在取消所有实时数据订阅...')
        supabase.removeChannel(userSubscription)
        supabase.removeChannel(sessionSubscription)
        supabase.removeChannel(leaderboardSubscription)
      }
    }
  }
}