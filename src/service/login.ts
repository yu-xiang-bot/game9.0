import { UserInfo } from '@/stores/userInfo';
import { userService } from './supabaseService';

/** 登录 */
export type LoginApiParams = {
  username: string
  password: string
}
export const loginApi = async (
  params: LoginApiParams
) => {
  return userService.login(params.username, params.password);
}

/** 退出登录 */
export const logoutApi = async () => {
  // Supabase的退出登录逻辑在前端处理
  return Promise.resolve({ code: 200, data: { message: '退出登录成功' } });
}

/** 注册 */
export const registerApi = async (params: LoginApiParams) => {
  return userService.register(params.username, params.password);
}
