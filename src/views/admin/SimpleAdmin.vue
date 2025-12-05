<template>
  <div class="simple-admin">
    <div class="admin-header">
      <h1>🏰 塔防联盟管理</h1>
      <div class="user-info">
        <span>欢迎，{{ currentUser?.username || '管理员' }}</span>
        <button @click="logout" class="logout-btn">退出</button>
      </div>
    </div>
    
    <div class="admin-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <div class="admin-content">
      <!-- 数据概览 -->
      <div v-if="activeTab === 'dashboard'" class="tab-content">
        <h2>📊 数据概览</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ stats.totalUsers }}</div>
            <div class="stat-label">总用户</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.onlineUsers }}</div>
            <div class="stat-label">在线用户</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.todayGames }}</div>
            <div class="stat-label">今日游戏</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.totalLevels }}</div>
            <div class="stat-label">关卡总数</div>
          </div>
        </div>
      </div>
      
      <!-- 用户管理 -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <div class="section-header">
          <h2>👥 用户管理</h2>
          <input 
            v-model="userSearch" 
            placeholder="搜索用户..." 
            class="search-input"
            @input="searchUsers"
          />
        </div>
        
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>用户名</th>
                <th>邮箱</th>
                <th>金币</th>
                <th>钻石</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.user_id">
                <td>{{ user.username }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.coins }}</td>
                <td>{{ user.gems }}</td>
                <td>
                  <span :class="['status', user.status]">
                    {{ user.status === 'active' ? '正常' : '封禁' }}
                  </span>
                </td>
                <td>
                  <button 
                    @click="toggleUserStatus(user)"
                    :class="['action-btn', user.status === 'active' ? 'ban' : 'unban']"
                  >
                    {{ user.status === 'active' ? '封禁' : '解封' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- 关卡管理 -->
      <div v-if="activeTab === 'levels'" class="tab-content">
        <div class="section-header">
          <h2>🗺️ 关卡管理</h2>
          <button @click="showAddLevelDialog = true" class="add-btn">添加关卡</button>
        </div>
        
        <div class="levels-grid">
          <div v-for="level in levels" :key="level.level_id" class="level-card">
            <div class="level-header">
              <h3>{{ level.level_name }}</h3>
              <span :class="['difficulty', level.difficulty]">
                {{ getDifficultyText(level.difficulty) }}
              </span>
            </div>
            <div class="level-info">
              <p>关卡: {{ level.level_number }}</p>
              <p>初始金币: {{ level.initial_coins }}</p>
              <p>波数: {{ level.max_waves }}</p>
            </div>
            <div class="level-actions">
              <button @click="editLevel(level)" class="edit-btn">编辑</button>
              <button @click="deleteLevel(level)" class="delete-btn">删除</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 游戏记录 -->
      <div v-if="activeTab === 'records'" class="tab-content">
        <h2>🎮 游戏记录</h2>
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>用户名</th>
                <th>关卡</th>
                <th>分数</th>
                <th>星星</th>
                <th>时间</th>
                <th>结果</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in gameRecords" :key="record.session_id">
                <td>{{ record.username }}</td>
                <td>{{ record.level_name }}</td>
                <td>{{ record.score?.toLocaleString() || 0 }}</td>
                <td>{{ record.stars_earned || 0 }}</td>
                <td>{{ formatDate(record.created_at) }}</td>
                <td>
                  <span :class="['result', record.is_victory ? 'win' : 'lose']">
                    {{ record.is_victory ? '胜利' : '失败' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑关卡对话框 -->
    <div v-if="showAddLevelDialog" class="modal-overlay" @click="showAddLevelDialog = false">
      <div class="modal" @click.stop>
        <h3>{{ isEditingLevel ? '编辑关卡' : '添加关卡' }}</h3>
        <form @submit.prevent="saveLevel">
          <div class="form-group">
            <label>关卡名称</label>
            <input v-model="currentLevel.level_name" required />
          </div>
          <div class="form-group">
            <label>关卡序号</label>
            <input v-model.number="currentLevel.level_number" type="number" required />
          </div>
          <div class="form-group">
            <label>难度</label>
            <select v-model="currentLevel.difficulty">
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>
          <div class="form-group">
            <label>初始金币</label>
            <input v-model.number="currentLevel.initial_coins" type="number" />
          </div>
          <div class="form-group">
            <label>最大波数</label>
            <input v-model.number="currentLevel.max_waves" type="number" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddLevelDialog = false">取消</button>
            <button type="submit" class="save-btn">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../../supabase.js'

const currentUser = ref(null)
const activeTab = ref('dashboard')
const userSearch = ref('')
const showAddLevelDialog = ref(false)
const isEditingLevel = ref(false)

const tabs = [
  { key: 'dashboard', label: '📊 数据概览' },
  { key: 'users', label: '👥 用户管理' },
  { key: 'levels', label: '🗺️ 关卡管理' },
  { key: 'records', label: '🎮 游戏记录' }
]

const stats = ref({
  totalUsers: 0,
  onlineUsers: 0,
  todayGames: 0,
  totalLevels: 0
})

const users = ref([])
const levels = ref([])
const gameRecords = ref([])

const currentLevel = ref({
  level_name: '',
  level_number: 1,
  difficulty: 'medium',
  initial_coins: 500,
  max_waves: 10,
  level_id: null
})

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  return users.value.filter(user => 
    user.username.toLowerCase().includes(userSearch.value.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.value.toLowerCase())
  )
})

// 加载统计数据
const loadStats = async () => {
  try {
    // 总用户数
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    // 在线用户数（5分钟内有活动）
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { count: onlineUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', fiveMinutesAgo)
    
    // 今日游戏数
    const today = new Date().toISOString().split('T')[0]
    const { count: todayGames } = await supabase
      .from('game_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today)
    
    // 关卡总数
    const { count: totalLevels } = await supabase
      .from('game_levels')
      .select('*', { count: 'exact', head: true })
    
    stats.value = {
      totalUsers: totalUsers || 0,
      onlineUsers: onlineUsers || 0,
      todayGames: todayGames || 0,
      totalLevels: totalLevels || 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载用户列表
const loadUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, username, email, coins, gems, status')
      .order('registration_date', { ascending: false })
      .limit(50)
    
    if (error) throw error
    users.value = data || []
  } catch (error) {
    console.error('加载用户列表失败:', error)
  }
}

// 加载关卡列表
const loadLevels = async () => {
  try {
    const { data, error } = await supabase
      .from('game_levels')
      .select('*')
      .order('level_number')
    
    if (error) throw error
    levels.value = data || []
  } catch (error) {
    console.error('加载关卡列表失败:', error)
  }
}

// 加载游戏记录
const loadGameRecords = async () => {
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select(`
        session_id,
        score,
        stars_earned,
        is_victory,
        created_at,
        user_id,
        users(username),
        level_id,
        game_levels(level_name)
      `)
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (error) throw error
    gameRecords.value = data || []
  } catch (error) {
    console.error('加载游戏记录失败:', error)
  }
}

// 切换用户状态
const toggleUserStatus = async (user) => {
  try {
    const newStatus = user.status === 'active' ? 'banned' : 'active'
    const { error } = await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('user_id', user.user_id)
    
    if (error) throw error
    user.status = newStatus
  } catch (error) {
    console.error('更新用户状态失败:', error)
    alert('操作失败，请重试')
  }
}

// 编辑关卡
const editLevel = (level) => {
  isEditingLevel.value = true
  currentLevel.value = { ...level }
  showAddLevelDialog.value = true
}

// 保存关卡
const saveLevel = async () => {
  try {
    if (isEditingLevel.value) {
      // 更新
      const { error } = await supabase
        .from('game_levels')
        .update(currentLevel.value)
        .eq('level_id', currentLevel.value.level_id)
      
      if (error) throw error
    } else {
      // 新增
      const { error } = await supabase
        .from('game_levels')
        .insert([currentLevel.value])
      
      if (error) throw error
    }
    
    showAddLevelDialog.value = false
    isEditingLevel.value = false
    currentLevel.value = {
      level_name: '',
      level_number: 1,
      difficulty: 'medium',
      initial_coins: 500,
      max_waves: 10,
      level_id: null
    }
    loadLevels()
  } catch (error) {
    console.error('保存关卡失败:', error)
    alert('保存失败，请重试')
  }
}

// 删除关卡
const deleteLevel = async (level) => {
  if (!confirm(`确定要删除关卡 "${level.level_name}" 吗？`)) return
  
  try {
    const { error } = await supabase
      .from('game_levels')
      .delete()
      .eq('level_id', level.level_id)
    
    if (error) throw error
    loadLevels()
  } catch (error) {
    console.error('删除关卡失败:', error)
    alert('删除失败，请重试')
  }
}

// 搜索用户
const searchUsers = () => {
  // 搜索逻辑已通过 computed 实现
}

// 获取难度文本
const getDifficultyText = (difficulty) => {
  const texts = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
    expert: '专家'
  }
  return texts[difficulty] || difficulty
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 退出登录
const logout = async () => {
  await supabase.auth.signOut()
  // 退出后台管理系统，返回游戏主页面
  window.location.href = '/'
}

// 检查登录状态
const checkAuth = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      currentUser.value = user
      // 加载数据
      loadStats()
      loadUsers()
      loadLevels()
      loadGameRecords()
    } else {
      window.location.href = '/login'
    }
  } catch (error) {
    console.error('检查登录状态失败:', error)
    window.location.href = '/login'
  }
}

onMounted(() => {
  checkAuth()
})
</script>

<style scoped>
.simple-admin {
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.admin-header {
  background: linear-gradient(135deg, #64b5f6 0%, #2196f3 100%);
  color: white;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(33, 150, 243, 0.3);
}

.admin-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.admin-tabs {
  background: white;
  padding: 0 30px;
  border-bottom: 1px solid #e3f2fd;
  display: flex;
  gap: 10px;
  overflow-x: auto;
}

.tab-btn {
  background: none;
  border: none;
  padding: 15px 20px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #2196f3;
  background: #f5f5f5;
}

.tab-btn.active {
  color: #2196f3;
  border-bottom-color: #2196f3;
  font-weight: 600;
}

.admin-content {
  padding: 30px;
}

.tab-content h2 {
  color: #1976d2;
  margin-bottom: 20px;
  font-size: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(33, 150, 243, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(33, 150, 243, 0.2);
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #2196f3;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.search-input {
  padding: 10px 15px;
  border: 2px solid #e3f2fd;
  border-radius: 8px;
  font-size: 14px;
  width: 250px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #2196f3;
}

.add-btn {
  background: #2196f3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.add-btn:hover {
  background: #1976d2;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(33, 150, 243, 0.1);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  background: #f5f5f5;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e3f2fd;
}

.admin-table td {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status.active {
  background: #e8f5e8;
  color: #4caf50;
}

.status.banned {
  background: #ffebee;
  color: #f44336;
}

.result {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.result.win {
  background: #e8f5e8;
  color: #4caf50;
}

.result.lose {
  background: #ffebee;
  color: #f44336;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.action-btn.ban {
  background: #ff5252;
  color: white;
}

.action-btn.unban {
  background: #4caf50;
  color: white;
}

.action-btn:hover {
  opacity: 0.8;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.level-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(33, 150, 243, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.level-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(33, 150, 243, 0.2);
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.level-header h3 {
  margin: 0;
  color: #1976d2;
  font-size: 18px;
}

.difficulty {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.difficulty.easy {
  background: #e8f5e8;
  color: #4caf50;
}

.difficulty.medium {
  background: #fff3e0;
  color: #ff9800;
}

.difficulty.hard {
  background: #ffebee;
  color: #f44336;
}

.level-info {
  margin-bottom: 15px;
}

.level-info p {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.level-actions {
  display: flex;
  gap: 10px;
}

.edit-btn {
  background: #64b5f6;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

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

.modal {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
}

.modal h3 {
  margin: 0 0 20px 0;
  color: #1976d2;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 2px solid #e3f2fd;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2196f3;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.modal-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.save-btn {
  background: #2196f3;
  color: white;
}

.modal-actions button[type="button"] {
  background: #f5f5f5;
  color: #666;
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .levels-grid {
    grid-template-columns: 1fr;
  }
  
  .admin-content {
    padding: 20px;
  }
}
</style>