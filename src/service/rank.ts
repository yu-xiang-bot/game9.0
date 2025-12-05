import { supabase } from '@/config/supabase'

export type GameIdType = '101'

export type RankScore = {
  /** key: 游戏id value: 游戏得分 */
  [key in GameIdType]: number;
}

export type RankItem = {
  /** 用户id */
  id: string
  /** 用户头像 */
  avatar: string
  /** 用户名 */
  name: string
  /** 所有关卡得分数组 */
  scoreList?: number[]
  /** 所有关卡中的最大得分以及对应的等级 */
  max: {
    score: number
    level: number
  }
} & RankScore

export const getRankListApi = async () => {
  try {
    const { data, error } = await supabase
      .from('leaderboards')
      .select(`
        *,
        users(username, avatar_url, display_name)
      `)
      .order('score', { ascending: false })
      .limit(100)
    
    if (error) throw error
    
    // 格式化数据
    const formattedData = data?.map((item: any) => ({
      id: item.user_id,
      avatar: item.users?.avatar_url || '',
      name: item.users?.display_name || item.users?.username || 'Unknown',
      max: {
        score: item.score,
        level: parseInt(item.level_id) || 1
      },
      '101': item.score
    })) || []
    
    return { code: 200, data: formattedData }
  } catch (error: any) {
    console.error('获取排行榜错误:', error)
    return { code: -1, data: [] }
  }
}

export type UpdateScoreParasm = {
  /** 选择的关卡 */
  level: number
  /** 得分 */
  score: number
  userId: string
}

export type UpdateScoreRes = {
  /** 得分是否有更新 */
  isUpdate: boolean
  /** 上传的成绩 */
  score: number
}

/** 上传得分 */
export const updateScoreApi = async (params: UpdateScoreParasm) => {
  try {
    // 检查是否已有更高分
    const { data: existingScore, error: checkError } = await supabase
      .from('leaderboards')
      .select('score')
      .eq('user_id', params.userId)
      .eq('level_id', params.level.toString())
      .single()
    
    let shouldUpdate = true
    
    if (!checkError && existingScore && existingScore.score >= params.score) {
      shouldUpdate = false
    }
    
    if (shouldUpdate) {
      // 更新或插入新分数
      const { error } = await supabase
        .from('leaderboards')
        .upsert({
          user_id: params.userId,
          level_id: params.level.toString(),
          score: params.score,
          submission_date: new Date().toISOString(),
          rank_position: 0 // 稍后通过触发器或其他方式更新
        }, {
          onConflict: 'user_id,level_id'
        })
      
      if (error) throw error
    }
    
    return { isUpdate: shouldUpdate, score: params.score }
  } catch (error: any) {
    console.error('更新分数错误:', error)
    return { isUpdate: false, score: params.score }
  }
}