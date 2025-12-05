<template>
  <div class="admin-login">
    <div class="login-card">
      <div class="login-header">
        <h1>🏰 塔防联盟</h1>
        <p>后台管理系统</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>邮箱</label>
          <input
            v-model="loginForm.email"
            type="email"
            placeholder="请输入邮箱"
            required
          />
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>
        
        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div class="login-footer">
        <button type="button" @click="goBackToGame" class="back-btn">
          ← 返回游戏
        </button>
        <p>Version 1.0.0</p>
        <p>塔防联盟游戏管理平台</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../../supabase.js'

const loginForm = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginForm.value.email,
      password: loginForm.value.password
    })
    
    if (authError) {
      throw authError
    }
    
    // 登录成功，跳转到管理页面
    window.location.href = '/admin'
  } catch (err) {
    error.value = '登录失败，请检查邮箱和密码'
    console.error('登录错误:', err)
  } finally {
    loading.value = false
  }
}

// 返回游戏主页面
const goBackToGame = () => {
  window.location.href = '/'
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  background: linear-gradient(135deg, #64b5f6 0%, #2196f3 50%, #1976d2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(33, 150, 243, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
  color: #1976d2;
  font-weight: bold;
}

.login-header p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.login-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e3f2fd;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(33, 150, 243, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #ffebee;
  color: #f44336;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
}

.login-footer {
  text-align: center;
  color: #999;
  font-size: 12px;
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.back-btn {
  width: 100%;
  padding: 10px;
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 15px;
}

.back-btn:hover {
  background: #e0e0e0;
  border-color: #bdbdbd;
}

.login-footer p {
  margin: 5px 0;
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
    margin: 0 10px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
  
  .form-group input {
    padding: 10px 12px;
  }
  
  .login-btn {
    padding: 12px;
  }
}
</style>