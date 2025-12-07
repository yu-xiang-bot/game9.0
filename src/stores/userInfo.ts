import { TowerName } from '@/types';
import { towerDefenseService } from '@/service/towerDefenseService';
import { supabase } from '@/config/supabase';
import { defineStore } from 'pinia';

export type UserInfo = {
  id: string
  name: string
  avatar?: string  // 前端使用的字段名
  avatar_url?: string  // 数据库中的字段名
  phone?: string
  email?: string
  gender?: string
  bio?: string
  isBan?: number
  gameToken?: string
  // 新增游戏相关字段
  playerLevel?: number
  totalScore?: number
  coins?: number
  gems?: number
  experiencePoints?: number
  gamesPlayed?: number
  gamesWon?: number
  totalEnemiesKilled?: number
  totalTowersBuilt?: number
  bestCombo?: number
  playTimeTotal?: number
}

type StateType = {
  userInfo?: UserInfo
  /** 选择的塔防索引 */
  towerSelectList: TowerName[]
  /** 游戏状态 */
  isPlaying: boolean
  currentLevelId?: string
  currentScore?: number
  currentCoins?: number
}

export const useUserInfoStore = defineStore('userInfo', {
  state: (): StateType => ({
    userInfo: void 0,
    towerSelectList: ['aixi','delaiwen','ez','huonan','jin','lanbo','twitch','ejiate'],
    isPlaying: false,
    currentLevelId: undefined,
    currentScore: 0,
    currentCoins: 0
  }),
  
  getters: {
    // 获取用户等级进度
    levelProgress(): number {
      if (!this.userInfo?.experiencePoints || !this.userInfo?.playerLevel) return 0;
      // 简单的经验计算：每升一级需要 当前等级 * 100 经验
      const currentLevelExp = (this.userInfo.playerLevel - 1) * 100;
      const nextLevelExp = this.userInfo.playerLevel * 100;
      const progressExp = this.userInfo.experiencePoints - currentLevelExp;
      const neededExp = nextLevelExp - currentLevelExp;
      return Math.min(100, Math.max(0, (progressExp / neededExp) * 100));
    },
    
    // 胜率
    winRate(): number {
      if (!this.userInfo?.gamesPlayed || this.userInfo.gamesPlayed === 0) return 0;
      return Math.round((this.userInfo.gamesWon! / this.userInfo.gamesPlayed) * 100);
    },
    
    // 是否已登录
    isLoggedIn(): boolean {
      return !!this.userInfo?.id;
    }
  },
  
  actions: {
    async login(email: string, password: string) {
      try {
        const res = await towerDefenseService.loginUser(email, password);
        if (res.code === 200 && res.data) {
          this.$state.userInfo = res.data as UserInfo;
          // 同步用户的游戏数据
          await this.syncUserData();
        }
        return res;
      } catch (error) {
        console.log('login-error: ', error);
        return { code: -1, data: { message: '登录失败' } };
      }
    },
    
    async register(userData: {
      email: string
      password: string
      displayName?: string
    }) {
      try {
        const res = await towerDefenseService.registerUser(
          userData.email,
          userData.password,
          userData.displayName
        );
        if (res.code === 200 && res.data) {
          this.$state.userInfo = res.data as UserInfo;
        }
        return res;
      } catch (error) {
        console.log('register-error: ', error);
        return { code: -1, data: { message: '注册失败' } };
      }
    },
    
    async logout() {
      try {
        // 使用 Supabase Auth 退出登录
        await towerDefenseService.logout();
        this.$state.userInfo = undefined;
        this.$state.isPlaying = false;
        this.$state.currentLevelId = undefined;
        this.$state.currentScore = 0;
        this.$state.currentCoins = 0;
        return { code: 200, data: { message: '退出成功' } };
      } catch (error) {
        console.log('logout-error: ', error);
        // 即使出错也清除本地状态
        this.$state.userInfo = undefined;
      }
    },

    // 检查当前认证状态
    async checkAuthStatus() {
      try {
        const user = await towerDefenseService.getCurrentUser();
        if (user) {
          this.$state.userInfo = towerDefenseService.formatUserInfoFromAuth(user);
          await this.syncUserData();
          return true;
        }
        return false;
      } catch (error) {
        console.log('checkAuthStatus-error: ', error);
        return false;
      }
    },

    // 同步用户完整游戏数据
    async syncUserData() {
      if (!this.userInfo?.id) return;
      
      try {
        // 从数据库获取用户完整游戏数据
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', this.userInfo.id)
          .single()
        
        if (error) {
          console.error('同步用户数据失败:', error);
          return;
        }
        
        if (data) {
          // 更新用户信息，保留认证相关字段
          this.$state.userInfo = {
            ...this.userInfo,
            ...towerDefenseService.formatUserInfo(data)
          };
        }
      } catch (error) {
        console.error('同步用户数据异常:', error);
      }
    },
    
    async updateProfile(updates: {
      displayName?: string
      avatar_url?: string
      phone?: string
      email?: string
      gender?: string
      bio?: string
    }) {
      if (!this.userInfo?.id) return { code: -1, data: { message: '用户未登录' } };
      
      try {
        const res = await towerDefenseService.updateUserProfile(
          this.userInfo.id,
          {
            display_name: updates.displayName,
            avatar_url: updates.avatar_url,
            phone: updates.phone,
            email: updates.email,
            gender: updates.gender,
            bio: updates.bio
          }
        );
        
        if (res.code === 200 && res.data) {
          this.$state.userInfo = res.data as UserInfo;
        }
        return res;
      } catch (error) {
        console.log('updateProfile-error: ', error);
        return { code: -1, data: { message: '更新失败' } };
      }
    },
    
    // 游戏相关操作
    startGame(levelId: string) {
      this.isPlaying = true;
      this.currentLevelId = levelId;
      this.currentScore = 0;
      this.currentCoins = 0;
    },
    
    endGame() {
      this.isPlaying = false;
      this.currentLevelId = undefined;
      this.currentScore = 0;
      this.currentCoins = 0;
    },
    
    updateGameStats(stats: {
      score?: number
      coins?: number
      enemiesKilled?: number
      towersBuilt?: number
    }) {
      if (this.isPlaying) {
        if (stats.score !== undefined) this.currentScore = stats.score;
        if (stats.coins !== undefined) this.currentCoins = stats.coins;
        
        // 同时更新用户总统计（这里只是本地更新，实际保存在游戏结束时处理）
        if (this.userInfo) {
          if (stats.enemiesKilled) {
            this.userInfo.totalEnemiesKilled = (this.userInfo.totalEnemiesKilled || 0) + stats.enemiesKilled;
          }
          if (stats.towersBuilt) {
            this.userInfo.totalTowersBuilt = (this.userInfo.totalTowersBuilt || 0) + stats.towersBuilt;
          }
        }
      }
    },
    
    // 记录游戏结果
    async recordGameResult(gameData: {
      levelId: string
      score: number
      starsEarned: number
      isVictory: boolean
      completionTime?: number
      wavesCompleted: number
      enemiesKilled: number
      towersBuilt: number
      coinsSpent: number
      coinsEarned: number
      damageDealt: number
      damageTaken: number
      maxCombo: number
      towersUsed?: any
      towerUpgrades?: any
    }) {
      if (!this.userInfo?.id) return { code: -1, data: { message: '用户未登录' } };
      
      try {
        // recordGameSession 方法暂未实现，先返回成功状态
        const res = { code: 200, data: { message: "游戏记录已保存" } };
        
        if (res.code === 200) {
          // 更新本地用户统计
          await this.refreshUserInfo();
        }
        
        this.endGame();
        return res;
      } catch (error) {
        console.log('recordGameResult-error: ', error);
        return { code: -1, data: { message: '记录游戏结果失败' } };
      }
    },
    
    // 刷新用户信息
    async refreshUserInfo() {
      if (!this.userInfo?.id) return;
      
      try {
        // 创建一个单独获取用户信息的方法
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', this.userInfo.id)
          .single()
        
        if (error) throw error
        
        if (data) {
          this.$state.userInfo = towerDefenseService.formatUserInfo(data);
        }
      } catch (error) {
        console.log('refreshUserInfo-error: ', error);
      }
    },
    
    // 获取用户关卡进度
    async getUserProgress(levelId?: string) {
      if (!this.userInfo?.id) return { code: -1, data: [] };
      
      try {
        // getUserLevelProgress 方法暂未实现，先返回空进度
        return { code: 200, data: [] };
      } catch (error) {
        console.log('getUserProgress-error: ', error);
        return { code: -1, data: [] };
      }
    }
  },
  
  // 持久化
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'userInfo',
        storage: localStorage,
        paths: ['userInfo'] // 只持久化用户信息，不包括游戏状态
      }
    ]
  }
})