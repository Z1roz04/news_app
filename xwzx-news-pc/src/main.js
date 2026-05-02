import { createApp } from 'vue'
import router from './router/router.js'
import App from './App.vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import "./tailwindcss.css"
import i18n from "./i18n"
const app=createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(router).use(pinia).use(ElementPlus,{
  i18n: i18n.global.t 
}).use(i18n)
app.mount('#app');
