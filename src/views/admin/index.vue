<template>
  <div class="admin-view">
    <el-dialog v-model="showLoginDialog" title="管理员登录" width="400px" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
      <el-form @submit.prevent="handleLogin">
        <el-form-item label="管理员密码">
          <el-input
            v-model="password"
            type="password"
            placeholder="请输入管理员密码"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div style="text-align: center; margin-top: 10px; color: #666; font-size: 12px;">
        提示：默认密码为 admin123456
      </div>
    </el-dialog>
    
    <AdminDashboard v-if="isAuthenticated" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import AdminDashboard from '@/components/AdminDashboard.vue'
import { adminAuth } from '@/utils/adminAuth'

const isAuthenticated = ref(false)
const showLoginDialog = ref(false)
const password = ref('')

const handleLogin = () => {
  if (!password.value.trim()) {
    ElMessage.warning('请输入密码')
    return
  }
  
  if (adminAuth.login(password.value)) {
    isAuthenticated.value = true
    showLoginDialog.value = false
    ElMessage.success('登录成功')
  } else {
    ElMessage.error('密码错误')
  }
}

onMounted(() => {
  if (adminAuth.isAuthenticated()) {
    isAuthenticated.value = true
  } else {
    showLoginDialog.value = true
  }
})
</script>

<style scoped>
.admin-view {
  width: 100%;
  height: 100vh;
  overflow: auto;
}
</style>