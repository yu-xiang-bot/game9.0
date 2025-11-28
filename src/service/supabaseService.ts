import { supabase, Database } from '@/config/supabase'
import type { UserInfo } from '@/stores/userInfo'

// 用户相关服务
export const userService = {
  // 用户登录
  async login(username: string, password: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single()
      
      if (error) throw error
      
      if (data) {
        return {
          code: 200,
          data: {
            id: data.id,
            name: data.username,
            phone: data.phone || '',
            avatar: data.avatar || '',
            isBan: 0,
            gameToken: 'supabase_token_' + data.id
          } as UserInfo
        }
      } else {
        return {
          code: -1,
          data: { message: '用户名或密码错误' } as any
        }
      }
    } catch (error: any) {
      console.error('登录错误:', error)
      return {
        code: -1,
        data: { message: '登录失败: ' + error.message } as any
      }
    }
  },

  // 用户注册
  async register(username: string, password: string) {
    try {
      // 检查用户名是否已存在
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single()
      
      if (existingUser) {
        return {
          code: -1,
          data: { message: '用户名已存在' } as any
        }
      }
      
      // 创建新用户
      const { data, error } = await supabase
        .from('users')
        .insert({
          username,
          password,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      
      return {
        code: 200,
        data: {
          id: data.id,
          name: data.username,
          phone: data.phone || '',
          avatar: data.avatar || '',
          isBan: 0,
          gameToken: 'supabase_token_' + data.id
        } as UserInfo
      }
    } catch (error: any) {
      console.error('注册错误:', error)
      return {
        code: -1,
        data: { message: '注册失败: ' + error.message } as any
      }
    }
  },

  // 修改用户信息
  async editUser(userId: string, updates: Partial<{ username: string; phone: string; avatar: string }>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      
      return {
        code: 200,
        data: {
          id: data.id,
          name: data.username,
          phone: data.phone || '',
          avatar: data.avatar || '',
          isBan: 0,
          gameToken: 'supabase_token_' + data.id
        } as UserInfo
      }
    } catch (error: any) {
      console.error('修改用户信息错误:', error)
      return {
        code: -1,
        data: { message: '修改失败: ' + error.message } as any
      }
    }
  },

  // 修改密码
  async editPassword(userId: string, oldPassword: string, newPassword: string) {
    try {
      // 先验证旧密码
      const { data: userData } = await supabase
        .from('users')
        .select('password')
        .eq('id', userId)
        .single()
      
      if (!userData || userData.password !== oldPassword) {
        return {
          code: -1,
          data: { message: '旧密码错误' } as any
        }
      }
      
      // 更新密码
      const { error } = await supabase
        .from('users')
        .update({
          password: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      if (error) throw error
      
      return {
        code: 200,
        data: { message: '密码修改成功' }
      }
    } catch (error: any) {
      console.error('修改密码错误:', error)
      return {
        code: -1,
        data: { message: '修改密码失败: ' + error.message } as any
      }
    }
  }
}

// 游戏分数相关服务
export const gameScoreService = {
  // 获取排行榜
  async getRankList() {
    try {
      const { data, error } = await supabase
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
      
      if (error) throw error
      
      // 处理数据格式以匹配现有接口
      const formattedData = data?.map(item => {
        return {
          id: item.user_id,
          name: (item.users as any)?.username || '未知用户',
          avatar: (item.users as any)?.avatar || '',
          score: item.score,
          level: item.level,
          max: {
            score: item.score,
            level: item.level
          }
        }
      })
      
      return {
        code: 200,
        data: formattedData || []
      }
    } catch (error: any) {
      console.error('获取排行榜错误:', error)
      return {
        code: -1,
        data: { message: '获取排行榜失败: ' + error.message } as any
      }
    }
  },

  // 上传游戏分数
  async updateScore(userId: string, level: number, score: number) {
    try {
      // 检查当前用户是否已有该关卡或更高分数的记录
      const { data: existingRecord } = await supabase
        .from('game_scores')
        .select('id, score')
        .eq('user_id', userId)
        .eq('level', level)
        .gte('score', score)
        .single()
      
      if (existingRecord) {
        return {
          code: 200,
          data: {
            isUpdate: false,
            score: existingRecord.score
          }
        }
      }
      
      // 如果没有更高分数的记录，则插入或更新记录
      const { data, error } = await supabase
        .from('game_scores')
        .upsert({
          user_id: userId,
          level,
          score,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,level'
        })
        .select()
        .single()
      
      if (error) throw error
      
      return {
        code: 200,
        data: {
          isUpdate: true,
          score: data.score
        }
      }
    } catch (error: any) {
      console.error('上传分数错误:', error)
      return {
        code: -1,
        data: { message: '上传分数失败: ' + error.message } as any
      }
    }
  }
}