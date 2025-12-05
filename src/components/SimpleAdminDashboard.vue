<template>
  <div class="simple-admin-dashboard">
    <!-- 简化的顶部栏 -->
    <header class="simple-header">
      <div class="header-left">
        <img src="/assets/legendTD/start.png" alt="Logo" class="header-logo">
        <h1>塔防联盟 - 后台管理</h1>
      </div>
      <div class="header-right">
        <button class="refresh-btn" @click="refreshData" :disabled="loading">
          {{ loading ? '加载中...' : '刷新' }}
        </button>
        <button class="logout-btn" @click="logout">退出</button>
      </div>
    </header>

    <!-- 简单的标签页导航 -->
    <div class="tab-navigation">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="setActiveTab(tab.id)"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 控制面板 -->
      <div v-if="activeTab === 'dashboard'" class="tab-content">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalScores }}</div>
            <div class="stat-label">游戏记录</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.activeUsers }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.highestScore }}</div>
            <div class="stat-label">最高分</div>
          </div>
        </div>

        <div class="data-sections">
          <div class="section">
            <h3>最近用户</h3>
            <div class="simple-table">
              <table>
                <thead>
                  <tr>
                    <th>用户名</th>
                    <th>注册时间</th>
                    <th>游戏次数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users.slice(0, 5)" :key="user.id">
                    <td>{{ user.username }}</td>
                    <td>{{ formatDate(user.created_at) }}</td>
                    <td>{{ user.games_played || 0 }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="section">
            <h3>高分榜</h3>
            <div class="simple-table">
              <table>
                <thead>
                  <tr>
                    <th>排名</th>
                    <th>用户</th>
                    <th>分数</th>
                    <th>关卡</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(score, index) in scores.slice(0, 5)" :key="score.id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ score.username || '未知' }}</td>
                    <td>{{ score.score }}</td>
                    <td>{{ score.level || 1 }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户管理 -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <div class="section-header">
          <h2>用户管理</h2>
          <div class="search-box">
            <input 
              type="text" 
              v-model="userSearch" 
              placeholder="搜索用户..."
              class="search-input"
            >
          </div>
        </div>
        <div class="simple-table">
          <table>
            <thead>
              <tr>
                <th>用户名</th>
                <th>邮箱</th>
                <th>注册时间</th>
                <th>游戏次数</th>
                <th>总分数</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>{{ user.username }}</td>
                <td>{{ user.email }}</td>
                <td>{{ formatDate(user.created_at) }}</td>
                <td>{{ user.games_played || 0 }}</td>
                <td>{{ user.total_score || 0 }}</td>
                <td>
                  <button class="action-btn" @click="viewUserDetails(user)">查看</button>
                  <button class="action-btn danger" @click="deleteUser(user.id)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      
    </div>

    <!-- 用户详情弹窗 -->
    <div v-if="userDialogVisible" class="modal-overlay" @click="closeUserDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>用户详情</h3>
          <button class="close-btn" @click="closeUserDialog">×</button>
        </div>
        <div class="modal-body" v-if="selectedUser">
          <div class="user-details">
            <div class="detail-row">
              <span class="label">用户名:</span>
              <span>{{ selectedUser.username }}</span>
            </div>
            <div class="detail-row">
              <span class="label">邮箱:</span>
              <span>{{ selectedUser.email }}</span>
            </div>
            <div class="detail-row">
              <span class="label">注册时间:</span>
              <span>{{ formatDate(selectedUser.created_at) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">游戏次数:</span>
              <span>{{ selectedUser.games_played || 0 }}</span>
            </div>
            <div class="detail-row">
              <span class="label">总分数:</span>
              <span>{{ selectedUser.total_score || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { adminService } from '@/service/adminService'
import { adminAuth } from '@/utils/adminAuth'

// 类型定义
interface User {
  id: string
  username: string
  email: string
  created_at: string
  games_played: number
  total_score: number
}

interface Score {
  id: string
  username: string
  score: number
  level: number
}

interface Stats {
  totalUsers: number
  totalScores: number
  activeUsers: number
  highestScore: number
}

// 响应式数据
const loading = ref(false)
const users = ref<User[]>([])
const scores = ref<Score[]>([])
const userSearch = ref('')
const userDialogVisible = ref(false)
const selectedUser = ref<User | null>(null)
const activeTab = ref('dashboard')
const stats = ref<Stats>({
  totalUsers: 0,
  totalScores: 0,
  activeUsers: 0,
  highestScore: 0
})

// 标签页配置
const tabs = [
  { id: 'dashboard', name: '数据总览' },
  { id: 'users', name: '用户管理' }
]

// 计算属性
const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  return users.value.filter(user => 
    user.username.toLowerCase().includes(userSearch.value.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(userSearch.value.toLowerCase()))
  )
})

// 方法
const setActiveTab = (tabId: string) => {
  activeTab.value = tabId
}

const fetchData = async () => {
  loading.value = true
  try {
    const usersResult = await adminService.getAllUsers()
    const scoresResult = await adminService.getAllScores()
    const statsResult = await adminService.getStats()
    
    if (usersResult.success) {
      users.value = usersResult.data || []
    }
    
    if (scoresResult.success) {
      scores.value = (scoresResult.data || []).map((item, index) => ({
        ...item,
        username: item.users?.username || '未知用户'
      }))
    }
    
    if (statsResult.success) {
      stats.value = statsResult.data
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchData()
}

const viewUserDetails = (user: User) => {
  selectedUser.value = user
  userDialogVisible.value = true
}

const closeUserDialog = () => {
  userDialogVisible.value = false
  selectedUser.value = null
}

const deleteUser = async (userId: string) => {
  if (!confirm('确定要删除该用户吗？')) return
  
  try {
    const result = await adminService.deleteUser(userId)
    if (result.success) {
      await fetchData() // 刷新数据
    }
  } catch (error) {
    console.error('删除用户失败:', error)
  }
}



const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}



const logout = () => {
  adminAuth.logout()
  // 刷新页面或跳转到登录页
  window.location.reload()
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.simple-admin-dashboard {
  font-family: 'Arial', sans-serif;
  background: radial-gradient(circle 800px at center, #c5f6f8 0%, #8ad8ea 47%, #4fb3d3 100%);
  min-height: 100vh;
  color: #333;
}

/* 顶部栏 */
.simple-header {
  background: linear-gradient(135deg, #4fb3d3 0%, #2980b9 100%);
  box-shadow: 0 2px 8px rgba(41, 128, 185, 0.3);
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-logo {
  width: 30px;
  height: 30px;
  margin-right: 10px;
}

.header-left h1 {
  margin: 0;
  font-size: 20px;
  color: white;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.refresh-btn, .logout-btn {
  padding: 8px 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.logout-btn {
  color: #ffcccc;
  border-color: rgba(255, 204, 204, 0.5);
}

.logout-btn:hover {
  background-color: rgba(231, 76, 60, 0.3);
}

.switch-btn {
  padding: 8px 15px;
  border: 1px solid #1abc9c;
  border-radius: 4px;
  background-color: #1abc9c;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.switch-btn:hover {
  background-color: #16a085;
}

.admin-info {
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-weight: bold;
  color: white;
}

/* 标签页导航 */
.tab-navigation {
  background-color: #fff;
  display: flex;
  border-bottom: 1px solid #ddd;
}

.tab-btn {
  padding: 12px 20px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  font-size: 16px;
  transition: all 0.2s;
}

.tab-btn:hover {
  background-color: #f5f5f5;
}

.tab-btn.active {
  border-bottom-color: #2980b9;
  color: #2980b9;
  font-weight: bold;
}

/* 内容区域 */
.content-area {
  padding: 20px;
}

.tab-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(41, 128, 185, 0.15);
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(41, 128, 185, 0.25);
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #2980b9;
}

.stat-label {
  font-size: 14px;
  color: #777;
}

/* 数据部分 */
.data-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.section {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(41, 128, 185, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

/* 表格样式 */
.simple-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  font-weight: bold;
  color: #555;
}

tr:hover {
  background-color: #f9f9f9;
}

/* 操作按钮 */
.action-btn {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 3px;
  background-color: #fff;
  cursor: pointer;
  margin-right: 5px;
  font-size: 12px;
}

.action-btn:hover {
  background-color: #f0f0f0;
}

.action-btn.danger {
  color: #d9534f;
  border-color: #d9534f;
}

.action-btn.danger:hover {
  background-color: #f9d6d5;
}

/* 搜索框 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}



/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  width: 80%;
  max-width: 500px;
  border-radius: 8px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #777;
}

.modal-body {
  padding: 20px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detail-row {
  display: flex;
}

.label {
  font-weight: bold;
  width: 100px;
  color: #555;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-sections {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .search-box {
    width: 100%;
  }
}
</style>