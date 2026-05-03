<template>
  <div class="settings-page">
    <el-card class="block" shadow="never">
      <template #header>
        <span class="block-title">{{ t('settings.personalization') }}</span>
      </template>
      <p class="desc">{{ t('settings.themeHint') }}</p>
      <div class="theme-grid">
        <button
          v-for="theme in themeList"
          :key="theme.id"
          type="button"
          class="theme-card"
          :class="{ active: currentThemeId === theme.id }"
          @click="onPickTheme(theme.id)"
        >
          <span class="theme-dot" :style="{ backgroundColor: theme.primaryColor }" />
          <span class="theme-name">{{ t(`settings.themes.${theme.id}`) }}</span>
        </button>
      </div>
    </el-card>

    <el-card class="block" shadow="never">
      <template #header>
        <span class="block-title">{{ t('settings.displayAndLanguage') }}</span>
      </template>
      <p class="desc">{{ t('settings.languageHint') }}</p>
      <el-form label-width="120px" class="lang-form">
        <el-form-item :label="t('settings.interfaceLanguage')">
          <el-select v-model="langDraft" style="width: 220px" @change="onLanguageChange">
            <el-option :label="t('settings.langZh')" value="zh-CN" />
            <el-option :label="t('settings.langEn')" value="en-US" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useThemeStore } from '../store/theme'
import { useLanguageStore } from '../store/language'
import { useI18n } from 'vue-i18n'

const themeStore = useThemeStore()
const languageStore = useLanguageStore()
const { currentTheme } = storeToRefs(themeStore)
const { t, locale } = useI18n()
const themeList = computed(() => themeStore.getAllThemes)
const currentThemeId = computed(() => currentTheme.value)

const langDraft = ref(languageStore.currentLanguage)

watch(
  () => languageStore.currentLanguage,
  (v) => {
    langDraft.value = v
  },
)

watch(locale, (v) => {
  langDraft.value = v
})

function onPickTheme(id) {
  themeStore.setTheme(id)
  ElMessage.success(t('settings.themeChanged'))
}

function onLanguageChange(val) {
  languageStore.setLanguage(val)
  // 立即更新 vue-i18n 的 locale
  locale.value = val
  ElMessage.success(t('settings.languageSaved'))
}
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 24px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.block {
  border-radius: 12px;
}

.block-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--app-text, #0f172a);
}

.desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.theme-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.theme-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 112px;
  padding: 16px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.theme-card:hover {
  border-color: var(--el-color-primary);
}

.theme-card.active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary);
}

.theme-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
}

.theme-name {
  font-size: 13px;
  color: var(--app-text, #334155);
}

.lang-form {
  max-width: 400px;
}

.hint {
  margin: 8px 0 0;
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}

.link-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}

:deep(.el-page-header) {
  margin-bottom: 4px;
}
</style>
