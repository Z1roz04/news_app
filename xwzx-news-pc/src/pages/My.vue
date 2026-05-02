<template>
  <div class="my-page">
    <template v-if="!isAuthed">
      <el-result icon="warning" title="请先登录" sub-title="登录后可管理个人信息与密码">
        <template #extra>
          <el-button type="primary" @click="router.push('/login')">去登录</el-button>
          <el-button @click="router.push('/register')">注册账号</el-button>
        </template>
      </el-result>
    </template>

    <template v-else>
      <div class="my-inner">
        <el-page-header content="个人中心" @back="router.back()" />

        <el-card class="card" shadow="never">
          <template #header>
            <span class="card-title">基本信息</span>
          </template>
          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-width="96px"
            class="profile-form"
            @submit.prevent
          >
            <el-form-item label="用户名">
              <el-input :model-value="userInfo?.username || ''" disabled />
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="profileForm.nickname" placeholder="选填" maxlength="50" show-word-limit clearable />
            </el-form-item>
            <el-form-item label="头像 URL" prop="avatar">
              <div class="avatar-row">
                <el-input v-model="profileForm.avatar" placeholder="图片地址，选填" clearable />
                <el-avatar :size="48" :src="profileForm.avatar?.trim() || undefined" class="preview">
                  <el-icon><User /></el-icon>
                </el-avatar>
              </div>
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="profileForm.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
                <el-radio label="unknown">保密</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="个人简介" prop="bio">
              <el-input
                v-model="profileForm.bio"
                type="textarea"
                :rows="4"
                placeholder="选填，最多 500 字"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="savingProfile" @click="submitProfile">保存资料</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="card" shadow="never">
          <template #header>
            <span class="card-title">账号安全</span>
          </template>
          <p class="hint">定期修改密码有助于保护账号安全。</p>
          <el-button type="primary" plain @click="passwordDialogVisible = true">修改密码</el-button>
        </el-card>
      </div>
    </template>

    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="440px"
      destroy-on-close
      @closed="resetPasswordForm"
    >
      <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="100px">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="pwdForm.oldPassword" type="password" show-password autocomplete="current-password" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="pwdForm.newPassword" type="password" show-password autocomplete="new-password" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="pwdForm.confirmPassword" type="password" show-password autocomplete="new-password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="pwdSubmitting" @click="submitPassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const isAuthed = computed(() => Boolean(userStore.token))

const profileFormRef = ref()
const pwdFormRef = ref()
const savingProfile = ref(false)
const pwdSubmitting = ref(false)
const passwordDialogVisible = ref(false)

const profileForm = reactive({
  nickname: '',
  avatar: '',
  gender: 'unknown',
  bio: '',
})

function syncProfileFormFromStore() {
  const u = userInfo.value
  if (!u) return
  profileForm.nickname = u.nickname ?? ''
  profileForm.avatar = u.avatar ?? ''
  profileForm.gender = u.gender || 'unknown'
  profileForm.bio = u.bio ?? ''
}

watch(userInfo, syncProfileFormFromStore, { immediate: true })

const profileRules = {
  nickname: [{ max: 50, message: '昵称不超过 50 字', trigger: 'blur' }],
  avatar: [{ max: 255, message: '地址过长', trigger: 'blur' }],
  bio: [{ max: 500, message: '简介不超过 500 字', trigger: 'blur' }],
}

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validateConfirmPwd = (_rule, value, callback) => {
  if (value !== pwdForm.newPassword) {
    callback(new Error('两次输入的新密码不一致'))
  } else {
    callback()
  }
}

const pwdRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 128, message: '新密码 6～128 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPwd, trigger: 'blur' },
  ],
}

async function loadUser() {
  if (!userStore.token) return
  const res = await userStore.getUserInfoDetail()
  if (!res.success) {
    ElMessage.warning(res.message || '获取用户信息失败')
  }
}

onMounted(async () => {
  if (!userStore.token) return
  await loadUser()
})

async function submitProfile() {
  if (!profileFormRef.value) return
  try {
    await profileFormRef.value.validate()
  } catch {
    return
  }
  savingProfile.value = true
  try {
    const res = await userStore.updateProfile({
      nickname: profileForm.nickname.trim() || null,
      avatar: profileForm.avatar.trim() || null,
      gender: profileForm.gender || null,
      bio: profileForm.bio.trim() || null,
    })
    if (res.success) {
      ElMessage.success(res.message || '保存成功')
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } finally {
    savingProfile.value = false
  }
}

function resetPasswordForm() {
  pwdForm.oldPassword = ''
  pwdForm.newPassword = ''
  pwdForm.confirmPassword = ''
  pwdFormRef.value?.resetFields?.()
}

async function submitPassword() {
  if (!pwdFormRef.value) return
  try {
    await pwdFormRef.value.validate()
  } catch {
    return
  }
  pwdSubmitting.value = true
  try {
    const res = await userStore.updatePassword(pwdForm.oldPassword, pwdForm.newPassword)
    if (res.success) {
      ElMessage.success(res.message || '密码修改成功')
      passwordDialogVisible.value = false
      resetPasswordForm()
    } else {
      ElMessage.error(res.message || '修改失败')
    }
  } finally {
    pwdSubmitting.value = false
  }
}
</script>

<style scoped>
.my-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 24px 48px;
}

.my-inner {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  border-radius: 12px;
}

.card-title {
  font-weight: 600;
  font-size: 16px;
  color: #0f172a;
}

.profile-form {
  max-width: 560px;
}

.avatar-row {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.avatar-row .el-input {
  flex: 1;
}

.preview {
  flex-shrink: 0;
}

.hint {
  margin: 0 0 16px;
  font-size: 14px;
  color: #64748b;
}

:deep(.el-page-header) {
  margin-bottom: 8px;
}
</style>
