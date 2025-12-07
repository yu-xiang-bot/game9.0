// 使用服务角色密钥上传（绕过RLS限制）
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, extname, basename } from 'path'

// 从环境变量获取配置，如果没有则使用默认值
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vcmrpbysnxzqhxjfvshf.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbXJwYnlzbnh6cWh4amZ2c2hmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk2NzcwNiwiZXhwIjoyMDc5NTQzNzA2fQ.xguaCBWLUtpu0Fd2dyftnAC6sV0TGehBkUKwBhBKgrQ'
const BUCKET_NAME = process.env.BUCKET_NAME || 'game-assets'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// 文件上传函数
async function uploadFile(filePath, bucketName, bucketPath, contentType) {
  try {
    const fileBuffer = readFileSync(filePath)
    
    console.log(`📤 ${basename(filePath)} -> ${bucketName}/${bucketPath}`)
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(bucketPath, fileBuffer, {
        contentType: contentType,
        upsert: true
      })
    
    if (error) {
      console.error(`  ❌ 失败: ${error.message}`)
      return false
    }
    
    // 获取公开URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(bucketPath)
    
    console.log(`  ✅ ${publicUrl}`)
    return true
  } catch (error) {
    console.error(`  ❌ 异常: ${error.message}`)
    return false
  }
}

// 上传目录
async function uploadDirectory(dirPath, bucketName, bucketPrefix = '') {
  try {
    const items = readdirSync(dirPath)
    let successCount = 0
    let totalCount = 0
    
    console.log(`\n📁 ${bucketName}${bucketPrefix ? '/' + bucketPrefix : ''}:`)
    
    for (const item of items) {
      const itemPath = join(dirPath, item)
      const stats = statSync(itemPath)
      
      if (stats.isFile()) {
        totalCount++
        const ext = extname(itemPath).toLowerCase()
        const bucketPath = bucketPrefix ? join(bucketPrefix, item) : item
        
        // 根据文件扩展名确定content type
        let contentType = 'application/octet-stream'
        if (ext === '.png') contentType = 'image/png'
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
        else if (ext === '.gif') contentType = 'image/gif'
        else if (ext === '.svg') contentType = 'image/svg+xml'
        else if (ext === '.mp3') contentType = 'audio/mpeg'
        else if (ext === '.wav') contentType = 'audio/wav'
        else if (ext === '.ogg') contentType = 'audio/ogg'
        
        const success = await uploadFile(itemPath, bucketName, bucketPath, contentType)
        if (success) successCount++
      } else if (stats.isDirectory()) {
        // 递归处理子目录
        const subResults = await uploadDirectory(
          itemPath, 
          bucketName, 
          join(bucketPrefix, item)
        )
        successCount += subResults.successCount
        totalCount += subResults.totalCount
      }
    }
    
    console.log(`📊 ${bucketName}${bucketPrefix ? '/' + bucketPrefix : ''}: ${successCount}/${totalCount} 个文件`)
    return { successCount, totalCount }
  } catch (error) {
    console.error(`❌ 处理目录 ${dirPath} 错误:`, error.message)
    return { successCount: 0, totalCount: 0 }
  }
}

// 主上传函数
async function uploadWithServiceKey() {
  console.log('🔑 使用服务角色密钥上传游戏资源...')
  console.log('🌐 URL:', SUPABASE_URL)
  console.log('📅 时间:', new Date().toLocaleString())
  console.log('')
  
  let totalSuccess = 0
  let totalFiles = 0
  
  try {
    // 先验证连接
    console.log('🔍 验证服务角色密钥权限...')
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ 服务角色密钥无效:', error.message)
      return
    } else {
      console.log('✅ 服务角色密钥验证成功')
      console.log('📋 现有存储桶:', buckets.map(b => b.name).join(', '))
    }
    
    console.log('')
    
    // 检查并创建目标存储桶（如果不存在）
    const bucketExists = buckets.some(b => b.name === BUCKET_NAME)
    if (!bucketExists) {
      console.log(`🪣 创建存储桶 ${BUCKET_NAME}...`)
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 52428800 // 50MB
      })
      
      if (createError) {
        console.error(`❌ 创建存储桶失败: ${createError.message}`)
        return
      } else {
        console.log(`✅ 存储桶 ${BUCKET_NAME} 创建成功`)
      }
    }
    
    // 上传构建后的文件（dist目录）
    const distDir = join(process.cwd(), 'dist')
    if (existsSync(distDir) && statSync(distDir).isDirectory()) {
      console.log(`📦 上传构建后的游戏文件到 ${BUCKET_NAME} 桶...`)
      const result = await uploadDirectory(distDir, BUCKET_NAME)
      totalSuccess += result.successCount
      totalFiles += result.totalCount
    }
    
    // 如果没有dist目录，则上传public目录的资源
    const publicDir = join(process.cwd(), 'public')
    if (!existsSync(distDir) && existsSync(publicDir) && statSync(publicDir).isDirectory()) {
      console.log(`📦 上传游戏资源到 ${BUCKET_NAME} 桶...`)
      const result = await uploadDirectory(publicDir, BUCKET_NAME)
      totalSuccess += result.successCount
      totalFiles += result.totalCount
    }
    
    // 总体统计
    console.log('\n' + '='.repeat(60))
    console.log('📋 上传统计')
    console.log('='.repeat(60))
    console.log(`📁 总文件数: ${totalFiles}`)
    console.log(`✅ 成功上传: ${totalSuccess}`)
    console.log(`❌ 失败: ${totalFiles - totalSuccess}`)
    console.log(`📈 成功率: ${totalFiles > 0 ? ((totalSuccess / totalFiles) * 100).toFixed(2) : 0}%`)
    
    if (totalSuccess > 0) {
      console.log('\n🌐 游戏访问URL:')
      console.log(`🎮 游戏入口: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/index.html`)
      console.log('\n✨ 游戏部署完成！')
    }
    
  } catch (error) {
    console.error('❌ 上传过程发生严重错误:', error.message)
  }
}

// 执行上传
uploadWithServiceKey()