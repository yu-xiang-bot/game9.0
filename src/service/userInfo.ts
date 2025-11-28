import { UserInfo } from '@/stores/userInfo';
import { userService } from './supabaseService';

export type EditUserParams = {
  id: string
  username?: string
  phone?: string
  avatar?: string
}

/** 修改用户信息 */
export const editUserApi = async (
  params: EditUserParams
) => {
  const { id, ...updates } = params;
  return userService.editUser(id, updates);
}

export type EditPassParams = {
  id: string
  password: string
  newPassword: string
}

/** 修改密码 */
export const editPassApi = async (
  params: EditPassParams
) => {
  const { id, password, newPassword } = params;
  return userService.editPassword(id, password, newPassword);
}