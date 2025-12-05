<script setup lang='ts'>
import { ElDrawer, ElInput, ElMessage, ElForm, ElFormItem, FormInstance, ElProgress } from 'element-plus';
import { reactive, ref, watch, onMounted } from 'vue';
import { editUserApi, autoSaveUserInfoApi, uploadAvatarApi } from '@/service/userInfo'
import { UserInfo, useUserInfoStore } from '@/stores/userInfo';
import { validatePhone } from '@/utils/validate';
import { testAvatarUpload } from '@/utils/testAvatarUpload';

const {visible} = defineProps({
  visible: {
    type: Boolean,
    default: false,
    require: true
  }
})

const emit = defineEmits<{
  (event: 'update:visible', v: boolean): void
}>()

const userInfoStore = useUserInfoStore()

const userInfo = reactive({
  avatar: userInfoStore.userInfo?.avatar ?? '',
  name: userInfoStore.userInfo?.name ?? '',
  phone: userInfoStore.userInfo?.phone ?? '',
  email: userInfoStore.userInfo?.email ?? '',
  gender: userInfoStore.userInfo?.gender ?? '',
  bio: userInfoStore.userInfo?.bio ?? '',
})

// 自动保存防抖
const autoSaveTimer = ref<NodeJS.Timeout>()
const isAutoSaving = ref(false)

// 自动保存函数
const autoSaveToDatabase = (field: string, value: any) => {
  if (!userInfoStore.userInfo?.id) return
  
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
  
  autoSaveTimer.value = setTimeout(async () => {
    if (isAutoSaving.value) return
    
    isAutoSaving.value = true
    try {
      const updates: any = {}
      if (field === 'username') {
        updates.username = value
      } else if (field === 'avatar') {
        updates.avatar_url = value
      } else {
        updates[field] = value
      }
      
      await autoSaveUserInfoApi({
        id: userInfoStore.userInfo?.id || '',
        ...updates
      })
      console.log(`自动保存 ${field} 成功`)
    } catch (error) {
      console.error('自动保存失败:', error)
    } finally {
      isAutoSaving.value = false
    }
  }, 2000)
}

const userFormRef = ref<FormInstance>()
const isUploading = ref(false)
const avatarPreview = ref('')
const uploadProgress = ref(0)
const avatarInput = ref<HTMLInputElement>()

const rules = reactive({
  name: [
    { required: true, message: '请输入您的姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名应在2-20位之间', trigger: 'blur' },
  ] as any,
  phone: [{ validator: validatePhone, trigger: 'blur' }] as any,
  email: [
    { required: true, message: '请输入您的邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ] as any,
})

// 头像上传
const handleAvatarChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      ElMessage.error('请选择图片文件')
      return
    }
    
    // 验证文件大小 (限制为5MB)
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过5MB')
      return
    }
    
    isUploading.value = true
    uploadProgress.value = 0
    
    // 先预览
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
    
    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        if (uploadProgress.value < 90) {
          uploadProgress.value += Math.random() * 20
        }
      }, 100)
      
      console.log('开始上传头像:', { 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type,
        userId: userInfoStore.userInfo?.id 
      })
      
      // 上传到Supabase Storage
      const res = await uploadAvatarApi({
        userId: userInfoStore.userInfo?.id || '',
        file: file
      })
      
      clearInterval(progressInterval)
      uploadProgress.value = 100
      
      if (res.code === 200) {
        ElMessage.success('头像上传成功')
        avatarPreview.value = res.data.url
        
        // 更新用户信息到store
        if (userInfoStore.userInfo) {
          userInfoStore.userInfo.avatar = res.data.url
          userInfoStore.userInfo.avatar_url = res.data.url
        }
        
        console.log('头像上传成功:', res.data)
      } else {
        const errorMsg = (res.data as any)?.message || '上传失败'
        ElMessage.error(errorMsg)
        console.error('头像上传失败:', res.data)
        
        // 如果是权限或配置问题，提供调试建议
        if (errorMsg.includes('存储桶') || errorMsg.includes('权限')) {
          ElMessage({
            message: '请检查Supabase存储桶配置，或查看控制台获取详细信息',
            type: 'warning',
            duration: 5000
          })
        }
      }
    } catch (error) {
      console.error('头像上传错误:', error)
      ElMessage.error('上传失败，请重试')
    } finally {
      isUploading.value = false
      setTimeout(() => {
        uploadProgress.value = 0
      }, 1000)
    }
  }
}

// 保存用户信息
const saveUserInfo = async () => {
  userFormRef.value?.validate(async valid => {
    if(valid) {
      try {
        const res = await editUserApi({
          id: userInfoStore.userInfo!.id,
          username: userInfo.name,
          phone: userInfo.phone,
          email: userInfo.email,
          gender: userInfo.gender,
          bio: userInfo.bio,
          avatar_url: avatarPreview.value || userInfo.avatar
        })
        if (res.code === 200 && res.data) {
          userInfoStore.userInfo = res.data as UserInfo
          ElMessage.success('个人信息更新成功')
        } else {
          ElMessage.error((res.data as any)?.message || '更新失败')
        }
      } catch (error) {
        console.log('error: ', error);
        ElMessage.error('更新失败，请重试')
      }
    }
  })
}

