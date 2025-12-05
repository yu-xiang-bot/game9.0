<template>
  <div class="admin-dashboard">
    <!-- 顶部导航栏 -->
    <header class="admin-header">
      <div class="header-left">
        <img src="/assets/legendTD/start.png" alt="Logo" class="logo">
        <h1>塔防联盟 - 后台管理系统</h1>
      </div>
      <div class="header-right">
        <span class="admin-info">欢迎, {{ adminUser.username }}</span>
        <button @click="refreshData" :disabled="loading" class="refresh-btn">
          {{ loading ? '加载中...' : '刷新数据' }}
        </button>
        <span class="last-update" v-if="lastUpdateTime">
          最后更新: {{ lastUpdateTime.toLocaleTimeString() }}
        </span>
        <button @click="logout" class="logout-btn">退出登录</button>
      </div>
    </header>

    <!-- 侧边栏导航 -->
    <div class="admin-layout">
      <aside class="sidebar">
        <nav class="nav-menu">
          <button
            v-for="item in menuItems"
            :key="item.id"
            :class="['nav-item', { active: activeMenu === item.id }]"
            @click="setActiveMenu(item.id)"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.name }}</span>
          </button>
        </nav>
      </aside>

      <!-- 主内容区域 -->
      <main class="main-content">
        <!-- 控制面板 -->
        <div v-if="activeMenu === 'dashboard'" class="content-section">
          <h2>控制面板</h2>
          
          <!-- 统计卡片 -->
          <div class="stats-grid">
            <div class="stat-card primary">
              <div class="stat-icon">👥</div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.totalUsers }}</div>
                <div class="stat-label">总用户数</div>
              </div>
            </div>
            
            <div class="stat-card success">
              <div class="stat-icon">🎮</div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.totalGames }}</div>
                <div class="stat-label">游戏记录</div>
              </div>
            </div>
            
            <div class="stat-card warning">
              <div class="stat-icon">🔥</div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.activeUsers }}</div>
                <div class="stat-label">活跃用户</div>
              </div>
            </div>
            
            <div class="stat-card danger">
              <div class="stat-icon">🏆</div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.highestScore }}</div>
                <div class="stat-label">最高分</div>
              </div>
            </div>
          </div>

          <!-- 最近活动 -->
          <div class="activity-section">
            <div class="activity-card">
              <h3>最新用户</h3>
              <div class="user-list">
                <div v-for="user in recentUsers" :key="user.id" class="user-item">
                  <div class="user-avatar">👤</div>
                  <div class="user-info">
                    <div class="user-name">{{ user.username }}</div>
                    <div class="user-time">{{ formatDate(user.created_at) }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="activity-card">
              <h3>高分榜</h3>
              <div class="score-list">
                <div v-for="(score, index) in topScores" :key="score.id" class="score-item">
                  <div class="score-rank">{{ index + 1 }}</div>
                  <div class="score-info">
                    <div class="score-user">{{ score.username }}</div>
                    <div class="score-value">{{ score.score }} 分</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 用户管理 -->
        <div v-if="activeMenu === 'users'" class="content-section">
          <div class="section-header">
            <h2>用户管理</h2>
            <div class="search-box">
              <input
                v-model="userSearch"
                type="text"
                placeholder="搜索用户..."
                class="search-input"
              />
            </div>
          </div>
          
          <div class="table-container">
            <table class="data-table">
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
                    <button @click="viewUser(user)" class="btn-view">查看</button>
                    <button @click="deleteUser(user.id)" class="btn-delete">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 游戏数据 -->
        <div v-if="activeMenu === 'games'" class="content-section">
          <h2>游戏数据</h2>
          
          <div class="game-stats">
            <div class="game-chart">
              <h3>关卡完成统计</h3>
              <div class="level-stats">
                <div v-for="level in levelStats" :key="level.level" class="level-item">
                  <span class="level-label">关卡 {{ level.level }}</span>
                  <div class="level-bar">
                    <div 
                      class="level-progress" 
                      :style="{ width: (level.completions / stats.totalGames * 100) + '%' }"
                    ></div>
                  </div>
                  <span class="level-count">{{ level.completions }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据导出 -->
        <div v-if="activeMenu === 'export'" class="content-section">
          <h2>数据导出</h2>
          
          <div class="export-options">
            <div class="export-card">
              <h3>导出用户数据</h3>
              <p>导出所有用户的详细信息为 CSV 文件</p>
              <button @click="exportUsers" class="export-btn">
                导出用户数据
              </button>
            </div>
            
            <div class="export-card">
              <h3>导出游戏记录</h3>
              <p>导出所有游戏记录为 CSV 文件</p>
              <button @click="exportGames" class="export-btn">
                导出游戏记录
              </button>
            </div>
          </div>
        </div>

        <!-- 系统设置 -->
        <div v-if="activeMenu === 'settings'" class="content-section">
          <h2>系统设置</h2>
          
          <div class="settings-card">
            <div class="setting-item">
              <label>系统维护模式</label>
              <button 
                :class="['toggle-btn', { active: maintenanceMode }]"
                @click="toggleMaintenance"
              >
                {{ maintenanceMode ? '开启' : '关闭' }}
              </button>
            </div>
            
            <div class="setting-item">
              <label>清除缓存</label>
              <button @click="clearCache" class="action-btn">
                清除缓存
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 用户详情模态框 -->
    <div v-if="showUserModal" class="modal-overlay" @click="closeUserModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>用户详情</h3>
          <button @click="closeUserModal" class="close-btn">×</button>
        </div>
        <div class="modal-body" v-if="selectedUser">
          <div class="user-detail-item">
            <label>用户名:</label>
            <span>{{ selectedUser.username }}</span>
          </div>
          <div class="user-detail-item">
            <label>邮箱:</label>
            <span>{{ selectedUser.email }}</span>
          </div>
          <div class="user-detail-item">
            <label>注册时间:</label>
            <span>{{ formatDate(selectedUser.created_at) }}</span>
          </div>
          <div class="user-detail-item">
            <label>游戏次数:</label>
            <span>{{ selectedUser.games_played || 0 }}</span>
          </div>
          <div class="user-detail-item">
            <label>总分数:</label>
            <span>{{ selectedUser.total_score || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { adminService } from '@/service/adminService'

const router = useRouter()

// 管理员用户信息
const adminUser = ref({
  username: 'admin'
})

// 菜单数据
const menuItems = [
  { id: 'dashboard', name: '控制面板', icon: '📊' },
  { id: 'users', name: '用户管理', icon: '👥' },
  { id: 'games', name: '游戏数据', icon: '🎮' },
  { id: 'export', name: '数据导出', icon: '📁' },
  { id: 'settings', name: '系统设置', icon: '⚙️' }
]

// 响应式数据
const activeMenu = ref('dashboard')
const userSearch = ref('')
const showUserModal = ref(false)
const selectedUser = ref<any>(null)
const maintenanceMode = ref(false)

// 统计数据
const stats = ref({
  totalUsers: 0,
  totalGames: 0,
  activeUsers: 0,
  highestScore: 0
})

// 用户数据
const users = ref<any[]>([])
const recentUsers = ref<any[]>([])
const topScores = ref<any[]>([])
const levelStats = ref<any[]>([])

// 实时订阅
let subscription: any = null

// 加载状态
const loading = ref(false)
const lastUpdateTime = ref(new Date())

// 计算属性
const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  return users.value.filter(user => 
    user.username.toLowerCase().includes(userSearch.value.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(userSearch.value.toLowerCase()))
  )
})

// 方法
const setActiveMenu = (menuId: string) => {
  activeMenu.value = menuId
}

const logout = () => {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
  router.push('/')
}

const viewUser = (user: any) => {
  selectedUser.value = user
  showUserModal.value = true
}

const closeUserModal = () => {
  showUserModal.value = false
  selectedUser.value = null
}

const deleteUser = async (userId: string) => {
  if (confirm('确定要删除该用户吗？此操作不可恢复！')) {
    loading.value = true
    try {
      const result = await adminService.deleteUser(userId)
      if (result.success) {
        await loadRealData() // 重新加载数据
        alert('用户删除成功')
      } else {
        alert('删除失败: ' + result.error)
      }
    } catch (error) {
      console.error('删除用户失败:', error)
      alert('删除失败，请重试')
    } finally {
      loading.value = false
    }
  }
}

const exportUsers = async () => {
  loading.value = true
  try {
    const result = await adminService.exportUserData()
    if (result.success) {
      const csvContent = generateUserCSV(result.data as any[])
      downloadCSV(csvContent, `用户数据_${new Date().toISOString().split('T')[0]}.csv`)
      alert('用户数据导出成功')
    } else {
      alert('导出失败: ' + result.error)
    }
  } catch (error) {
    console.error('导出用户数据失败:', error)
    alert('导出失败，请重试')
  } finally {
    loading.value = false
  }
}

const exportGames = async () => {
  loading.value = true
  try {
    const result = await adminService.getAllScores()
    if (result.success) {
      const csvContent = generateGameCSV(result.data as any[])
      downloadCSV(csvContent, `游戏记录_${new Date().toISOString().split('T')[0]}.csv`)
      alert('游戏数据导出成功')
    } else {
      alert('导出失败: ' + result.error)
    }
  } catch (error) {
    console.error('导出游戏数据失败:', error)
    alert('导出失败，请重试')
  } finally {
    loading.value = false
  }
}

const generateUserCSV = (userData: any[]) => {
  let csv = '用户名,邮箱,注册时间,游戏次数,总分数,最高关卡,总星星,玩家等级,经验值\n'
  userData.forEach((user: any) => {
    csv += `${user.username || ''},${user.email || ''},${user.registration_date || user.created_at || ''},${user.games_played || 0},${user.total_score || 0},${user.max_level || 0},${user.total_stars || 0},${user.player_level || 0},${user.experience_points || 0}\n`
  })
  return csv
}

const generateGameCSV = (gameData: any[]) => {
  let csv = '用户名,分数,关卡,是否胜利,完成时间,波数完成,敌人击杀,防御塔建造,开始时间\n'
  gameData.forEach((game: any) => {
    csv += `${game.users?.username || '未知'},${game.score || 0},${game.level_id || game.level || ''},${game.is_victory ? '是' : '否'},${game.completion_time || 0},${game.waves_completed || 0},${game.enemies_killed || 0},${game.towers_built || 0},${game.start_time || ''}\n`
  })
  return csv
}

const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const toggleMaintenance = () => {
  maintenanceMode.value = !maintenanceMode.value
  alert(`维护模式已${maintenanceMode.value ? '开启' : '关闭'}`)
}

const clearCache = () => {
  localStorage.clear()
  alert('缓存已清除')
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 加载真实数据
const loadRealData = async () => {
  loading.value = true
  console.log('开始加载后台管理数据...')
  
  try {
    // 串行加载，避免并发问题
    console.log('1. 加载用户数据...')
    const usersResult = await adminService.getAllUsers()
    
    if (usersResult.success) {
      users.value = usersResult.data as any[] || []
      recentUsers.value = users.value.slice(0, 5)
      console.log(`用户数据加载成功: ${users.value.length} 个用户`)
    } else {
      console.error('加载用户数据失败:', usersResult.error)
      users.value = []
      recentUsers.value = []
    }

    console.log('2. 加载游戏数据...')
    const scoresResult = await adminService.getAllScores()
    
    if (scoresResult.success) {
      const scores = scoresResult.data as any[] || []
      topScores.value = scores.slice(0, 10)
      
      // 生成关卡统计数据
      const levelMap = new Map()
      scores.forEach((score: any) => {
        const levelId = score.level_id || score.level || 'unknown'
        levelMap.set(levelId, (levelMap.get(levelId) || 0) + 1)
      })
      
      levelStats.value = Array.from(levelMap.entries())
        .map(([level, completions]) => ({ level, completions }))
        .sort((a, b) => a.level.toString().localeCompare(b.level.toString()))
      
      console.log(`游戏数据加载成功: ${scores.length} 条记录`)
    } else {
      console.error('加载游戏数据失败:', scoresResult.error)
      topScores.value = []
      levelStats.value = []
    }

    console.log('3. 加载统计数据...')
    const statsResult = await adminService.getStats()
    
    if (statsResult.success && statsResult.data) {
      stats.value = {
        totalUsers: statsResult.data.totalUsers || 0,
        totalGames: statsResult.data.totalScores || 0,
        activeUsers: statsResult.data.activeUsers || 0,
        highestScore: statsResult.data.highestScore || 0
      }
      console.log('统计数据加载成功:', stats.value)
    } else {
      console.error('加载统计数据失败:', statsResult.error)
      stats.value = {
        totalUsers: 0,
        totalGames: 0,
        activeUsers: 0,
        highestScore: 0
      }
    }

    lastUpdateTime.value = new Date()
    console.log('✅ 所有数据加载完成，更新时间:', lastUpdateTime.value.toLocaleString())
    
  } catch (error: any) {
    console.error('❌ 加载数据异常:', error)
    
    // 设置默认值，避免页面崩溃
    users.value = []
    recentUsers.value = []
    topScores.value = []
    levelStats.value = []
    stats.value = {
      totalUsers: 0,
      totalGames: 0,
      activeUsers: 0,
      highestScore: 0
    }
    
    // 只在严重错误时显示提示
    if (error.message && !error.message.includes('network')) {
      console.warn('数据加载遇到问题，但页面仍可正常使用')
    }
  } finally {
    loading.value = false
  }
}

// 设置实时数据订阅
const setupRealtimeSubscription = () => {
  console.log('设置实时数据订阅...')
  
  subscription = adminService.subscribeToDataUpdates((event, data) => {
    console.log(`收到实时更新 - ${event}:`, data)
    
    // 显示更新通知
    showUpdateNotification(event)
    
    // 刷新相关数据
    setTimeout(() => {
      loadRealData()
    }, 1000)
  })
}

// 显示更新通知
const showUpdateNotification = (eventType: string) => {
  const messages: { [key: string]: string } = {
    users: '用户数据已更新',
    game_sessions: '游戏记录已更新',
    leaderboards: '排行榜已更新'
  }
  
  // 创建一个临时的通知元素
  const notification = document.createElement('div')
  notification.className = 'realtime-notification'
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">🔄</span>
      <span>${messages[eventType] || '数据已更新'}</span>
      <span class="notification-time">${new Date().toLocaleTimeString()}</span>
    </div>
  `
  
  document.body.appendChild(notification)
  
  // 3秒后自动移除
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 3000)
}

// 手动刷新数据
const refreshData = () => {
  loadRealData()
}

// 生命周期
onMounted(async () => {
  // 检查登录状态
  const token = localStorage.getItem('adminToken')
  if (!token) {
    router.push('/admin/login')
    return
  }

  const userData = localStorage.getItem('adminUser')
  if (userData) {
    adminUser.value = JSON.parse(userData)
  }

  // 加载真实数据
  await loadRealData()
  
  // 设置实时数据订阅
  setupRealtimeSubscription()
})

onBeforeUnmount(() => {
  // 清理实时订阅
  if (subscription) {
    subscription.unsubscribe()
    subscription = null
    console.log('实时数据订阅已清理')
  }
})
</script>

<style scoped>
.admin-dashboard {
  font-family: 'Arial', sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 头部样式 */
.admin-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  width: 35px;
  height: 35px;
  margin-right: 15px;
}

.header-left h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.admin-info {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
}

.refresh-btn {
  background: rgba(76, 175, 80, 0.8);
  border: 1px solid rgba(76, 175, 80, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
  margin-right: 10px;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(76, 175, 80, 1);
}

.refresh-btn:disabled {
  background: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}

.last-update {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-right: 10px;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 布局样式 */
.admin-layout {
  display: flex;
  min-height: calc(100vh - 70px);
}

.sidebar {
  width: 250px;
  background: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

.nav-menu {
  padding: 20px 0;
}

.nav-item {
  width: 100%;
  padding: 15px 25px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s;
  text-align: left;
}

.nav-item:hover {
  background: #f8f9fa;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-icon {
  font-size: 18px;
}

.nav-text {
  font-size: 15px;
  font-weight: 500;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.content-section h2 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 24px;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 30px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.stat-card.primary .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.success .stat-icon {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-card.warning .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card.danger .stat-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
}

/* 活动区域 */
.activity-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.activity-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.activity-card h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
}

.user-item, .score-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #ecf0f1;
}

.user-item:last-child, .score-item:last-child {
  border-bottom: none;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #ecf0f1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.user-name {
  font-weight: 500;
  color: #2c3e50;
}

.user-time {
  font-size: 12px;
  color: #7f8c8d;
}

.score-rank {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
}

.score-user {
  font-weight: 500;
  color: #2c3e50;
}

.score-value {
  color: #e74c3c;
  font-weight: bold;
}

/* 表格样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-input {
  padding: 10px 15px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  width: 250px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8f9fa;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
}

.data-table td {
  padding: 15px;
  border-bottom: 1px solid #ecf0f1;
}

.data-table tr:hover {
  background: #f8f9fa;
}

.btn-view {
  background: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
}

.btn-delete {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

/* 导出选项 */
.export-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.export-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.export-card h3 {
  margin-top: 0;
  color: #2c3e50;
}

.export-card p {
  color: #7f8c8d;
  margin-bottom: 20px;
}

.export-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: transform 0.3s;
}

.export-btn:hover {
  transform: translateY(-2px);
}

/* 设置卡片 */
.settings-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  max-width: 600px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #ecf0f1;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item label {
  font-weight: 500;
  color: #2c3e50;
}

.toggle-btn {
  background: #bdc3c7;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-btn.active {
  background: #27ae60;
}

.action-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 12px;
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  padding: 25px;
}

.user-detail-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #ecf0f1;
}

.user-detail-item:last-child {
  border-bottom: none;
}

.user-detail-item label {
  font-weight: 500;
  color: #7f8c8d;
}

/* 游戏数据图表 */
.game-stats {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.level-stats {
  margin-top: 20px;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.level-label {
  min-width: 80px;
  font-weight: 500;
}

.level-bar {
  flex: 1;
  height: 20px;
  background: #ecf0f1;
  border-radius: 10px;
  overflow: hidden;
}

.level-progress {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.level-count {
  min-width: 40px;
  text-align: right;
  font-weight: bold;
  color: #2c3e50;
}

/* 实时通知样式 */
.realtime-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideInRight 0.3s ease-out;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification-icon {
  font-size: 18px;
}

.notification-time {
  font-size: 12px;
  opacity: 0.8;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-section {
    grid-template-columns: 1fr;
  }
  
  .main-content {
    padding: 20px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .search-input {
    width: 100%;
  }
}
</style>