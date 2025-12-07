import { supabase } from '@/config/supabase'

// 头像上传测试工具
export const testAvatarUpload = async (userId: string) => {
  console.log('=== 开始头像上传功能测试 ===')
  
  // 1. 检查Supabase连接
  console.log('1. 检查Supabase连接...')
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      console.error('❌ Supabase连接失败:', error)
      return false
    }
    console.log('✅ Supabase连接正常')
  } catch (err) {
    console.error('❌ 连接错误:', err)
    return false
  }

  // 2. 检查用户认证状态
  console.log('2. 检查用户认证状态...')
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      console.error('❌ 用户未认证:', error)
      return false
    }
    console.log('✅ 用户认证正常:', user.id)
  } catch (err) {
    console.error('❌ 认证检查失败:', err)
    return false
  }

  // 3. 检查存储桶
  console.log('3. 检查存储桶...')
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) {
      console.error('❌ 获取存储桶列表失败:', error)
      return false
    }
    
    const userAvatarsBucket = buckets.find(b => b.name === 'user-avatars')
    if (!userAvatarsBucket) {
      console.error('❌ user-avatars 存储桶不存在')
      return false
    }
    console.log('✅ user-avatars 存储桶存在')
  } catch (err) {
    console.error('❌ 存储桶检查失败:', err)
    return false
  }

  // 4. 测试文件上传
  console.log('4. 测试文件上传...')
  try {
    const testFileName = `${userId}/test_${Date.now()}.txt`
    const testContent = 'test content'
    
    const { data, error } = await supabase.storage
      .from('user-avatars')
      .upload(testFileName, new Blob([testContent]), {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) {
      console.error('❌ 文件上传测试失败:', error)
      return false
    }
    
    console.log('✅ 文件上传测试成功:', data.path)
    
    // 获取公开URL
    const { data: urlData } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(data.path)
    
    console.log('✅ 公开URL获取成功:', urlData.publicUrl)
    
    // 清理测试文件
    await supabase.storage
      .from('user-avatars')
      .remove([data.path])
    
    console.log('✅ 测试文件已清理')
  } catch (err) {
    console.error('❌ 上传测试失败:', err)
    return false
  }

  console.log('🎉 所有测试通过，头像上传功能应该可以正常工作！')
  return true
}

// 简化的测试函数
export const quickTest = async () => {
  // 从store获取用户ID
  const { useUserInfoStore } = await import('@/stores/userInfo')
  const userInfoStore = useUserInfoStore()
  
  if (!userInfoStore.userInfo?.id) {
    console.error('用户ID不存在，请先登录')
    return false
  }
  
  return await testAvatarUpload(userInfoStore.userInfo.id)
}

// 在开发环境中暴露到全局
if (import.meta.env.DEV) {
  (window as any).testAvatarUpload = testAvatarUpload
  Promise.resolve().then(() => {
    (window as any).quickTestAvatarUpload = quickTest
  })
  console.log('🔧 头像上传测试工具已加载')
  console.log('使用 testAvatarUpload(userId) 或 quickTestAvatarUpload() 进行测试')
}