import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from 'boot/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const pendingReturn = ref(null)

  async function init() {
    loading.value = true

    // Register BEFORE getSession so we don't miss the SIGNED_IN event
    // that fires when Supabase processes the OAuth redirect hash/code
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null

      if (event === 'SIGNED_IN') {
        const returnPath = localStorage.getItem('oauth_return')
        if (returnPath) {
          localStorage.removeItem('oauth_return')
          pendingReturn.value = returnPath
        }
      }
    })

    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    loading.value = false

    // Catch-all: if the session was already present when init ran
    // (e.g. the listener fired before being registered), check localStorage now
    if (data.session) {
      const returnPath = localStorage.getItem('oauth_return')
      if (returnPath) {
        localStorage.removeItem('oauth_return')
        pendingReturn.value = returnPath
      }
    }
  }

  async function loginWithLinkedIn(returnPath) {
    if (returnPath) localStorage.setItem('oauth_return', returnPath)
    await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: { redirectTo: `${window.location.origin}/` },
    })
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user
    return data
  }

  async function signup(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
  }

  return { user, loading, pendingReturn, init, login, signup, logout, loginWithLinkedIn }
})
