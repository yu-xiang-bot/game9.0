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
      
      if (error) throw error
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
        .from('game_scores')
        .select(`
          *,
          users(username)
        `)
        .order('score', { ascending: false })
      
      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error: any) {
      console.error('获取分数列表失败:', error)
      return { success: false, error: error.message }
    }
  },

  // 获取用户详细信息
  async getUserDetails(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      
      // 获取用户的所有游戏记录
      const { data: scores, error: scoresError } = await supabase
        .from('game_scores')
        .select('*')
        .eq('user_id', userId)
        .order('level', { ascending: true })
      
      if (scoresError) throw scoresError
      
      return { 
        success: true, 
        data: {
          ...data,
          scores: scores || []
        }
      }
    } catch (error: any) {
      console.error('获取用户详情失败:', error)
      return { success: false, error: error.message }
    }
  },

  // 删除用户
  async deleteUser(userId: string) {
    try {
      // 先删除用户的所有游戏记录
      const { error: scoresError } = await supabase
        .from('game_scores')
        .delete()
        .eq('user_id', userId)
      
      if (scoresError) throw scoresError
      
      // 再删除用户
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)
      
      if (userError) throw userError
      
      return { success: true }
    } catch (error: any) {
      console.error('删除用户失败:', error)
      return { success: false, error: error.message }
    }
  },

  // 删除游戏记录
  async deleteScore(scoreId: string) {
    try {
      const { error } = await supabase
        .from('game_scores')
        .delete()
        .eq('id', scoreId)
      
      if (error) throw error
      
      return { success: true }
    } catch (error: any) {
      console.error('删除游戏记录失败:', error)
      return { success: false, error: error.message }
    }
  },

  // 获取统计数据
  async getStats() {
    try {
      // 获取用户总数
      const { count: totalUsers, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
      
      if (usersError) throw usersError
      
      // 获取分数记录总数
      const { count: totalScores, error: scoresError } = await supabase
        .from('game_scores')
        .select('*', { count: 'exact', head: true })
      
      if (scoresError) throw scoresError
      
      // 获取最高分
      const { data: maxScoreData, error: maxScoreError } = await supabase
        .from('game_scores')
        .select('score')
        .order('score', { ascending: false })
        .limit(1)
        .single()
      
      if (maxScoreError && maxScoreError.code !== 'PGRST116') { // PGRST116 是没有结果的错误
        throw maxScoreError
      }
      
      // 获取最近7天的活跃用户数
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { data: activeScores, error: activeError } = await supabase
        .from('game_scores')
        .select('user_id')
        .gte('created_at', sevenDaysAgo.toISOString())
      
      if (activeError) throw activeError
      
      const activeUserIds = new Set(activeScores?.map(s => s.user_id))
      
      return {
        success: true,
        data: {
          totalUsers: totalUsers || 0,
          totalScores: totalScores || 0,
          highestScore: maxScoreData?.score || 0,
          activeUsers: activeUserIds.size
        }
      }
    } catch (error: any) {
      console.error('获取统计数据失败:', error)
      return { success: false, error: error.message }
    }
  },

  // 批量导出用户数据
  async exportUserData() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // 获取每个用户的游戏记录统计
      const usersWithStats = await Promise.all(
        (data || []).map(async (user) => {
          const { data: scores } = await supabase
            .from('game_scores')
            .select('score, level')
            .eq('user_id', user.id)
          
          const totalScore = scores?.reduce((sum, s) => sum + s.score, 0) || 0
          const maxLevel = scores?.reduce((max, s) => Math.max(max, s.level), 0) || 0
          
          return {
            ...user,
            total_score: totalScore,
            max_level: maxLevel,
            games_played: scores?.length || 0
          }
        })
      )
      
      return { success: true, data: usersWithStats }
    } catch (error: any) {
      console.error('导出用户数据失败:', error)
      return { success: false, error: error.message }
    }
  }
}