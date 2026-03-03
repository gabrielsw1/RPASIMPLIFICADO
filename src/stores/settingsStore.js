import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({
    courses_enabled: true,
    blog_enabled: true,
    login_enabled: true,
    maintenance_message: 'Esta seção está temporariamente indisponível. Volte em breve!',
  })
  const loaded = ref(false)

  async function init() {
    if (loaded.value) return
    try {
      const { data } = await axios.get(`${API}/api/settings`)
      settings.value = data
    } catch {
      // falha silenciosa — mantém padrão (tudo habilitado)
    } finally {
      loaded.value = true
    }
  }

  function reload() {
    loaded.value = false
    return init()
  }

  return { settings, loaded, init, reload }
})
