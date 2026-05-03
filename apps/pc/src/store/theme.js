import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: typeof localStorage !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light',
    themes: {
      light: {
        backgroundColor: '#f5f7fa',
        textColor: '#0f172a',
        primaryColor: '#b91c1c',
        secondaryColor: '#e2e8f0',
      },
      dark: {
        backgroundColor: '#0f172a',
        textColor: '#f1f5f9',
        primaryColor: '#f87171',
        secondaryColor: '#1e293b',
      },
      blue: {
        backgroundColor: '#eff6ff',
        textColor: '#0f172a',
        primaryColor: '#2563eb',
        secondaryColor: '#bfdbfe',
      },
      green: {
        backgroundColor: '#f0fdf4',
        textColor: '#0f172a',
        primaryColor: '#16a34a',
        secondaryColor: '#bbf7d0',
      },
    },
  }),

  getters: {
    getCurrentTheme: (state) => state.currentTheme,
    getThemeConfig: (state) => state.themes[state.currentTheme],
    getAllThemes: (state) =>
      Object.keys(state.themes).map((key) => ({
        id: key,
        primaryColor: state.themes[key].primaryColor,
      })),
  },

  actions: {
    setTheme(themeName) {
      if (this.themes[themeName]) {
        this.currentTheme = themeName
        localStorage.setItem('theme', themeName)
        this.applyTheme()
      }
    },

    applyTheme() {
      const theme = this.themes[this.currentTheme]
      const root = document.documentElement
      root.style.setProperty('--app-bg', theme.backgroundColor)
      root.style.setProperty('--app-text', theme.textColor)
      root.style.setProperty('--app-secondary', theme.secondaryColor)
      root.style.setProperty('--el-color-primary', theme.primaryColor)
      if (this.currentTheme === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    },

    initTheme() {
      this.applyTheme()
    },
  },
})
