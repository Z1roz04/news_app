<script setup>
import { reactive, ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref()
let loadingInstance = null

onBeforeUnmount(() => {
  loadingInstance?.close()
  loadingInstance = null
})

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 1, max: 50, message: '账号长度为 1～50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 128, message: '密码至少 6 位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  try {
    await loginFormRef.value.validate()
  } catch {
    return
  }

  loadingInstance = ElLoading.service({
    lock: false,
    text: '登录中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    const result = await userStore.login({
      username: loginForm.username.trim(),
      password: loginForm.password,
    })
    if (result?.success) {
      ElMessage.success(result.message || '登录成功')
      router.push('/home')
    } else {
      ElMessage.error(result?.message || '登录失败，请稍后再试')
    }
  } catch (err) {
    ElMessage.error(err.message || '登录失败，请稍后再试')
  } finally {
    loadingInstance?.close()
    loadingInstance = null
  }
}
</script>

<template>
  <div class="login-wrapper">
   <el-button 
  type="primary" 
  icon="arrow-left" 
  @click="router.back()"
  class="back-btn"
>
  返回
</el-button>
    <div class="login-card">
      <h2 class="login-title">欢迎登录</h2>
      <p></p>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入账号"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="至少 6 位"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            native-type="submit"
            class="w-full"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="text-center text-sm text-gray-500 mt-4">
        没有账号？
        <router-link to="/register" class="text-red-600">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  width: 100vw;
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 460px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  padding: 48px 40px;
}

.login-title {
  font-size: 26px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  text-align: center;
}


.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.w-full {
  width: 100%;
}

.back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 99;
}
</style>