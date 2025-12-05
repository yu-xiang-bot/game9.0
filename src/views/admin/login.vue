<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-section">
        <h1>塔防联盟</h1>
        <p>后台管理系统</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        label-width="0"
        size="large"
      >
        <el-form-item prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="请输入邮箱"
            prefix-icon="Message"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            style="width: 100%"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>塔防联盟游戏管理系统</p>
        <p>Version 1.0.0</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { supabase } from '../../supabase.js'

const router = useRouter()
const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    
    loading.value = true
    
    // 使用 Supabase Auth 进行登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password
    })
    
    if (error) {
      let errorMessage = '登录失败'
      
      // 根据错误类型显示不同的提示
      switch (error.message) {
        case 'Invalid login credentials':
          errorMessage = '邮箱或密码错误'
          break
        case 'Email not confirmed':
          errorMessage = '邮箱尚未验证，请先验证邮箱'
          break
        default:
          errorMessage = `登录失败: ${error.message}`
      }
      
      ElMessage.error(errorMessage)
      return
    }
    
    ElMessage.success('登录成功')
    
    // 跳转到管理首页
    router.push('/admin/dashboard')
    
  } catch (error) {
    console.error('登录过程出错:', error)
    ElMessage.error('登录过程出错，请重试')
  } finally {
    loading.value = false
  }
}

// 检查是否已登录
const checkLoginStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // 如果已经登录，直接跳转到管理首页
      router.push('/admin/dashboard')
    }
  } catch (error) {
    console.error('检查登录状态失败:', error)
  }
}

onMounted(() => {
  checkLoginStatus()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo-section h1 {
  margin: 0;
  color: #303133;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.logo-section p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.login-form {
  margin-bottom: 30px;
}

.login-footer {
  text-align: center;
  color: #909399;
  font-size: 12px;
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
  margin-top: 30px;
}

.login-footer p {
  margin: 4px 0;
}

.el-form-item {
  margin-bottom: 24px;
}

.el-button {
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
}
</style>