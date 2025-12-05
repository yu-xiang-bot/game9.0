# 塔防联盟 API 接口文档

## 项目概述

塔防联盟是一款基于Vue3和TypeScript开发的网页塔防游戏，支持PC端和移动端。项目采用前后端分离架构，前端使用Vue3 + TypeScript，后端使用Supabase(PostgreSQL)作为数据库服务。

### 技术栈

- **前端框架**：Vue 3.3.4 + TypeScript 5.1.6
- **构建工具**：Vite 3.2.0
- **状态管理**：Pinia 2.0.28
- **HTTP客户端**：Axios
- **数据库**：Supabase (PostgreSQL)
- **游戏渲染**：Canvas API + Web Worker

## 基础配置

### API基础URL

```typescript
// 开发环境
baseURL: ''

// 生产环境
// 通过环境变量配置
const API_URL = import.meta.env.VITE_API_URL || ''
```

### 请求头配置

```typescript
headers: {
  'Content-Type': 'application/json; charset=utf-8'
}
```

### 响应格式

所有API响应遵循统一格式：

```typescript
{
  code: number,    // 状态码：200 成功，-1 失败，401 未授权
  data: any,       // 响应数据
  message?: string // 错误信息（仅错误时返回）
}
```

## 1. 用户认证接口

### 1.1 用户登录

**接口地址**: `/api/login` (实际通过Supabase API实现)

**请求方式**: POST

**请求参数**:

```typescript
interface LoginParams {
  username: string;  // 用户名
  password: string;  // 密码
}
```

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "id": "uuid-string",
    "name": "username",
    "phone": "13800138000",
    "avatar": "avatar-url",
    "isBan": 0,
    "gameToken": "supabase_token_uuid"
  }
}
```

**错误响应**:

```json
{
  "code": -1,
  "data": {
    "message": "用户名或密码错误"
  }
}
```

### 1.2 用户注册

**接口地址**: `/api/register` (实际通过Supabase API实现)

**请求方式**: POST

**请求参数**:

```typescript
interface RegisterParams {
  username: string;  // 用户名
  password: string;  // 密码
}
```

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "id": "uuid-string",
    "name": "username",
    "phone": "",
    "avatar": "",
    "isBan": 0,
    "gameToken": "supabase_token_uuid"
  }
}
```

**错误响应**:

```json
{
  "code": -1,
  "data": {
    "message": "用户名已存在"
  }
}
```

### 1.3 退出登录

**接口地址**: 无 (前端处理)

**请求方式**: POST

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "message": "退出登录成功"
  }
}
```

## 2. 用户信息管理接口

### 2.1 修改用户信息

**接口地址**: `/api/user/edit` (实际通过Supabase API实现)

**请求方式**: PUT

**请求参数**:

```typescript
interface EditUserParams {
  id: string;         // 用户ID
  username?: string;   // 用户名（可选）
  phone?: string;      // 手机号（可选）
  avatar?: string;     // 头像URL（可选）
}
```

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "id": "uuid-string",
    "name": "new-username",
    "phone": "13900139000",
    "avatar": "new-avatar-url",
    "isBan": 0,
    "gameToken": "supabase_token_uuid"
  }
}
```

### 2.2 修改密码

**接口地址**: `/api/user/password` (实际通过Supabase API实现)

**请求方式**: PUT

**请求参数**:

```typescript
interface EditPasswordParams {
  id: string;         // 用户ID
  password: string;   // 旧密码
  newPassword: string; // 新密码
}
```

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "message": "密码修改成功"
  }
}
```

**错误响应**:

```json
{
  "code": -1,
  "data": {
    "message": "旧密码错误"
  }
}
```

## 3. 游戏数据接口

### 3.1 获取排行榜

**接口地址**: `/api/rank/list` (实际通过Supabase API实现)

**请求方式**: GET

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "data": [
    {
      "id": "uuid-string",
      "name": "username",
      "avatar": "avatar-url",
      "score": 150,
      "level": 15,
      "max": {
        "score": 150,
        "level": 15
      }
    },
    {
      "id": "uuid-string-2",
      "name": "username-2",
      "avatar": "avatar-url-2",
      "score": 120,
      "level": 12,
      "max": {
        "score": 120,
        "level": 12
      }
    }
  ]
}
```

### 3.2 上传游戏分数

**接口地址**: `/api/rank/update` (实际通过Supabase API实现)

**请求方式**: POST

**请求参数**:

```typescript
interface UpdateScoreParams {
  userId: string;  // 用户ID
  level: number;   // 选择的关卡
  score: number;   // 闯过的关卡数/得分
}
```

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "isUpdate": true,   // 是否更新了记录
    "score": 150        // 上传的分数
  }
}
```

## 4. 后台管理接口

### 4.1 获取所有用户

**接口地址**: `/api/admin/users` (实际通过Supabase API实现)

**请求方式**: GET

**请求参数**: 无

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "username": "username",
      "phone": "13800138000",
      "avatar": "avatar-url",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

### 4.2 获取所有游戏分数

**接口地址**: `/api/admin/scores` (实际通过Supabase API实现)

**请求方式**: GET

**请求参数**: 无

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "user_id": "user-uuid",
      "level": 15,
      "score": 150,
      "created_at": "2023-01-01T00:00:00Z",
      "users": {
        "username": "username",
        "avatar": "avatar-url"
      }
    }
  ]
}
```

### 4.3 获取用户详细信息

**接口地址**: `/api/admin/user/:id` (实际通过Supabase API实现)

**请求方式**: GET

