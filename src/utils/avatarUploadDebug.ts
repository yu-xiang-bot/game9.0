import { supabase } from '@/config/supabase'

// 头像上传调试工具
export const avatarUploadDebug = {
  // 测试Supabase连接
  async testSupabaseConnection() {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1)
      console.log('Supabase连接测试:', { data, error })
      return { success: !error, error }
    } catch (err) {
      console.error('Supabase连接失败:', err)
      return { success: false, error: err }
    }
  },

  // 测试存储桶访问权限
  async testBucketAccess() {
    try {
      // 列出存储桶
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
      console.log('存储桶列表:', { buckets, bucketError })
      
      // 检查user-avatars存储桶
      const userAvatarsBucket = buckets?.find(b => b.name === 'user-avatars')
      console.log('user-avatars存储桶:', userAvatarsBucket)
      
      return { 
        buckets, 
        bucketError, 
        hasUserAvatars: !!userAvatarsBucket 
      }
    } catch (err) {
      console.error('存储桶访问失败:', err)
      return { success: false, error: err }
    }
  },

  // 测试文件上传权限
  async testUploadPermission(userId: string) {
    try {
      const testFileName = `${userId}/test_${Date.now()}.txt`
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      
      console.log('测试上传权限:', { testFileName, userId })
      
      const { data, error } = await supabase.storage
        .from('user-avatars')
        .upload(testFileName, testFile, {
          cacheControl: '3600',
          upsert: true
        })
      
      console.log('上传权限测试结果:', { data, error })
      
      // 清理测试文件
      if (!error && data?.path) {
        await supabase.storage
          .from('user-avatars')
          .remove([data.path])
      }
      
      return { data, error }
    } catch (err) {
      console.error('上传权限测试失败:', err)
      return { success: false, error: err }
    }
  },

  // 获取当前用户认证状态
  async getCurrentAuthState() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()
      
      console.log('当前认证状态:', { user, session, error })
      
      return { 
        user, 
        session, 
        isAuthenticated: !!user,
        error 
      }
    } catch (err) {
      console.error('获取认证状态失败:', err)
      return { success: false, error: err }
    }
  },

  // 完整的调试检查
  async runFullDebugCheck(userId: string) {
    console.log('=== 开始头像上传调试检查 ===')
    
    const results = {
      connection: await this.testSupabaseConnection(),
      auth: await this.getCurrentAuthState(),
      bucket: await this.testBucketAccess(),
      uploadPermission: await this.testUploadPermission(userId)
    }
    
    console.log('调试检查结果:', results)
    
    // 分析问题
    const issues = []
    
    if (!results.connection.success) {
      issues.push('Supabase连接失败')
    }
    
    if (!results.auth.isAuthenticated) {
      issues.push('用户未认证或会话过期')
    }
    
    if (!results.bucket.hasUserAvatars) {
      issues.push('user-avatars存储桶不存在')
    }
    
    if (results.uploadPermission.error) {
      issues.push(`上传权限错误: ${results.uploadPermission.error.message}`)
    }
    
    console.log('发现的问题:', issues)
    
    return {
      results,
      issues,
      hasIssues: issues.length > 0
    }
  }
}

// 便捷的调试函数
export const debugAvatarUpload = (userId: string) => {
  avatarUploadDebug.runFullDebugCheck(userId)
}