// 监听表单变化并自动保存
watch(() => userInfo.name, (newValue) => {
  if (newValue !== userInfoStore.userInfo?.name) {
    autoSaveToDatabase('username', newValue)
  }
})

watch(() => userInfo.phone, (newValue) => {
  if (newValue !== userInfoStore.userInfo?.phone) {
    autoSaveToDatabase('phone', newValue)
  }
})

watch(() => userInfo.email, (newValue) => {
  if (newValue !== userInfoStore.userInfo?.email) {
    autoSaveToDatabase('email', newValue)
  }
})

watch(() => userInfo.gender, (newValue) => {
  if (newValue !== userInfoStore.userInfo?.gender) {
    autoSaveToDatabase('gender', newValue)
  }
})

watch(() => userInfo.bio, (newValue) => {
  if (newValue !== userInfoStore.userInfo?.bio) {
    autoSaveToDatabase('bio', newValue)
  }
})

// 监听头像变化并自动保存
watch(() => avatarPreview.value, (newValue) => {
  if (newValue && newValue !== userInfoStore.userInfo?.avatar) {
    autoSaveToDatabase('avatar', newValue)
  }
})

// 重置表单
const resetForm = () => {
  const userData = userInfoStore.userInfo as UserInfo
  userInfo.name = userData.name || ''
  userInfo.phone = userData.phone || ''
  userInfo.email = userData.email || ''
  userInfo.gender = userData.gender || ''
  userInfo.bio = userData.bio || ''
  avatarPreview.value = userData.avatar || ''
}

const initData = () => {
  const userData = userInfoStore.userInfo as UserInfo
  userInfo.avatar = userData.avatar || ''
  userInfo.name = userData.name || ''
  userInfo.phone = userData.phone || ''
  userInfo.email = userData.email || ''
  userInfo.gender = userData.gender || ''
  userInfo.bio = userData.bio || ''
  avatarPreview.value = userData.avatar || ''
  
  // 开发环境测试上传功能
  if (import.meta.env.DEV && userData.id) {
    testAvatarUpload(userData.id)
  }
}

</script>

<template>
  <ElDrawer
    :modelValue="visible"
    direction="ltr"
    :size="600"
    @open="initData"
    @close="emit('update:visible', false)"
    class="user-info-drawer"
  >
    <template #header>
      <div class="drawer-header">
        <h4>个人信息设置</h4>
      </div>
    </template>
    
    <template #default>
      <div class="form-container">
        <ElForm
          ref="userFormRef"
          :model="userInfo"
          :rules="rules"
          hide-required-asterisk
          label-position="top"
          class="user-form"
        >
          <!-- 头像上传 -->
          <div class="avatar-section">
            <label class="form-label">头像</label>
            <div class="avatar-upload-container">
              <div class="avatar-upload" @click="!isUploading && avatarInput?.click()">
                <input 
                  ref="avatarInput"
                  type="file" 
                  accept="image/*" 
                  @change="handleAvatarChange"
                  style="display: none;"
                >
                <div v-if="!avatarPreview && !isUploading" class="avatar-placeholder">
                  <span class="iconfont icon-user"></span>
                  <span>点击上传头像</span>
                </div>
                <div v-else-if="isUploading" class="avatar-uploading">
                  <ElProgress 
                    type="circle" 
                    :percentage="uploadProgress" 
                    :width="80"
                    :stroke-width="6"
                  />
                  <span class="uploading-text">上传中...</span>
                </div>
                <img v-else :src="avatarPreview" class="avatar-preview" alt="用户头像">
              </div>
              <div class="avatar-tips">
                <p>支持JPG、PNG格式，文件大小不超过5MB</p>
              </div>
            </div>
          </div>

          <!-- 基本信息部分 -->
          <div class="form-section">
            <h5 class="section-title">基本信息</h5>
            
            <ElFormItem label="姓名" prop="name">
              <ElInput 
                v-model="userInfo.name" 
                placeholder="请输入您的姓名"
                maxlength="20"
                show-word-limit
                class="custom-input"
              >
                <template #prefix>
                  <span class="iconfont icon-user input-icon"></span>
                </template>
              </ElInput>
            </ElFormItem>

            <ElFormItem label="手机号码" prop="phone">
              <ElInput 
                v-model="userInfo.phone" 
                placeholder="请输入您的手机号码"
                maxlength="11"
                class="custom-input"
              >
                <template #prefix>
                  <span class="iconfont icon-home input-icon"></span>
                </template>
              </ElInput>
            </ElFormItem>

            <ElFormItem label="邮箱" prop="email">
              <ElInput 
                v-model="userInfo.email" 
                type="email"
                placeholder="请输入您的邮箱"
                class="custom-input"
              >
                <template #prefix>
                  <span class="iconfont icon-user input-icon"></span>
                </template>
              </ElInput>
            </ElFormItem>

            <ElFormItem label="性别">
              <div class="gender-options">
                <label class="gender-option">
                  <input type="radio" name="gender" v-model="userInfo.gender" value="male">
                  <span class="radio-text">男</span>
                </label>
                <label class="gender-option">
                  <input type="radio" name="gender" v-model="userInfo.gender" value="female">
                  <span class="radio-text">女</span>
                </label>
                <label class="gender-option">
                  <input type="radio" name="gender" v-model="userInfo.gender" value="other">
                  <span class="radio-text">保密</span>
                </label>
              </div>
            </ElFormItem>

            <ElFormItem label="个人简介">
              <ElInput 
                v-model="userInfo.bio" 
                type="textarea"
                :rows="3"
                placeholder="请简要介绍一下自己"
                maxlength="200"
                show-word-limit
                class="custom-textarea"
              />
            </ElFormItem>
          </div>

          <!-- 按钮组 -->
          <div class="button-group">
            <button type="button" class="secondary-button" @click="resetForm">
              重置
            </button>
            <button type="button" class="primary-button" @click="saveUserInfo">
              保存信息
            </button>
          </div>
        </ElForm>
      </div>
    </template>
  </ElDrawer>
