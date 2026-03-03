import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const TOKEN_KEY = 'auth_token'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const role = ref(null)
  const loading = ref(true)
  const pendingReturn = ref(null)

  const isAdmin = computed(() => role.value === 'admin')
  const isLoggedIn = computed(() => !!user.value)

  async function init() {
    loading.value = true
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        const { data } = await axios.get(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        user.value = data.user
        role.value = data.role

        // Redirecionar para a página que o usuário estava antes do OAuth
        const returnPath = localStorage.getItem('oauth_return')
        if (returnPath) {
          localStorage.removeItem('oauth_return')
          pendingReturn.value = returnPath
        }
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      user.value = null
      role.value = null
    } finally {
      loading.value = false
    }
  }

  async function login(email, password) {
    const { data } = await axios.post(`${API}/api/auth/login`, { email, password })
    localStorage.setItem(TOKEN_KEY, data.access_token)
    user.value = data.user
    role.value = data.role
    return data
  }

  async function logout() {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      try {
        await axios.post(`${API}/api/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch { /* silencioso */ }
    }
    localStorage.removeItem(TOKEN_KEY)
    user.value = null
    role.value = null
  }

  // OAuth LinkedIn — URL gerada pelo backend, sem depender de VITE_SUPABASE_URL
  async function loginWithLinkedIn(returnPath) {
    if (returnPath) localStorage.setItem('oauth_return', returnPath)
    const { data } = await axios.get(`${API}/api/auth/linkedin/url`)
    window.location.href = data.url
  }

  async function signup(email, password, fullName) {
    const { supabase } = await import('boot/supabase')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    return data
  }

  return { user, role, loading, pendingReturn, isAdmin, isLoggedIn, init, login, logout, loginWithLinkedIn, signup }
})
