<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1>📊 后台管理系统</h1>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>刷新数据
        </el-button>
        <el-button type="success" @click="exportData">
          <el-icon><Download /></el-icon>导出数据
        </el-button>
      </div>
    </div>
    
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon user-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.totalUsers }}</h3>
              <p>总用户数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon score-icon">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.totalScores }}</h3>
              <p>总游戏记录</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon active-icon">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.activeUsers }}</h3>
              <p>活跃用户</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon highscore-icon">
              <el-icon><Medal /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.highestScore }}</h3>
              <p>最高分数</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="data-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>👥 用户列表</span>
              <el-input
                v-model="userSearch"
                placeholder="搜索用户..."
                style="width: 200px"
                clearable
                @input="filterUsers"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </template>
          
          <el-table
            :data="filteredUsers"
            stripe
            height="400"
            v-loading="loading"
          >
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="phone" label="手机号" width="120" />
            <el-table-column prop="created_at" label="注册时间" width="150">
              <template #default="{ row }">
                {{ formatDate(row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column prop="total_score" label="总分数" width="100" />
            <el-table-column prop="max_level" label="最高关卡" width="100" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" type="primary" @click="viewUserDetails(row)">
                  详情
                </el-button>
                <el-button size="small" type="danger" @click="deleteUser(row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>🏆 游戏排行榜</span>
              <el-select v-model="levelFilter" placeholder="选择关卡" style="width: 120px">
                <el-option label="所有关卡" value="" />
                <el-option
                  v-for="level in [1, 2, 3, 4, 5]"
                  :key="level"
                  :label="`关卡 ${level}`"
                  :value="level"
                />
              </el-select>
            </div>
          </template>
          
          <el-table
            :data="filteredScores"
            stripe
            height="400"
            v-loading="loading"
          >
            <el-table-column prop="rank" label="排名" width="60" />
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="level" label="关卡" width="80" />
            <el-table-column prop="score" label="分数" width="100" />
            <el-table-column prop="created_at" label="达成时间" width="150">
              <template #default="{ row }">
                {{ formatDate(row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button size="small" type="danger" @click="deleteScore(row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 用户详情对话框 -->
    <el-dialog v-model="userDialogVisible" title="用户详情" width="600px">
      <div v-if="selectedUser" class="user-details">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ selectedUser.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ selectedUser.username }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ selectedUser.phone || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatDate(selectedUser.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="最后更新">{{ formatDate(selectedUser.updated_at) }}</el-descriptions-item>
          <el-descriptions-item label="总游戏次数">{{ userScores.length }}</el-descriptions-item>
        </el-descriptions>
        
        <h3 style="margin-top: 20px;">游戏记录</h3>
        <el-table :data="userScores" stripe>
          <el-table-column prop="level" label="关卡" width="80" />
          <el-table-column prop="score" label="分数" width="100" />
          <el-table-column prop="created_at" label="达成时间">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Refresh, 
  Download, 
  User, 
  Trophy, 
  Timer, 
  Medal, 
  Search 
} from '@element-plus/icons-vue'
import { supabase } from '@/config/supabase'
import { adminService } from '@/service/adminService'

// 响应式数据
const loading = ref(false)
const users = ref([])
const scores = ref([])
const userSearch = ref('')
const levelFilter = ref('')
const userDialogVisible = ref(false)
const selectedUser = ref(null)
const userScores = ref([])

// 统计数据
const stats = reactive({
  totalUsers: 0,
  totalScores: 0,
  activeUsers: 0,
  highestScore: 0
})

// 计算属性
const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  return users.value.filter(user => 
    user.username.toLowerCase().includes(userSearch.value.toLowerCase()) ||
    (user.phone && user.phone.includes(userSearch.value))
  )
})

const filteredScores = computed(() => {
  if (!levelFilter.value) return scores.value
  return scores.value.filter(score => score.level === levelFilter.value)
})

// 方法
const fetchData = async () => {
  loading.value = true
  try {
    // 使用管理服务获取数据
    const usersResult = await adminService.getAllUsers()
    const scoresResult = await adminService.getAllScores()
    const statsResult = await adminService.getStats()
    
    if (!usersResult.success || !scoresResult.success || !statsResult.success) {
      throw new Error('获取数据失败')
    }
    
    users.value = usersResult.data || []
    scores.value = (scoresResult.data || []).map((item, index) => ({
      ...item,
      rank: index + 1,
      username: item.users?.username || '未知用户'
    }))
    
    // 更新统计数据
    Object.assign(stats, statsResult.data)
    
    // 为用户添加统计信息
    users.value = users.value.map(user => {
      const userScores = scoresResult.data?.filter(s => s.user_id === user.id) || []
      return {
        ...user,
        total_score: userScores.reduce((sum, s) => sum + s.score, 0),
        max_level: Math.max(...userScores.map(s => s.level), 0)
      }
    })
    
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchData()
}

const filterUsers = () => {
  // 输入时自动过滤，无需额外操作
}

const viewUserDetails = async (user) => {
  selectedUser.value = user
  
  try {
    const result = await adminService.getUserDetails(user.id)
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    userScores.value = result.data.scores || []
    userDialogVisible.value = true
  } catch (error: any) {
    console.error('获取用户游戏记录失败:', error)
    ElMessage.error('获取用户游戏记录失败')
  }
}

const deleteUser = async (userId) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？这将同时删除其所有游戏记录。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const result = await adminService.deleteUser(userId)
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败: ' + error.message)
    }
  }
}

const deleteScore = async (scoreId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条游戏记录吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const result = await adminService.deleteScore(scoreId)
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除记录失败:', error)
      ElMessage.error('删除记录失败: ' + error.message)
    }
  }
}

const exportData = async () => {
  try {
    const result = await adminService.exportUserData()
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    const csvContent = generateCSV(result.data)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `游戏数据_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('数据导出成功')
  } catch (error: any) {
    console.error('导出数据失败:', error)
    ElMessage.error('导出数据失败: ' + error.message)
  }
}

const generateCSV = (data) => {
  let csv = '用户ID,用户名,手机号,注册时间,总分数,最高关卡,游戏次数\n'
  
  data.forEach(user => {
    csv += `${user.id},${user.username},${user.phone || ''},${user.created_at},${user.total_score || 0},${user.max_level || 0},${user.games_played || 0}\n`
  })
  
  return csv
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-header h1 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: white;
  margin-right: 15px;
}

.user-icon {
  background-color: #409EFF;
}

.score-icon {
  background-color: #67C23A;
}

.active-icon {
  background-color: #E6A23C;
}

.highscore-icon {
  background-color: #F56C6C;
}

.stat-info h3 {
  margin: 0;
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.stat-info p {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 14px;
}

.data-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-details {
  padding: 10px 0;
}

.user-details h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #333;
}
</style>