</template>

<style lang='less' scoped>
.user-info-drawer {
:deep(.el-drawer__body) {
  padding: 0;
  background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
  
:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 24px 28px;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%);
  border-bottom: 1px solid #ccfbf1;
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.1);
}
}

.drawer-header {
  h4 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    color: #0f766e;
    background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.form-container {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.user-form {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(6, 182, 212, 0.08);
  padding: 28px;
  border: 1px solid #e6fffa;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.avatar-upload-container {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

.avatar-upload {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px dashed #a5f3fc;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.15);
  
  &:hover {
    border-color: #06b6d4;
    background: linear-gradient(135deg, #e6fffa 0%, #ccfbf1 100%);
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(6, 182, 212, 0.25);
  }
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #14b8a6;
  font-size: 12px;
  font-weight: 500;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-uploading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  
  .uploading-text {
    margin-top: 8px;
    font-size: 12px;
    color: #14b8a6;
    font-weight: 500;
  }
}

.avatar-tips {
  margin-top: 12px;
  text-align: center;
  
  p {
    margin: 0;
    font-size: 12px;
    color: #64748b;
    line-height: 1.4;
  }
}

.form-section {
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f766e;
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #ccfbf1;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, #06b6d4, #14b8a6);
    border-radius: 1px;
  }
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
  line-height: 1.5;
  padding-bottom: 6px;
}

.custom-input {
  :deep(.el-input__wrapper) {
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    box-shadow: 0 1px 3px rgba(6, 182, 212, 0.1);
    transition: all 0.3s ease;
    padding-left: 36px;
    
    &:hover {
      border-color: #06b6d4;
      box-shadow: 0 2px 8px rgba(6, 182, 212, 0.15);
    }
    
    &.is-focus {
      border-color: #06b6d4;
      box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15), 0 2px 8px rgba(6, 182, 212, 0.2);
    }
  }
}

.custom-textarea {
  :deep(.el-textarea__inner) {
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    box-shadow: 0 1px 3px rgba(6, 182, 212, 0.1);
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #06b6d4;
      box-shadow: 0 2px 8px rgba(6, 182, 212, 0.15);
    }
    
    &:focus {
      border-color: #06b6d4;
      box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15), 0 2px 8px rgba(6, 182, 212, 0.2);
    }
  }
}

.input-icon {
  color: #14b8a6;
  font-size: 14px;
}

.gender-options {
  display: flex;
  gap: 20px;
}

.gender-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  
  &:hover {
    background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%);
    border-color: #a5f3fc;
    transform: translateY(-1px);
  }
  
  input[type="radio"] {
    margin-right: 8px;
    accent-color: #06b6d4;
  }
  
  .radio-text {
    color: #0f172a;
    font-size: 14px;
    font-weight: 500;
  }
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 28px;
  border-top: 1px solid #ccfbf1;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 0;
    width: 100px;
    height: 1px;
    background: linear-gradient(90deg, #06b6d4, transparent);
  }
}

.primary-button {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
    transform: translateY(-1px);
  }
}

.secondary-button {
  background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%);
  color: #0d9488;
  border: 1px solid #ccfbf1;
  border-radius: 10px;
  padding: 12px 24px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #e6fffa 0%, #ccfbf1 100%);
    border-color: #99f6e4;
    transform: translateY(-1px);
  }
}
</style>