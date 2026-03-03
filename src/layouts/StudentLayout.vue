<template>
  <q-layout view="hHh lpr fff">
    <q-header class="student-header" elevated>
      <q-toolbar class="student-toolbar">

        <!-- Logo -->
        <q-btn flat no-caps to="/" class="q-pa-xs logo-link" style="min-height: unset">
          <img src="~assets/logo_rpa.png" style="height: 34px" />
        </q-btn>

        <!-- Breadcrumb sep -->
        <div class="breadcrumb-sep gt-xs">
          <q-icon name="chevron_right" size="18px" style="color: #d1d5db" />
          <span class="breadcrumb-label">Minha Área</span>
        </div>

        <q-space />

        <!-- User -->
        <div class="row items-center no-wrap" style="gap: 10px">
          <div class="gt-sm" style="text-align: right">
            <div class="user-name-text">{{ userName }}</div>
          </div>

          <q-avatar size="32px" color="primary" text-color="white" class="avatar-circle">
            <img v-if="authStore.user?.user_metadata?.avatar_url" :src="authStore.user.user_metadata.avatar_url" />
            <span v-else style="font-size: 12px; font-weight: 700">{{ userInitial }}</span>
          </q-avatar>

          <q-btn
            flat round dense
            icon="logout"
            size="sm"
            class="logout-btn"
            @click="logout"
          >
            <q-tooltip anchor="bottom middle" self="top middle" class="text-caption">Sair</q-tooltip>
          </q-btn>
        </div>

      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/authStore'
import { getAuthToken } from 'src/composables/useAuthToken'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const authStore = useAuthStore()
const router = useRouter()
const enrollments = ref([])

const userName = computed(() => {
  const meta = authStore.user?.user_metadata
  return meta?.full_name?.split(' ')[0] || authStore.user?.email?.split('@')[0] || 'Aluno'
})

const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

async function fetchEnrollments() {
  try {
    const token = await getAuthToken()
    if (!token) return
    const { data } = await axios.get(`${API}/api/me/enrollments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    enrollments.value = data
  } catch (err) {
    console.error('Erro ao carregar matrículas:', err)
  }
}

async function logout() {
  await authStore.logout()
  router.push('/')
}

onMounted(fetchEnrollments)
</script>

<style scoped>
.student-header {
  background: rgba(255, 255, 255, 0.97) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(3, 72, 148, 0.08);
  color: #1a2332 !important;
  box-shadow: 0 1px 12px rgba(3, 72, 148, 0.06) !important;
}

.student-toolbar {
  padding: 0 20px;
  height: 54px;
  min-height: 54px;
}

.logo-link {
  text-decoration: none;
  border-radius: 6px;
  transition: opacity 0.2s;
}
.logo-link:hover { opacity: 0.8; }

.breadcrumb-sep {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 6px;
}

.breadcrumb-label {
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.user-name-text {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  line-height: 1;
}

.avatar-circle {
  border: 2px solid rgba(3, 72, 148, 0.15);
}

.logout-btn {
  color: #9ca3af !important;
  transition: color 0.2s !important;
}
.logout-btn:hover {
  color: #ef4444 !important;
}
</style>
