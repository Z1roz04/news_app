<script setup>

import { reactive, ref, onBeforeUnmount } from 'vue'

import { useRouter } from 'vue-router'

import { ElMessage, ElLoading } from 'element-plus'

import { useUserStore } from '../store/user'



const router = useRouter()

const userStore = useUserStore()

const registerFormRef = ref()
let loadingInstance = null

onBeforeUnmount(() => {
  loadingInstance?.close()
  loadingInstance = null
})



const registerForm = reactive({

  username: '',

  password: '',

  confirm: ''

})



const validateConfirm = (_rule, value, callback) => {

  if (value !== registerForm.password) {

    callback(new Error('两次密码不一致'))

  } else {

    callback()

  }

}



const registerRules = {

  username: [

    { required: true, message: '请输入账号', trigger: 'blur' },

    { min: 1, max: 50, message: '账号长度为 1～50 个字符', trigger: 'blur' }

  ],

  password: [

    { required: true, message: '请输入密码', trigger: 'blur' },

    { min: 6, max: 128, message: '密码至少 6 位，最长 128 位', trigger: 'blur' }

  ],

  confirm: [

    { required: true, message: '请确认密码', trigger: 'blur' },

    { validator: validateConfirm, trigger: 'blur' }

  ]

}



const handleregister = async () => {

  if (!registerFormRef.value) return

  try {

    await registerFormRef.value.validate()

  } catch {

    return

  }



  loadingInstance = ElLoading.service({

    lock: false,

    text: '注册中...',

    background: 'rgba(0, 0, 0, 0.7)',

  })



  try {

    const result = await userStore.register({

      username: registerForm.username.trim(),

      password: registerForm.password

    })

    if (result?.success) {

      ElMessage.success(result.message || '注册成功')

      router.push('/home')

    } else {

      ElMessage.error(result?.message || '注册失败，请稍后再试')

    }

  } catch (err) {

    ElMessage.error(err.message || '注册失败，请稍后再试')

  } finally {

    loadingInstance?.close()

    loadingInstance = null

  }

}

</script>



<template>

  <div class="register-wrapper">

    <el-button

      type="primary"

      icon="arrow-left"

      @click="router.back()"

      class="back-btn"

    >

      返回

    </el-button>

    <div class="register-card">

      <h2 class="register-title">注册用户</h2>

      <p></p>

      <el-form

        ref="registerFormRef"

        :model="registerForm"

        :rules="registerRules"

        class="register-form"

        label-width="80px"

        @submit.prevent="handleregister"

      >

        <el-form-item label="账号" prop="username">

          <el-input

            v-model="registerForm.username"

            placeholder="请输入账号"

            size="large"

            clearable

          />

        </el-form-item>



        <el-form-item label="密码" prop="password">

          <el-input

            v-model="registerForm.password"

            type="password"

            placeholder="至少 6 位"

            size="large"

            show-password

          />

        </el-form-item>



        <el-form-item label="确认密码" prop="confirm">

          <el-input

            v-model="registerForm.confirm"

            type="password"

            placeholder="请再次输入密码"

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

            注册

          </el-button>

        </el-form-item>

      </el-form>

    </div>

  </div>

</template>



<style scoped>

.register-wrapper {

  width: 100vw;

  min-height: 100vh;

  background: #f5f7fa;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 20px;

}



.register-card {

  width: 100%;

  max-width: 460px;

  background: #fff;

  border-radius: 16px;

  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);

  padding: 48px 40px;

}



.register-title {

  font-size: 26px;

  font-weight: 700;

  color: #1e293b;

  margin: 0 0 8px 0;

  text-align: center;

}



.register-form {

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

