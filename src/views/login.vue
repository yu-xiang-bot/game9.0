<template>
  <div class="login-container">
    <div class="login-card">
      <div class="game-info">
        <h1>欢迎来到塔防联盟</h1>
        <p>加入我们的社区，探索数百款精彩关卡，挑战全球玩家，赢取丰厚奖励！</p>
      </div>
      
      <div class="auth-container">
        <!-- 登录表单 -->
        <div class="form-container" :class="{ 'hidden': isRegisterMode }">
          <div class="tabs">
            <div class="tab active" @click="switchMode('login')">登录</div>
            <div class="tab" @click="switchMode('register')">注册</div>
          </div>
          
          <h2>欢迎回来</h2>
          <p class="login-hint">请输入邮箱登录</p>
          
          <el-form @submit.prevent="handleLogin" :model="loginForm" :rules="loginRules" ref="loginFormRef">
            <el-form-item prop="email">
              <div class="input-group">
                <i class="fas fa-user"></i>
                <el-input 
                  v-model="loginForm.email" 
                  placeholder="邮箱"
                  type="email"
                  size="large"
                  clearable
                />
              </div>
            </el-form-item>
            
            <el-form-item prop="password">
              <div class="input-group">
                <i class="fas fa-lock"></i>
                <el-input 
                  v-model="loginForm.password" 
                  type="password" 
                  placeholder="密码"
                  size="large"
                  show-password
                  clearable
                />
              </div>
            </el-form-item>
            
            <el-button 
              type="primary" 
              size="large" 
              :loading="loading"
              @click="handleLogin"
              class="login-btn"
            >
              登录
            </el-button>
          </el-form>
          
          <div class="switch-form">
            还没有账号? 
            <el-link type="primary" @click="switchMode('register')">立即注册</el-link>
          </div>
        </div>
        
        <!-- 注册表单 -->
        <div class="form-container" :class="{ 'hidden': !isRegisterMode }">
          <div class="tabs">
            <div class="tab" @click="switchMode('login')">登录</div>
            <div class="tab active" @click="switchMode('register')">注册</div>
          </div>
          
          <h2>创建新账号</h2>
          
          <el-form @submit.prevent="handleRegister" :model="registerForm" :rules="registerRules" ref="registerFormRef">
            <el-form-item prop="email">
              <div class="input-group">
                <i class="fas fa-envelope"></i>
                <el-input 
                  v-model="registerForm.email" 
                  placeholder="电子邮箱"
                  size="large"
                  clearable
                />
              </div>
            </el-form-item>
            
            <el-form-item prop="password">
              <div class="input-group">
                <i class="fas fa-lock"></i>
                <el-input 
                  v-model="registerForm.password" 
                  type="password" 
                  placeholder="密码"
                  size="large"
                  show-password
                  clearable
                />
              </div>
            </el-form-item>
            
            <el-form-item prop="confirmPassword">
              <div class="input-group">
                <i class="fas fa-lock"></i>
                <el-input 
                  v-model="registerForm.confirmPassword" 
                  type="password" 
                  placeholder="确认密码"
                  size="large"
                  show-password
                  clearable
                />
              </div>
            </el-form-item>
            
            <el-button 
              type="primary" 
              size="large"
              :loading="loading"
              @click="handleRegister"
              class="register-btn"
            >
              注册账号
            </el-button>
          </el-form>
          
          <div class="switch-form">
            已有账号? 
            <el-link type="primary" @click="switchMode('login')">立即登录</el-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserInfoStore } from '../stores/userInfo'

const router = useRouter()
const userInfoStore = useUserInfoStore()

// 表单状态
const isRegisterMode = ref(false)
const loading = ref(false)
const loginFormRef = ref()
const registerFormRef = ref()

// 登录表单数据
const loginForm = reactive({
  email: '',
  password: ''
})

// 注册表单数据
const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

// 表单验证规则
const loginRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ]
}

const registerRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: Function) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 切换登录/注册模式
const switchMode = (mode: 'login' | 'register') => {
  isRegisterMode.value = mode === 'register'
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    const res = await userInfoStore.login(loginForm.email, loginForm.password)
    
    if (res.code === 200) {
      ElMessage.success('登录成功！')
      router.push('/')
    } else {
      ElMessage.error((res.data as any)?.message || '登录失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败，请重试')
  } finally {
    loading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    const res = await userInfoStore.register({
      email: registerForm.email,
      password: registerForm.password,
      displayName: registerForm.email.split('@')[0] // 使用邮箱前缀作为显示名称
    })
    
    if (res.code === 200) {
      ElMessage.success('注册成功！')
      // 自动切换到登录模式
      setTimeout(() => {
        switchMode('login')
        loginForm.email = registerForm.email
        // 清空注册表单
        Object.assign(registerForm, {
          email: '',
          password: '',
          confirmPassword: ''
        })
      }, 1500)
    } else {
      ElMessage.error((res.data as any)?.message || '注册失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '注册失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-card {
  display: flex;
  max-width: 800px;
  width: 100%;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.game-info {
  flex: 1;
  background: linear-gradient(
    rgba(106, 17, 203, 0.8), 
    rgba(37, 117, 252, 0.8)
  );
  color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 20px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  p {
    font-size: 1.1rem;
    line-height: 1.6;
  }
}

.auth-container {
  flex: 1;
  padding: 40px;
  
  .form-container {
    transition: all 0.3s ease;
    
    &.hidden {
      display: none;
    }
  }
  
  .tabs {
    display: flex;
    margin-bottom: 30px;
    border-bottom: 2px solid #eee;
    
    .tab {
      padding: 12px 25px;
      cursor: pointer;
      font-weight: 600;
      color: #777;
      transition: all 0.3s;
      
      &.active {
        color: #2575fc;
        border-bottom: 3px solid #2575fc;
        margin-bottom: -2px;
      }
    }
  }
  
  h2 {
    color: #333;
    margin-bottom: 15px;
    font-size: 1.5rem;
  }
  
  .login-hint {
    color: #666;
    font-size: 14px;
    margin-bottom: 25px;
  }
  
  .input-group {
    position: relative;
    
    i {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #777;
      z-index: 1;
    }
    
    :deep(.el-input__inner) {
      padding-left: 45px;
    }
  }
  
  .login-btn, .register-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(to right, #6a11cb, #2575fc);
    border: none;
    
    &:hover {
      opacity: 0.9;
    }
  }
  
  .switch-form {
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    color: #666;
  }
}

@media (max-width: 768px) {
  .login-card {
    flex-direction: column;
  }
  
  .game-info {
    padding: 30px 20px;
    
    h1 {
      font-size: 1.5rem;
    }
  }
  
  .auth-container {
    padding: 30px 20px;
  }
}
</style>