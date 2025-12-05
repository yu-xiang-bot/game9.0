import { supabase } from '@/config/supabase'
import type { UserInfo } from '@/stores/userInfo'

// 塔防游戏相关服务 - 使用Supabase数据库
export const towerDefenseService = {
  // 使用 Supabase Auth 进行用户登录
  async loginUser(email: string, password: string) {
    try {
      // 使用 Supabase Auth 进行登录验证
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })
      
      if (error) {
        console.error('Supabase Auth 登录失败:', error)
        return { 
          code: -1, 
          data: { message: this.formatAuthError(error.message) } 
        }
      }
      
      if (!data.user || !data.session) {
        return { 
          code: -1, 
          data: { message: '登录失败，请重试' } 
        }
      }
      
      // 登录成功后，获取或创建用户游戏数据
      await this.syncUserGameData(data.user)
      
      // 返回用户信息
      return {
        code: 200,
        data: this.formatUserInfoFromAuth(data.user)
      }
      
    } catch (error: any) {
      console.error('登录失败:', error)
      return { 
        code: -1, 
        data: { message: '登录失败: ' + error.message } 
      }
    }
  },

  // 使用 Supabase Auth 进行用户注册
  async registerUser(email: string, password: string, displayName?: string) {
    try {
      // 使用 Supabase Auth 进行注册
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
            username: email.split('@')[0]
          }
        }
      })
      
      if (error) {
        console.error('Supabase Auth 注册失败:', error)
        return { 
          code: -1, 
          data: { message: this.formatAuthError(error.message) } 
        }
      }
      
      if (!data.user) {
        return { 
          code: -1, 
          data: { message: '注册失败，请重试' } 
        }
      }
      
      // 创建用户游戏数据
      await this.createUserGameData(data.user, displayName)
      
      // 返回用户信息
      return {
        code: 200,
        data: this.formatUserInfoFromAuth(data.user)
      }
      
    } catch (error: any) {
      console.error('注册失败:', error)
      return { 
        code: -1, 
        data: { message: '注册失败: ' + error.message } 
      }
    }
  },

  // 同步用户游戏数据
  async syncUserGameData(authUser: any) {
    try {
      // 检查用户游戏数据是否存在
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', authUser.id)
        .single()
      
      if (userError && userError.code !== 'PGRST116') {
        console.error('查询用户数据失败:', userError)
        return
      }
      
      // 如果用户游戏数据不存在，创建新数据
      if (!userData) {
        await this.createUserGameData(authUser, authUser.user_metadata?.display_name)
      } else {
        // 更新最后登录时间
        await supabase
          .from('users')
          .update({ 
            last_login: new Date().toISOString(),
            email: authUser.email
          })
          .eq('user_id', authUser.id)
      }
    } catch (error) {
      console.error('同步用户数据失败:', error)
    }
  },

  // 创建用户游戏数据
  async createUserGameData(authUser: any, displayName?: string) {
    try {
      const userData = {
        user_id: authUser.id,
        username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'player',
        email: authUser.email,
        display_name: displayName || authUser.user_metadata?.display_name || authUser.email?.split('@')[0],
        registration_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('users')
        .insert(userData)
      
      if (error) {
        console.error('创建用户游戏数据失败:', error)
      }
    } catch (error) {
      console.error('创建用户游戏数据异常:', error)
    }
  },

  // 格式化认证错误信息
  formatAuthError(errorMessage: string): string {
    const errorMap: { [key: string]: string } = {
      'Invalid login credentials': '用户名或密码错误',
      'Email not confirmed': '请先验证邮箱',
      'User already registered': '用户已存在',
      'Password should be at least 6 characters': '密码至少需要6位',
      'Unable to validate email address: invalid format': '邮箱格式不正确',
      'signup_disabled': '注册功能已禁用',
      'email_address_invalid': '邮箱地址无效'
    }
    
    return errorMap[errorMessage] || errorMessage
  },

  // 从 Supabase Auth 用户数据格式化为 UserInfo
  formatUserInfoFromAuth(authUser: any): UserInfo {
    return {
      id: authUser.id,
      name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || '玩家',
      email: authUser.email || '',
      avatar: authUser.user_metadata?.avatar_url || '',
      avatar_url: authUser.user_metadata?.avatar_url || '',
      phone: authUser.phone || undefined,
      gender: authUser.user_metadata?.gender || undefined,
      bio: authUser.user_metadata?.bio || undefined,
      playerLevel: 1,
      totalScore: 0,
      coins: 1000,
      gems: 100,
      experiencePoints: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      totalEnemiesKilled: 0,
      totalTowersBuilt: 0,
      bestCombo: 0,
      playTimeTotal: 0
    }
  },

  // 检查认证状态
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('获取用户认证状态失败:', error)
        return null
      }
      
      return user
    } catch (error) {
      console.error('获取用户认证状态异常:', error)
      return null
    }
  },

  // 退出登录
  async logout() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('退出登录失败:', error)
        return { code: -1, data: { message: '退出失败' } }
      }
      
      return { code: 200, data: { message: '退出成功' } }
    } catch (error: any) {
      console.error('退出登录异常:', error)
      return { code: -1, data: { message: '退出失败' } }
    }
  },

  // 用户相关操作
  async updateUserProfile(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) throw error
      
      return {
        code: 200,
        data: this.formatUserInfo(data)
      }
    } catch (error: any) {
      console.error('更新用户资料错误:', error)
      return {
        code: -1,
        data: { message: '更新失败: ' + error.message }
      }
    }
  },

  // 上传头像到Supabase Storage
  async uploadAvatar(userId: string, file: File) {
    try {
      console.log('开始上传头像:', { userId, fileName: file.name, fileSize: file.size })
      
      // 检查用户认证状态
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('用户未认证:', authError)
        throw new Error('用户未认证，请先登录')
      }
      
      // 生成唯一的文件名
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`
      
      console.log('准备上传文件:', { fileName, bucket: 'user-avatars' })
      
      // 上传文件到Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (uploadError) {
        console.error('文件上传失败:', uploadError)
        
        // 提供更详细的错误信息
        if (uploadError.message.includes('bucket not found')) {
          throw new Error('存储桶 "user-avatars" 不存在，请在Supabase控制台创建')
        } else if (uploadError.message.includes('permission')) {
          throw new Error('没有上传权限，请检查存储桶策略配置')
        } else if (uploadError.message.includes('duplicate')) {
          throw new Error('文件已存在，但无法覆盖')
        } else {
          throw new Error(`上传失败: ${uploadError.message}`)
        }
      }
      
      console.log('文件上传成功:', uploadData)
      
      // 获取公开URL
      const { data: urlData } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(fileName)
      
      if (!urlData?.publicUrl) {
        throw new Error('无法获取文件公开URL')
      }
      
      console.log('获取公开URL成功:', urlData.publicUrl)
      
      // 更新用户头像URL到数据库
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
      
      if (updateError) {
        console.error('数据库更新失败:', updateError)
        throw new Error(`数据库更新失败: ${updateError.message}`)
      }
      
      console.log('数据库更新成功')
      
      return {
        code: 200,
        data: {
          url: urlData.publicUrl,
          fileName: fileName
        }
      }
    } catch (error: any) {
      console.error('上传头像错误:', error)
      return {
        code: -1,
        data: { 
          message: error.message || '头像上传失败',
          details: error
        }
      }
    }
  },

  // 工具函数：格式化用户信息
  formatUserInfo(data: any): UserInfo {
    return {
      id: data.user_id || data.id || '',
      name: data.display_name || data.username || '',
      avatar: data.avatar_url || '',
      avatar_url: data.avatar_url || '',
      phone: data.phone || undefined,
      email: data.email || '',
      gender: data.gender || undefined,
      bio: data.bio || undefined,
      isBan: data.isBan || undefined,
      gameToken: data.gameToken || undefined,
      playerLevel: data.player_level || 1,
      totalScore: data.total_score || 0,
      coins: data.coins || 1000,
      gems: data.gems || 100,
      experiencePoints: data.experience_points || 0,
      gamesPlayed: data.games_played || 0,
      gamesWon: data.games_won || 0,
      totalEnemiesKilled: data.total_enemies_killed || 0,
      totalTowersBuilt: data.total_towers_built || 0,
      bestCombo: data.best_combo || 0,
      playTimeTotal: data.play_time_total || 0
    }
  }
}