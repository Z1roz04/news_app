import { defineStore } from "pinia";
import { apiConfig } from "../config/api";
import axios from "axios";


export const useUserStore=defineStore("user",{
 state: () => ({
   userInfo:null,
   token: '',
   isLogin: null,
   userBio:"个人简介"
 }),

 getters:{
    getUserInfo:(state) => state.userInfo,
    getToken:(state) => state.token,
    getLoginStatus:(state) => state.isLogin,
    getUserBio:(state) => state.userBio
 },

 actions:{
    async Login(userData){
        try{
            const response=await axios.post(`${apiConfig.baseURL}/api/user/login`,{
                username:userData.username,
                password:userData.password
            });
            
            if(response.data && response.data.code === 200){
                const userInfo=response.data.data.userInfo
                const token=response.data.data.token

                this.userInfo=userInfo;
                this.token=token;
                this.isLogin=true;
                
                return{
                    success:true,
                    message:"登录成功"
                };
            }else{
                return{
                    success:false,
                    message:response.data.message || '登录失败'
                };
            } 
        }catch(error){
            console.error('登录请求失败:', error);
            const d=error.response?.data;
            const msg=typeof d?.message==='string'?d.message:(typeof d?.detail==='string'?d.detail:null);
            return{
                success:false,
                message:msg||'登录请求失败，请稍后再试'
            };
        }
    },
    async register(userData){
        try{
            const response=await axios.post(`${apiConfig.baseURL}/api/user/register`,{
                username:userData.username,
                password:userData.password
            });
            if (response.data && response.data.code === 200){
                const userInfo=response.data.data.userInfo
                const token=response.data.data.token

                this.userInfo=userInfo;
                this.token=token;
                this.isLogin=true;

                return{
                    success:true,
                    message:'注册成功'
                };
            }else{
                return{
                    success:false,
                    message:response.data.message || '注册失败'
                };
            }
        }catch(error){
            console.error('注册请求失败:',error);
            const d=error.response?.data;
            const msg=typeof d?.message==='string'?d.message:(typeof d?.detail==='string'?d.detail:null);
            return{
                success:false,
                message:msg||'注册请求失败'
            };
        }
    },

    logout(){
        this.userInfo=null;
        this.token="";
        this.isLogin=false;
    },

    async getUserInfoDetail(){
        try{
            if(!this.token){
                return{
                    success:false,
                    message:'未登录'
                };
            }

            const response=await axios.get(`${apiConfig.baseURL}/api/user/info`,{
                headers:{
                    Authorization:this.token
                }
            });

            if (response.data && response.data.code === 200){
                this.userInfo=response.data.data;

                return{
                    success:true,
                    message:"获取用户信息成功",
                    data: response.data.data
                };
            }else {
                return {
                    success: false,
                    message: response.data.message || '获取用户信息失败'
                };
            }
        }catch (error) {
        console.error('获取用户信息请求失败:', error);
        return {
          success: false,
          message: error.response?.data?.message || '获取用户信息请求失败，请稍后再试'
        };
      }
    },
    async updateUserBio(bio) {
      return this.updateProfile({ bio })
    },

    /**
     * 更新个人资料（昵称、头像、性别、简介等，传需要修改的字段即可）
     */
    async updateProfile(payload) {
      try {
        if (!this.token) {
          return { success: false, message: '未登录' }
        }
        const body = {}
        const keys = ['nickname', 'avatar', 'gender', 'bio', 'phone']
        for (const k of keys) {
          if (Object.prototype.hasOwnProperty.call(payload, k)) {
            body[k] = payload[k]
          }
        }
        if (Object.keys(body).length === 0) {
          return { success: false, message: '没有要保存的字段' }
        }
        const response = await axios.put(
          `${apiConfig.baseURL}/api/user/update`,
          body,
          { headers: { Authorization: this.token } },
        )
        if (response.data && response.data.code === 200) {
          this.userInfo = response.data.data
          return {
            success: true,
            message: response.data.message || '保存成功',
          }
        }
        return {
          success: false,
          message: response.data?.message || '保存失败',
        }
      } catch (error) {
        console.error('更新资料请求失败:', error)
        const d = error.response?.data
        const msg =
          typeof d?.message === 'string'
            ? d.message
            : typeof d?.detail === 'string'
              ? d.detail
              : null
        return {
          success: false,
          message: msg || '更新资料失败，请稍后再试',
        }
      }
    },
    async updatePassword(oldPassword, newPassword) {
      try {
        if (!this.token) {
          return {
            success: false,
            message: '未登录'
          };
        }
        const response = await axios.put(`${apiConfig.baseURL}/api/user/password`, 
          { 
            oldPassword,
            newPassword 
          },
          {
            headers: {
              Authorization: this.token
            }
          }
        );
        if (response.data && response.data.code === 200) {
          return {
            success: true,
            message: '密码修改成功'
          };
        } else {
          return {
            success: false,
            message: response.data.message || '密码修改失败'
          };
        }
      } catch (error) {
        console.error('修改密码请求失败:', error);
        return {
          success: false,
          message: error.response?.data?.message || '修改密码请求失败，请稍后再试'
        };
      }
    }
  },
  persist: {
    key: 'user-store',
    storage: localStorage,
  },
})