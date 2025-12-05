// 管理员认证工具类

export const adminAuth = {
  // 检查是否已登录
  isLoggedIn(): boolean {
    const token = localStorage.getItem('adminToken')
    return !!token
  },

  // 获取当前管理员信息
  getCurrentAdmin(): any {
    const userData = localStorage.getItem('adminUser')
    return userData ? JSON.parse(userData) : null
  },

  // 登录
  login(username: string, password: string): boolean {
    // 简单的验证逻辑，实际项目中应该调用后端API
    if (username === 'admin' && password === 'admin123') {
      const token = 'admin-token-' + Date.now()
      const userData = {
        username: username,
        loginTime: new Date().toISOString()
      }
      
      localStorage.setItem('adminToken', token)
      localStorage.setItem('adminUser', JSON.stringify(userData))
      
      return true
    }
    
    return false
  },

  // 退出登录
  logout(): void {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
  }
}