**请求参数**: 
- id (路径参数): 用户ID

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "username": "username",
    "phone": "13800138000",
    "avatar": "avatar-url",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z",
    "scores": [
      {
        "id": "score-uuid",
        "user_id": "user-uuid",
        "level": 15,
        "score": 150,
        "created_at": "2023-01-01T00:00:00Z"
      }
    ]
  }
}
```

### 4.4 删除用户

**接口地址**: `/api/admin/user/:id` (实际通过Supabase API实现)

**请求方式**: DELETE

**请求参数**: 
- id (路径参数): 用户ID

**响应示例**:

```json
{
  "success": true
}
```

### 4.5 删除游戏记录

**接口地址**: `/api/admin/score/:id` (实际通过Supabase API实现)

**请求方式**: DELETE

**请求参数**: 
- id (路径参数): 分数记录ID

**响应示例**:

```json
{
  "success": true
}
```

### 4.6 获取统计数据

**接口地址**: `/api/admin/stats` (实际通过Supabase API实现)

**请求方式**: GET

**请求参数**: 无

**响应示例**:

```json
{
  "success": true,
  "data": {
    "totalUsers": 1000,       // 用户总数
    "totalScores": 5000,      // 分数记录总数
    "highestScore": 500,      // 最高分
    "activeUsers": 200        // 最近7天活跃用户数
  }
}
```

### 4.7 导出用户数据

**接口地址**: `/api/admin/export` (实际通过Supabase API实现)

**请求方式**: GET

**请求参数**: 无

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "username": "username",
      "phone": "13800138000",
      "avatar": "avatar-url",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z",
      "total_score": 1500,     // 总得分
      "max_level": 15,         // 最高关卡
      "games_played": 10       // 游戏次数
    }
  ]
}
```

## 5. 数据库表结构

### 5.1 用户表 (users)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | 主键，UUID |
| username | string | 用户名 |
| password | string | 密码 |
| phone | string | 手机号（可选） |
| avatar | string | 头像URL（可选） |
| created_at | string | 创建时间 |
| updated_at | string | 更新时间 |

### 5.2 游戏分数表 (game_scores)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | 主键，UUID |
| user_id | string | 用户ID（外键） |
| level | number | 关卡 |
| score | number | 得分 |
| created_at | string | 创建时间 |

## 6. 游戏内部通信接口

游戏页面与Web Worker之间通过postMessage API进行通信，主要消息类型如下：

### 6.1 主线程 -> Worker

| 消息类型 | 参数 | 说明 |
|----------|------|------|
| getMouse | {offsetX: number, offsetY: number} | 鼠标点击事件 |
| buildTower | {x: number, y: number, tname: string} | 建造塔防 |
| saleTower | towerId: string | 售卖塔防 |
| handleSkill | index: number | 使用技能 |
| isPause | boolean | 暂停/继续游戏 |

### 6.2 Worker -> 主线程

| 消息类型 | 参数 | 说明 |
|----------|------|------|
| unifiedMoney | number | 更新金币数量 |
| createAudio | {audioKey: string, id: string} | 创建音效 |
| handlerTower | {isShow: boolean, left: number, top: number, r: number, towerId: string, saleMoney: number} | 显示塔防操作范围 |
| showTowerBuilding | {left: number, top: number} | 显示塔防建造界面 |
| buildTowerCallback | {towerId: string, audioKey: string} | 塔防建造完成回调 |
| onLevelChange | level: number | 关卡变化 |
| onHpChange | hp: number | 生命值变化 |
| onWorkerReady | {x: number, y: number} | Worker准备就绪 |
| onProgress | progress: number | 加载进度 |
| playDomAudio | audioKey: string | 播放音效 |
| removeAudio | id: string | 移除音效 |

## 7. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| -1 | 请求失败，具体错误信息在message字段 |
| -2 | 特定业务错误 |
| 401 | 未授权，需要重新登录 |

## 8. 接口使用示例

### 8.1 登录示例

```typescript
import { loginApi } from '@/service/login';

// 登录请求
const login = async () => {
  try {
    const result = await loginApi({
      username: 'testuser',
      password: 'password123'
    });
    
    if (result.code === 200) {
      // 登录成功，保存用户信息
      localStorage.setItem('userInfo', JSON.stringify(result.data));
      console.log('登录成功:', result.data);
    } else {
      console.error('登录失败:', result.data.message);
    }
  } catch (error) {
    console.error('登录错误:', error);
  }
};
```

### 8.2 上传分数示例

```typescript
import { updateScoreApi } from '@/service/rank';

// 上传游戏分数
const uploadScore = async (userId: string, level: number, score: number) => {
  try {
    const result = await updateScoreApi({
      userId,
      level,
      score
    });
    
    if (result.code === 200) {
      if (result.data.isUpdate) {
        console.log('恭喜，创造了新纪录！', result.data.score);
      } else {
        console.log('未超越最高分，继续努力！', result.data.score);
      }
    } else {
      console.error('上传分数失败:', result.data.message);
    }
  } catch (error) {
    console.error('上传分数错误:', error);
  }
};
```

## 9. 注意事项

1. **安全性**：当前版本用户密码直接存储，生产环境应加密处理
2. **权限控制**：管理后台无额外权限验证，建议添加JWT或session验证
3. **错误处理**：所有API都实现了错误拦截和统一处理
4. **实时性**：通过Supabase的实时订阅功能可实现数据实时更新
5. **性能优化**：游戏核心逻辑在Web Worker中运行，避免阻塞主线程


---

**文档维护者**: 开发团队  
**最后更新**: 2023-07-01  
**联系方式**: 1829738634@qq.com