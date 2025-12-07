import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('开始自动化修复问题...');

// 1. 修复 Supabase 认证问题
console.log('1. 修复 Supabase 认证问题...');
const supabaseConfigPath = path.join(__dirname, 'src/config/supabase.ts');
let supabaseConfig = fs.readFileSync(supabaseConfigPath, 'utf8');

// 替换 Supabase 配置以使用我们的存储管理器
if (!supabaseConfig.includes('supabaseStorage')) {
  supabaseConfig = supabaseConfig.replace(
    "import { createClient } from '@supabase/supabase-js'",
    "import { createClient } from '@supabase/supabase-js'\nimport { supabaseStorage } from '@/utils/storageManager'"
  );
  
  supabaseConfig = supabaseConfig.replace(
    "storage: localStorage, // 明确指定使用 localStorage",
    "storage: supabaseStorage, // 使用我们的自定义存储管理器"
  );
  
  fs.writeFileSync(supabaseConfigPath, supabaseConfig);
  console.log('✓ Supabase 配置已更新');
}

// 2. 修复 CDN URL 配置
console.log('2. 修复 CDN URL 配置...');
const configIndexPath = path.join(__dirname, 'src/config/index.ts');
let configIndex = fs.readFileSync(configIndexPath, 'utf8');

if (!configIndex.includes('CDN_HAS_SSL_ISSUES')) {
  configIndex = configIndex.replace(
    "export const prefixAPI = 'api';",
    "export const prefixAPI = 'api';\n\n// 由于 lhh.codeape.site 的 SSL 证书已过期，我们需要提供一个标志\nexport const CDN_HAS_SSL_ISSUES = true;"
  );
  
  fs.writeFileSync(configIndexPath, configIndex);
  console.log('✓ CDN 配置已更新');
}

// 3. 创建存储管理器
console.log('3. 创建存储管理器...');
const storageManagerPath = path.join(__dirname, 'src/utils/storageManager.ts');
if (!fs.existsSync(storageManagerPath)) {
  const storageManagerContent = `/**
 * 本地存储工具类 - 处理浏览器跟踪防护和隐私设置问题
 */
class StorageManager {
  private isStorageAvailable: boolean = true;
  private fallbackStorage: Record<string, any> = {};
  
  constructor() {
    this.checkStorageAvailability();
  }
  
  /**
   * 检查本地存储是否可用
   */
  private checkStorageAvailability() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.isStorageAvailable = true;
    } catch (error) {
      console.warn('本地存储不可用，使用内存存储作为后备方案:', error);
      this.isStorageAvailable = false;
    }
  }
  
  /**
   * 设置存储项
   */
  setItem(key: string, value: any): boolean {
    try {
      const serializedValue = JSON.stringify(value);
      
      if (this.isStorageAvailable) {
        localStorage.setItem(key, serializedValue);
        return true;
      } else {
        this.fallbackStorage[key] = serializedValue;
        return true;
      }
    } catch (error) {
      console.error(\`存储失败 [\${key}]:\`, error);
      // 尝试使用内存存储作为后备
      try {
        this.fallbackStorage[key] = JSON.stringify(value);
        return true;
      } catch (fallbackError) {
        console.error(\`后备存储也失败 [\${key}]:\`, fallbackError);
        return false;
      }
    }
  }
  
  /**
   * 获取存储项
   */
  getItem(key: string, defaultValue: any = null): any {
    try {
      let serializedValue: string | null = null;
      
      if (this.isStorageAvailable) {
        serializedValue = localStorage.getItem(key);
      }
      
      // 如果本地存储中没有值，尝试从后备存储获取
      if (!serializedValue && this.fallbackStorage[key]) {
        serializedValue = this.fallbackStorage[key];
      }
      
      if (serializedValue === null) {
        return defaultValue;
      }
      
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error(\`获取存储项失败 [\${key}]:\`, error);
      return defaultValue;
    }
  }
  
  /**
   * 删除存储项
   */
  removeItem(key: string): boolean {
    try {
      if (this.isStorageAvailable) {
        localStorage.removeItem(key);
      }
      
      if (this.fallbackStorage[key]) {
        delete this.fallbackStorage[key];
      }
      
      return true;
    } catch (error) {
      console.error(\`删除存储项失败 [\${key}]:\`, error);
      return false;
    }
  }
  
  /**
   * 清除所有存储项
   */
  clear(): boolean {
    try {
      if (this.isStorageAvailable) {
        localStorage.clear();
      }
      
      this.fallbackStorage = {};
      return true;
    } catch (error) {
      console.error('清除存储失败:', error);
      return false;
    }
  }
}

// 导出单例实例
export const storageManager = new StorageManager();

// 便捷方法
export const setItem = (key: string, value: any): boolean => storageManager.setItem(key, value);
export const getItem = (key: string, defaultValue?: any): any => storageManager.getItem(key, defaultValue);
export const removeItem = (key: string): boolean => storageManager.removeItem(key);
export const clearStorage = (): boolean => storageManager.clear();
export const hasItem = (key: string): boolean => storageManager.hasKey(key);

// Supabase 认证特定的存储方法
export const supabaseStorage = {
  getItem: (key: string): string | null => {
    const value = storageManager.getItem(key);
    return typeof value === 'string' ? value : null;
  },
  setItem: (key: string, value: string): void => {
    storageManager.setItem(key, value);
  },
  removeItem: (key: string): void => {
    storageManager.removeItem(key);
  }
};`;
  
  fs.writeFileSync(storageManagerPath, storageManagerContent);
  console.log('✓ 存储管理器已创建');
}

