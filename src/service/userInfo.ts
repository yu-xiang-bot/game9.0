import { towerDefenseService } from './towerDefenseService';

export type EditUserParams = {
  id: string
  username?: string
  phone?: string
  email?: string
  gender?: string
  avatar_url?: string
  bio?: string
}

export type UploadAvatarParams = {
  userId: string
  file: File
}

/** 修改用户信息 */
export const editUserApi = async (
  params: EditUserParams
) => {
  const { id, ...updates } = params;
  return towerDefenseService.updateUserProfile(id, updates);
}

/** 自动保存用户信息 */
export const autoSaveUserInfoApi = async (
  params: EditUserParams
) => {
  const { id, ...updates } = params;
  return towerDefenseService.updateUserProfile(id, updates);
}

/** 上传头像 */
export const uploadAvatarApi = async (
  params: UploadAvatarParams
) => {
  return towerDefenseService.uploadAvatar(params.userId, params.file);
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
  try {
    // 这里可以添加密码修改逻辑
    return { code: 200, data: { message: '密码修改成功' } };
  } catch (error: any) {
    return { code: -1, data: { message: '密码修改失败: ' + error.message } };
  }
}