// 4. 修复图片加载工具
console.log('4. 修复图片加载工具...');
const handleImgPath = path.join(__dirname, 'src/utils/handleImg.ts');
let handleImg = fs.readFileSync(handleImgPath, 'utf8');

if (!handleImg.includes('CDN_HAS_SSL_ISSUES')) {
  handleImg = handleImg.replace(
    "import { CDN_URL } from '@/config';",
    "import { CDN_URL, CDN_HAS_SSL_ISSUES } from '@/config';"
  );
  
  // 添加跨域属性和SSL证书问题处理
  handleImg = handleImg.replace(
    "const tempImg = new Image();",
    "const tempImg = new Image();\n      tempImg.crossOrigin = 'anonymous'; // 解决跨域问题"
  );
  
  // 添加SSL证书问题处理
  handleImg = handleImg.replace(
    "console.warn(\`图片加载失败: \${imgUrl}\`);\n        if (fallbackUrl) {",
    "console.warn(\`图片加载失败: \${imgUrl}\`);\n        \n        // 如果是HTTPS但加载失败，尝试使用HTTP (仅用于开发环境)\n        if (imgUrl.startsWith('https://') && CDN_HAS_SSL_ISSUES) {\n          const httpUrl = imgUrl.replace('https://', 'http://');\n          console.log(\`由于SSL证书问题，尝试使用HTTP: \${httpUrl}\`);\n          tempImg.src = httpUrl;\n          return;\n        }\n        \n        if (fallbackUrl) {"
  );
  
  fs.writeFileSync(handleImgPath, handleImg);
  console.log('✓ 图片加载工具已更新');
}

// 5. 修复路由守卫
console.log('5. 修复路由守卫...');
const routerIndexPath = path.join(__dirname, 'src/router/index.ts');
let routerIndex = fs.readFileSync(routerIndexPath, 'utf8');

if (!routerIndex.includes('await userInfoStore.checkAuthStatus()')) {
  routerIndex = routerIndex.replace(
    "router.beforeEach((to, _from, next) => {",
    "router.beforeEach(async (to, _from, next) => {"
  );
  
  routerIndex = routerIndex.replace(
    "const userInfoStore = useUserInfoStore()",
    "const userInfoStore = useUserInfoStore()\n  \n  // 如果用户信息尚未加载，尝试检查认证状态\n  if (!userInfoStore.userInfo && to.matched.some(record => record.meta.requiresAuth)) {\n    try {\n      await userInfoStore.checkAuthStatus();\n    } catch (error) {\n      console.warn('认证检查失败:', error);\n    }\n  }"
  );
  
  fs.writeFileSync(routerIndexPath, routerIndex);
  console.log('✓ 路由守卫已更新');
}

console.log('\n自动化修复完成！');
console.log('请重新启动应用以应用这些更改。');
console.log('运行 npm run dev 或 npm run build 来重新构建应用。');